import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="w-40" data-testid="select-theme">
        <SelectValue placeholder="Select theme">
          <div className="flex items-center gap-2">
            {theme === 'light' && <Sun className="w-4 h-4" />}
            {theme === 'dark' && <Moon className="w-4 h-4" />}
            {theme === 'system' && <Monitor className="w-4 h-4" />}
            <span className="capitalize">{theme}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4" />
            Light
          </div>
        </SelectItem>
        <SelectItem value="dark">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4" />
            Dark
          </div>
        </SelectItem>
        <SelectItem value="system">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            System
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

export function QuickThemeToggle() {
  const { actualTheme, setTheme } = useTheme();

  return (
    <div className="relative flex items-center bg-gray-200 dark:bg-gray-800 rounded-lg p-1 overflow-hidden">

      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme('light')}
        className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-2 h-auto text-xs transition-colors duration-75 border-0 shadow-none hover:bg-transparent hover:text-current ${
          actualTheme === 'light' 
            ? 'bg-gray-800 text-white font-medium hover:bg-gray-800 hover:text-white' 
            : 'text-muted-foreground bg-transparent hover:bg-transparent hover:text-muted-foreground'
        } flex-[1.2]`}
        data-testid="button-theme-light"
      >
        <Sun className={`h-3.5 w-3.5 transition-all duration-75 ${
          actualTheme === 'light' ? 'scale-110' : 'scale-100'
        }`} />
        Light
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme('dark')}
        className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-2 h-auto text-xs transition-colors duration-75 border-0 shadow-none hover:bg-transparent hover:text-current ${
          actualTheme === 'dark' 
            ? 'bg-gray-200 text-black font-medium hover:bg-gray-200 hover:text-black' 
            : 'text-muted-foreground bg-transparent hover:bg-transparent hover:text-muted-foreground'
        } flex-[0.8]`}
        data-testid="button-theme-dark"
      >
        <Moon className={`h-3.5 w-3.5 transition-all duration-75 ${
          actualTheme === 'dark' ? 'scale-110' : 'scale-100'
        }`} />
        Dark
      </Button>
    </div>
  );
}

export function SidebarThemeToggle({ expanded }: { expanded: boolean }) {
  const { actualTheme, setTheme } = useTheme();

  if (!expanded) {
    return (
      <Button
        variant="ghost"
        onClick={() => setTheme(actualTheme === 'light' ? 'dark' : 'light')}
        className={`w-10 h-10 flex justify-center items-center p-0 rounded-lg sidebar-collapsed-button ${
          actualTheme === 'light' 
            ? 'bg-gray-800 text-white hover:bg-gray-800 hover:text-white' 
            : 'bg-gray-200 text-black hover:bg-gray-200 hover:text-black'
        }`}
        data-testid="button-toggle-theme-collapsed"
      >
        {actualTheme === 'light' ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return <QuickThemeToggle />;
}
