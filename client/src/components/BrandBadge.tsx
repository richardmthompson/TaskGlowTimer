import { useState } from 'react';
import badgeOption1 from '@assets/generated_images/Golden_NES_power-up_badge_6da36c0b.png';
import badgeOption2 from '@assets/generated_images/Golden_coin_medallion_badge_6481ecad.png';
import badgeOption3 from '@assets/generated_images/Pixel-art_gear_badge_65aa7cca.png';
import badgeOption4 from '@assets/generated_images/Trophy_achievement_badge_13de084e.png';

export default function BrandBadge() {
  const [selectedBadge, setSelectedBadge] = useState(1);
  
  const badgeImages = [
    { id: 1, src: badgeOption1, name: 'Power-Up Star' },
    { id: 2, src: badgeOption2, name: 'Gold Coin' },
    { id: 3, src: badgeOption3, name: 'Gear Badge' },
    { id: 4, src: badgeOption4, name: 'Trophy Shield' }
  ];
  
  const currentBadge = badgeImages[selectedBadge - 1];

  return (
    <div className="flex flex-col gap-3" data-testid="brand-badge">
      {/* Main badge display */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 flex-shrink-0">
          <img 
            src={currentBadge.src} 
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
      
      {/* Badge selector - preview all 4 options */}
      <div className="flex gap-2 items-center bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border">
        <span className="text-xs font-semibold text-muted-foreground mr-2">Pick a badge:</span>
        {badgeImages.map((badge) => (
          <button
            key={badge.id}
            onClick={() => setSelectedBadge(badge.id)}
            className={`w-10 h-10 p-1.5 rounded-md border-2 transition-all hover-elevate ${
              selectedBadge === badge.id 
                ? 'border-amber-500 bg-amber-500/10 scale-110' 
                : 'border-border/50'
            }`}
            data-testid={`badge-option-${badge.id}`}
            title={badge.name}
          >
            <img 
              src={badge.src} 
              alt={badge.name}
              className="w-full h-full object-contain"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
