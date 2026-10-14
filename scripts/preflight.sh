#!/usr/bin/env bash
# Deploy preflight for the cPanel host. Run BEFORE uploading the new build.
#
# Usage: scripts/preflight.sh [BASE_URL]            (default: https://www.fwdpod.com)
#
# First upload deploy/preflight-probe/ (including its .htaccess) to
# public_html/_preflight/. This script then checks the conditions that would make
# the new .htaccess silently fail, or take the site down:
#
#   1. a proxy/CDN or non-Apache server answering in front of the origin
#   2. .htaccess not read at all, or a directive it uses not permitted
#   3. the origin not seeing HTTPS=on (the canonical 301 would loop forever)
#   4. %{DOCUMENT_ROOT} not being the site root; [R=404] / ErrorDocument unsupported
#
# Env:
#   CURL_OPTS   extra curl flags (e.g. --resolve for testing against a local server)
#   PROXY_MODE  set to 1 after swapping deploy/htaccess-behind-proxy.snippet into
#               public/.htaccess; X-Forwarded-Proto: https must then reach the origin
#
# Exits non-zero if any check fails.

set -uo pipefail

BASE_URL="${1:-https://www.fwdpod.com}"
BASE_URL="${BASE_URL%/}"
HOST="${BASE_URL#*://}"
HOST="${HOST%%/*}"
HOST="${HOST%%:*}"
DOMAIN="${HOST#www.}"
PROBE="$BASE_URL/_preflight"
read -r -a CURL_EXTRA <<< "${CURL_OPTS:-}"

failures=0
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

pass() { printf '  PASS  %s\n' "$1"; }
fail() { printf '  FAIL  %s\n' "$1"; failures=$((failures + 1)); }
note() { printf '  NOTE  %s\n' "$1"; }
section() { printf '\n== %s ==\n' "$1"; }
lower() { printf '%s' "$1" | tr '[:upper:]' '[:lower:]'; }

c() { curl -s --max-time 30 ${CURL_EXTRA[@]+"${CURL_EXTRA[@]}"} "$@"; }

# GET a probe file; sets p_code and p_body (first line, trimmed)
probe() {
  p_code="$(c -o "$tmp/body" -w '%{http_code}' "$PROBE/$1")"
  p_body="$(head -1 "$tmp/body" | tr -d '\r\n ')"
}

printf 'Deploy preflight for %s\n' "$BASE_URL"

# ── 1. What answers in front of the origin ──────────────────────────────────
section "1. What answers in front of the origin"
code="$(c -D "$tmp/raw-headers" -o /dev/null -w '%{http_code}' "$BASE_URL/")"
tr -d '\r' < "$tmp/raw-headers" > "$tmp/headers"
server="$(grep -i '^server:' "$tmp/headers" | head -1 | cut -d' ' -f2-)"
note "GET $BASE_URL/ -> HTTP $code, Server: ${server:-(none)}"

proxy_headers="$(grep -ioE '^(cf-ray|cf-cache-status|x-sucuri-id|x-sucuri-cache|x-akamai-transformed|akamai-grn|x-amz-cf-id|x-amz-cf-pop|x-fastly-request-id|x-served-by|x-cache|x-cdn|via|x-proxy-cache|x-nginx-cache):' "$tmp/headers" | tr -d ':' | tr '\n' ' ')"
if [ -n "$proxy_headers" ]; then
  fail "proxy/CDN response headers present: $proxy_headers"
else
  pass "no proxy/CDN response headers (cf-ray, via, x-cache, x-served-by, x-amz-cf-id, ...)"
fi

case "$(lower "$server")" in
  *apache*) pass "Server header is Apache" ;;
  *litespeed*) note "Server is LiteSpeed: it reads .htaccess, but trust the probe results below" ;;
  "" | *nginx* | *openresty* | *cloudflare* | *sucuri* | *cloudfront* | *varnish*)
    fail "Server header '${server:-none}' is not Apache: .htaccess may be ignored, or TLS may end at a proxy" ;;
  *) note "unrecognised Server header '$server': trust the probe results below" ;;
esac

