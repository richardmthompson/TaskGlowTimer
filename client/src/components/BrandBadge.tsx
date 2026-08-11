import badgeOption2 from '@assets/generated_images/Golden_coin_medallion_badge_6481ecad.png';

/**
 * Masthead: the app's single display moment. Kicker / wordmark / accent rule /
 * sub, with the coin badge riding the wordmark line.
 */
export default function BrandBadge() {
  return (
    <div data-testid="brand-badge">
      <div className="font-mono text-[10px] font-medium uppercase tracking-kicker text-muted-foreground">
        Advanced Productivity Instrument
      </div>
      <div className="flex items-end gap-3 mt-1">
        <h1 className="font-display font-black uppercase tracking-tight leading-none text-4xl text-foreground">
          VoxPlan
        </h1>
        <div className="w-9 h-9 flex-shrink-0 border-thin border-border bg-primary rounded-code shadow-neo-sm flex items-center justify-center overflow-hidden mb-0.5">
          <img
            src={badgeOption2}
            alt="VoxPlan badge"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      <div className="h-1 w-16 bg-primary rounded-sm mt-2" aria-hidden="true" />
      <div className="font-mono italic text-[11px] text-muted-foreground mt-2">
        plan the work · work the plan
      </div>
    </div>
  );
}
