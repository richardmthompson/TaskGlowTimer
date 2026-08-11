import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { applyTheme, getStoredTheme, toggleTheme, type Theme } from '@/lib/theme';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const initialTheme = getStoredTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const handleToggle = () => {
    setTheme(toggleTheme(theme));
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      data-testid="button-theme-toggle"
      title="Toggle theme (Shift+M)"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
}