if command -v nslookup >/dev/null 2>&1; then
  nameservers="$(nslookup -type=NS "$DOMAIN" 2>/dev/null | grep -i 'nameserver' | sed 's#.*= *##' | tr '\n' ' ')"
  note "nameservers for $DOMAIN: ${nameservers:-(lookup failed)}"
  case "$(lower "$nameservers")" in
    *cloudflare*) fail "DNS is on Cloudflare: with the proxy (orange cloud) on, %{HTTPS} is off at the origin" ;;
  esac
fi

if [ -z "${CURL_OPTS:-}" ] && command -v openssl >/dev/null 2>&1; then
  issuer="$(echo | openssl s_client -connect "$HOST:443" -servername "$HOST" 2>/dev/null | openssl x509 -noout -issuer 2>/dev/null)"
  note "TLS certificate ${issuer:-(could not read)}"
  case "$(lower "$issuer")" in
    *cloudflare*) fail "certificate is issued by Cloudflare: TLS terminates at the Cloudflare edge" ;;
  esac
fi

# ── 2. .htaccess probe ───────────────────────────────────────────────────────
section "2. .htaccess probe ($PROBE/)"
probe https.txt
probe_present=1
case "$p_code:$p_body" in
  200:https-on)
    pass "mod_rewrite runs from .htaccess and the origin sees HTTPS=on (canonical 301 will not loop)"
    ;;
  200:https-off)
    probe xfp.txt
    if [ "$p_body" = xfp-https ] && [ "${PROXY_MODE:-0}" = 1 ]; then
      pass "origin sees HTTPS=off but X-Forwarded-Proto: https arrives (PROXY_MODE=1, proxy-aware rule in use)"
    elif [ "$p_body" = xfp-https ]; then
      fail "origin sees HTTPS=off while the client used https: a TLS-terminating proxy is in front. The committed canonical 301 would loop. Swap in deploy/htaccess-behind-proxy.snippet, rebuild, re-run with PROXY_MODE=1"
    else
      fail "origin sees HTTPS=off and no X-Forwarded-Proto: https (got '$p_body'). Do not deploy the canonical 301 until you know how TLS reaches the origin"
    fi
    ;;
  200:htaccess-not-applied)
    fail "the probe's .htaccess was not applied: this server ignores .htaccess (nginx, or AllowOverride None). The 301 and 404 rules would silently do nothing"
    ;;
  500:*)
    fail "HTTP 500 from the probe: a directive is not permitted (AllowOverride lacks FileInfo). The site .htaccess would return 500 on every URL"
    ;;
  *)
    fail "probe not found (HTTP $p_code): upload deploy/preflight-probe/ to public_html/_preflight/ first, including its .htaccess"
    probe_present=0
    ;;
esac

if [ "$probe_present" = 1 ]; then
  probe docroot.txt
  if [ "$p_code:$p_body" = "200:docroot-ok" ]; then
    pass "%{DOCUMENT_ROOT} is the directory that contains _preflight (prerendered-page rule will match)"
  else
    fail "%{DOCUMENT_ROOT} check returned HTTP $p_code '$p_body': the site is not at the document root, so every page would 404"
  fi

  probe force-404
  if [ "$p_code:$p_body" = "404:errordocument-ok" ]; then
    pass "[R=404] is honoured and ErrorDocument is permitted (real 404s will work)"
  elif [ "$p_code" = 404 ]; then
    fail "[R=404] works but ErrorDocument did not serve the probe page (got '$p_body'): 404s would show the host's default page"
  else
    fail "[R=404] not honoured (HTTP $p_code): unmatched URLs would not return 404"
  fi
fi

# ── 3. Current live files (informational) ───────────────────────────────────
section "3. Files currently live (delete before upload, runbook step 2)"
for path in /index.html /sitemap.xml /assets/; do
  note "$path -> HTTP $(c -o /dev/null -w '%{http_code}' "$BASE_URL$path")"
done

printf '\n'
if [ "$failures" -eq 0 ]; then
  printf 'RESULT: PASS\n'
  exit 0
fi
printf 'RESULT: FAIL (%s check(s) failed) - do not upload\n' "$failures"
exit 1
