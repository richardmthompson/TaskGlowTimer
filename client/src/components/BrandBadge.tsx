import badgeOption1 from '@assets/generated_images/Golden_NES_power-up_badge_6da36c0b.png';
import badgeOption2 from '@assets/generated_images/Golden_coin_medallion_badge_6481ecad.png';
import badgeOption3 from '@assets/generated_images/Pixel-art_gear_badge_65aa7cca.png';
import badgeOption4 from '@assets/generated_images/Trophy_achievement_badge_13de084e.png';

export default function BrandBadge() {
  // Choose which badge design to use (1-4)
  const selectedBadge = 1;
  
  const badgeImages = [badgeOption1, badgeOption2, badgeOption3, badgeOption4];
  const currentBadge = badgeImages[selectedBadge - 1];

  return (
    <div className="flex items-center gap-3" data-testid="brand-badge">
      <div className="w-12 h-12 flex-shrink-0">
        <img 
          src={currentBadge} 
          alt="VoxPlan Badge" 
          className="w-full h-full object-contain"
        />
      </div>
      
      <div 
        className="text-[48px] leading-[48px] font-black tracking-tight text-amber-600 dark:text-amber-500"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        VoxPlan Web-Mini
      </div>
    </div>
  );
}
