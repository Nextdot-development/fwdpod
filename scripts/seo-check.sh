#!/usr/bin/env bash
# SEO/AEO acceptance checks for the audit fixes (Tab 01 critical findings).
#
# Usage: scripts/seo-check.sh [BASE_URL]
#
#   BASE_URL       canonical origin (default: https://www.fwdpod.com)
#   APEX_URL       env: origin that must 301 to BASE_URL
#                  (default: BASE_URL without "www.")
#   BODY_SENTENCE  env: visible body copy that must be in the server HTML of /
#   CURL_OPTS      env: extra curl flags, e.g. for a local server:
#                  "--resolve www.fwdpod.com:443:127.0.0.1 --resolve fwdpod.com:443:127.0.0.1 -k"
#
# Exits non-zero if any check fails. Requires bash 4+, curl, and xmllint or
# python3 for XML validation.

set -uo pipefail

BASE_URL="${1:-https://www.fwdpod.com}"
BASE_URL="${BASE_URL%/}"
APEX_URL="${APEX_URL:-$(printf '%s' "$BASE_URL" | sed 's#://www[.]#://#')}"
BODY_SENTENCE="${BODY_SENTENCE:-Traditional consultancies operate by selling warm bodies}"
read -r -a CURL_EXTRA <<< "${CURL_OPTS:-}"

failures=0
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

pass() { printf '  PASS  %s\n' "$1"; }
fail() { printf '  FAIL  %s\n' "$1"; failures=$((failures + 1)); }
section() { printf '\n== %s ==\n' "$1"; }

# curl wrapper that tolerates an empty CURL_OPTS under `set -u`
c() { curl -s --max-time 30 ${CURL_EXTRA[@]+"${CURL_EXTRA[@]}"} "$@"; }

# GET a URL into $tmp/body and $tmp/headers; prints the status code
fetch() { c -D "$tmp/headers" -o "$tmp/body" -w '%{http_code}' "$1"; }
header() { grep -i "^$1:" "$tmp/headers" | head -1 | cut -d' ' -f2- | tr -d '\r'; }

count() { grep -o "$1" "$2" | wc -l | tr -d ' '; }
canonical_of() { grep -o '<link rel="canonical" href="[^"]*"' "$1" | sed -e 's#.*href="##' -e 's#"$##'; }

validate_xml() {
  if command -v xmllint >/dev/null 2>&1; then
    xmllint --noout "$1" 2>&1
  else
    local py
    for py in python3 python; do
      if "$py" -c 'import sys' >/dev/null 2>&1; then
        "$py" -c 'import sys, xml.dom.minidom as m; m.parse(sys.argv[1])' "$1" 2>&1
        return
      fi
    done
    echo "no xmllint or python available"
    return 2
  fi
}

printf 'SEO check against %s (apex %s)\n' "$BASE_URL" "$APEX_URL"

# ── Homepage server HTML ─────────────────────────────────────────────────────
section "Homepage server HTML"
code="$(fetch "$BASE_URL/")"
cp "$tmp/body" "$tmp/home.html"
[ "$code" = 200 ] && pass "GET / -> 200" || fail "GET / -> $code"

h1="$(count '<h1[ >]' "$tmp/home.html")"
[ "$h1" -eq 1 ] && pass "exactly one <h1> (found $h1)" || fail "expected exactly one <h1>, found $h1"

paras="$(count '<p[ >]' "$tmp/home.html")"
[ "$paras" -gt 0 ] && pass "<p> elements in server HTML ($paras)" || fail "no <p> elements in server HTML"

# Search only the app markup, with JSON-LD removed, so meta/schema text cannot
# satisfy it. Filtered into a file first: `grep -q` exiting on the first match
# would SIGPIPE the upstream sed and fail the pipeline under pipefail.
# Exact, case-sensitive match: GNU grep 3.0 (Git for Windows) aborts on -iF
# against the single long line of app markup.
sed -n '/<div id="root">/,$p' "$tmp/home.html" \
  | sed 's#<script type="application/ld+json">[^<]*</script>##g' > "$tmp/home-visible.html"
if grep -qF "$BODY_SENTENCE" "$tmp/home-visible.html"; then
  pass "visible body copy present: \"$BODY_SENTENCE\""
else
  fail "visible body copy missing: \"$BODY_SENTENCE\""
fi

