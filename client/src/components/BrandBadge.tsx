import badgeOption2 from '@assets/generated_images/Golden_coin_medallion_badge_6481ecad.png';

export default function BrandBadge() {
  return (
    <div className="flex items-center gap-3" data-testid="brand-badge">
      <div className="w-12 h-12 flex-shrink-0">
        <img 
          src={badgeOption2} 
          alt="VoxPlan Badge" 
          className="w-full h-full object-contain"
        />
      </div>
      
      <div 
        className="text-2xl leading-none font-black tracking-tight text-amber-600 dark:text-amber-500"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        VoxPlan Web-Mini
      </div>
    </div>
  );
}
