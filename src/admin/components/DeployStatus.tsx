import { useEffect, useState } from "react";
import { Rocket } from "lucide-react";
import { supabase } from "@admin/supabase/config";
import { timeAgo } from "@admin/utils/timezone";

interface DeployState {
  dirty: boolean;
  last_change_at: string | null;
  last_dispatch_at: string | null;
}

/**
 * Where the automatic rebuild stands, from public.deploy_state (written by the
 * cms_maybe_dispatch() cron job in 0002_auto_deploy.sql). Shows nothing until
 * that migration has been run.
 */
export function DeployStatus() {
  const [state, setState] = useState<DeployState | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      supabase
        .from("deploy_state")
        .select("dirty,last_change_at,last_dispatch_at")
        .eq("id", 1)
        .maybeSingle()
        .then(({ data }) => alive && setState((data as DeployState | null) ?? null));
    load();
    const t = setInterval(load, 30_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  if (!state) return null;
  const lastBuild = state.last_dispatch_at ? new Date(state.last_dispatch_at) : null;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface px-5 py-4 text-sm">
      <Rocket size={16} className="text-accent" />
      {state.dirty ? (
        <span className="text-amber-700">Changes waiting: the site rebuilds within a few minutes.</span>
      ) : (
        <span className="text-ink/70">The live site is up to date with the CMS.</span>
      )}
      <span className="ml-auto text-xs text-ink/40">
        {lastBuild ? `Last rebuild requested ${timeAgo(lastBuild)}` : "No rebuild requested yet"}
      </span>
    </div>
  );
}
