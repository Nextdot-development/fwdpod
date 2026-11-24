import { Building2, Database, FileCheck, FileLock, RefreshCw, ShieldCheck, type LucideIcon } from 'lucide-react';
import { SECURITY_TILES } from '../../content/company';
import { card } from './ui';

// One icon style (lucide line icons) across all six tiles, keyed by tile id
const ICONS: Record<string, LucideIcon> = {
  'own-code': FileCheck,
  nda: FileLock,
  data: Database,
  setup: Building2,
  replacement: RefreshCw,
  'safe-ai': ShieldCheck,
};

/**
 * The six security tiles, used on the homepage and /security so the wording
 * stays identical. 3 across on desktop, 2 on tablet, 1 on mobile.
 */
export default function SecurityTiles() {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {SECURITY_TILES.map(tile => {
        const Icon = ICONS[tile.id];
        return (
          <li key={tile.id} className={`${card} space-y-3`}>
            <Icon className="w-5 h-5 text-[#0066FF]" aria-hidden="true" />
            <h3 className="text-lg font-display font-medium tracking-tight text-[#0A0A0A]">{tile.title}</h3>
            <p className="text-sm text-[#555555] leading-relaxed">{tile.text}</p>
          </li>
        );
      })}
    </ul>
  );
}
