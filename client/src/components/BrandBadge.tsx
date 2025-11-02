import { Settings } from "lucide-react";

export default function BrandBadge() {
  return (
    <div className="flex flex-col items-center gap-1">
      <div 
        className="relative flex items-center justify-center px-3 py-2 rounded-md border-[3px] border-amber-900 dark:border-amber-700 shadow-lg"
        style={{
          background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
        }}
        data-testid="brand-badge"
      >
        <div className="absolute inset-0 rounded-md bg-white/20 dark:bg-white/10" />
        
        <div className="relative flex items-center gap-1.5">
          <span className="text-lg font-black text-amber-950 dark:text-amber-950" style={{ fontFamily: 'monospace' }}>
            VP
          </span>
          <Settings className="w-4 h-4 text-amber-950 dark:text-amber-950" strokeWidth={3} />
        </div>
      </div>
      
      <div className="text-[10px] font-bold text-muted-foreground tracking-tight">
        VoxPlan Web-Mini
      </div>
    </div>
  );
}