anchors="$(count '<a [^>]*href="[^"]*"' "$tmp/home.html")"
header_links="$(grep -o '<header.*</header>' "$tmp/home.html" | grep -o '<a [^>]*href=' | wc -l | tr -d ' ')"
footer_links="$(grep -o '<footer.*</footer>' "$tmp/home.html" | grep -o '<a [^>]*href=' | wc -l | tr -d ' ')"
if [ "$anchors" -gt 0 ] && [ "$header_links" -gt 0 ] && [ "$footer_links" -gt 0 ]; then
  pass "<a href> anchors: $anchors total (header $header_links, footer $footer_links)"
else
  fail "<a href> anchors: $anchors total (header $header_links, footer $footer_links)"
fi

if grep -qi '<meta name="keywords"' "$tmp/home.html"; then
  fail "meta keywords tag present on /"
else
  pass "no meta keywords tag on /"
fi

home_canonical="$(canonical_of "$tmp/home.html")"
[ "$home_canonical" = "$BASE_URL/" ] && pass "canonical is $BASE_URL/" || fail "canonical is '$home_canonical'"

# ── Canonical host redirects ─────────────────────────────────────────────────
section "Canonical host redirects"
check_redirect() {
  local from="$1" to="$2" code location hops
  code="$(c -o /dev/null -D "$tmp/redirect" -w '%{http_code}' "$from")"
  location="$(grep -i '^location:' "$tmp/redirect" | head -1 | cut -d' ' -f2- | tr -d '\r')"
  hops="$(c -L -o /dev/null -w '%{num_redirects}' "$from")"
  if [ "$code" = 301 ] && [ "$location" = "$to" ] && [ "$hops" = 1 ]; then
    pass "$from -> 301 $to (1 hop)"
  else
    fail "$from -> $code '${location}' ($hops hops), expected 301 $to in 1 hop"
  fi
}
check_redirect "$APEX_URL/" "$BASE_URL/"
check_redirect "$APEX_URL/some/path?q=1" "$BASE_URL/some/path?q=1"
check_redirect "${BASE_URL/https:/http:}/" "$BASE_URL/"
check_redirect "${APEX_URL/https:/http:}/" "$BASE_URL/"

# ── Not-found handling ───────────────────────────────────────────────────────
section "Not-found handling"
missing="/seo-check-missing-$RANDOM$RANDOM"
code="$(fetch "$BASE_URL$missing")"
[ "$code" = 404 ] && pass "GET $missing -> 404" || fail "GET $missing -> $code (soft 404?)"
grep -q 'noindex' "$tmp/body" && pass "404 page is noindex" || fail "404 page is not noindex"

# ── robots.txt ───────────────────────────────────────────────────────────────
section "robots.txt"
code="$(fetch "$BASE_URL/robots.txt")"
tr -d '\r' < "$tmp/body" > "$tmp/robots.txt"
[ "$code" = 200 ] && pass "GET /robots.txt -> 200" || fail "GET /robots.txt -> $code"
case "$(header content-type)" in text/plain*) pass "content-type text/plain" ;; *) fail "content-type '$(header content-type)'" ;; esac
grep -qx "Sitemap: $BASE_URL/sitemap.xml" "$tmp/robots.txt" && pass "declares Sitemap: $BASE_URL/sitemap.xml" || fail "no Sitemap: $BASE_URL/sitemap.xml line"
[ "$(grep -ci '^user-agent:' "$tmp/robots.txt")" -gt 0 ] && pass "has User-agent groups" || fail "no User-agent groups"
grep -qi '^crawl-delay' "$tmp/robots.txt" && fail "Crawl-delay present" || pass "no Crawl-delay"

# ── llms.txt ─────────────────────────────────────────────────────────────────
section "llms.txt"
code="$(fetch "$BASE_URL/llms.txt")"
cp "$tmp/body" "$tmp/llms.txt"
[ "$code" = 200 ] && pass "GET /llms.txt -> 200" || fail "GET /llms.txt -> $code"
case "$(header content-type)" in text/plain* | text/markdown*) pass "content-type $(header content-type)" ;; *) fail "content-type '$(header content-type)' (soft 404?)" ;; esac
head -1 "$tmp/llms.txt" | grep -q '^# ' && pass "starts with a markdown H1" || fail "does not start with '# '"
while IFS= read -r url; do
  code="$(c -o /dev/null -w '%{http_code}' "$url")"
  [ "$code" = 200 ] && pass "llms.txt link $url -> 200" || fail "llms.txt link $url -> $code"
done < <(grep -o "$BASE_URL[^) ]*" "$tmp/llms.txt" | sort -u)
todos="$(grep -c 'TODO(' "$tmp/llms.txt" || true)"
[ "$todos" -gt 0 ] && printf '  NOTE  llms.txt still has %s TODO marker(s)\n' "$todos"

# ── sitemap.xml and every URL in it ──────────────────────────────────────────
section "sitemap.xml"
code="$(fetch "$BASE_URL/sitemap.xml")"
cp "$tmp/body" "$tmp/sitemap.xml"
[ "$code" = 200 ] && pass "GET /sitemap.xml -> 200" || fail "GET /sitemap.xml -> $code"
if xml_errors="$(validate_xml "$tmp/sitemap.xml")"; then pass "valid XML"; else fail "invalid XML: $xml_errors"; fi

mapfile -t locs < <(grep -o '<loc>[^<]*</loc>' "$tmp/sitemap.xml" | sed -e 's#<loc>##' -e 's#</loc>##')
[ "${#locs[@]}" -gt 0 ] && pass "${#locs[@]} URLs listed" || fail "no <loc> entries"

declare -A title_owner=() description_owner=()
page_problems=0
for loc in "${locs[@]}"; do
  problems=()
  case "$loc" in "$BASE_URL"/*) ;; *) problems+=("not on $BASE_URL") ;; esac
  case "$loc" in "$BASE_URL/") ;; */) problems+=("trailing slash") ;; esac
  code="$(fetch "$loc")"
  [ "$code" = 200 ] || problems+=("status $code")
  [ "$(canonical_of "$tmp/body")" = "$loc" ] || problems+=("canonical '$(canonical_of "$tmp/body")'")
  grep -q 'noindex' "$tmp/body" && problems+=("noindex")
  [ "$(count '<h1[ >]' "$tmp/body")" -eq 1 ] || problems+=("$(count '<h1[ >]' "$tmp/body") <h1>")
  grep -qi '<meta name="keywords"' "$tmp/body" && problems+=("meta keywords")

  title="$(grep -o '<title>[^<]*</title>' "$tmp/body" | head -1)"
  description="$(grep -o '<meta name="description" content="[^"]*"' "$tmp/body" | head -1)"
  [ -n "$title" ] || problems+=("no <title>")
  [ -n "$description" ] || problems+=("no meta description")
  if [ -n "$title" ] && [ -n "${title_owner[$title]+x}" ]; then problems+=("title duplicates ${title_owner[$title]}"); else title_owner[$title]="$loc"; fi
  if [ -n "$description" ] && [ -n "${description_owner[$description]+x}" ]; then problems+=("description duplicates ${description_owner[$description]}"); else description_owner[$description]="$loc"; fi

  if [ "${#problems[@]}" -gt 0 ]; then
    fail "$loc: $(IFS='; '; echo "${problems[*]}")"
    page_problems=$((page_problems + 1))
  fi
done
[ "$page_problems" -eq 0 ] && pass "all sitemap URLs: 200, self-canonical on $BASE_URL, indexable, one <h1>, unique title and description, no meta keywords"

# ── Link graph ───────────────────────────────────────────────────────────────
section "Link graph (following <a href> only, from /)"
declare -A seen=(["/"]=1)
queue=("/")
while [ "${#queue[@]}" -gt 0 ]; do
  path="${queue[0]}"
  queue=("${queue[@]:1}")
  fetch "$BASE_URL$path" >/dev/null
  while IFS= read -r href; do
    href="${href%%#*}"
    href="${href%%\?*}"
    [ -n "$href" ] || continue
    if [ -z "${seen[$href]+x}" ]; then
      seen[$href]=1
      queue+=("$href")
    fi
  done < <(grep -o '<a [^>]*href="/[^"]*"' "$tmp/body" | sed 's#.*href="##; s#"$##' | grep -v '^//')
done
unreachable=0
for loc in "${locs[@]}"; do
  path="${loc#"$BASE_URL"}"
  if [ -z "${seen[$path]+x}" ]; then
    fail "sitemap URL not reachable by links from /: $loc"
    unreachable=$((unreachable + 1))
  fi
done
[ "$unreachable" -eq 0 ] && pass "all ${#locs[@]} sitemap URLs reachable via <a href> from / (${#seen[@]} internal paths found)"

# ── Result ───────────────────────────────────────────────────────────────────
printf '\n'
if [ "$failures" -eq 0 ]; then
  printf 'RESULT: PASS\n'
  exit 0
fi
printf 'RESULT: FAIL (%s check(s) failed)\n' "$failures"
exit 1
