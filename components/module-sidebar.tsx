'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ModuleType = 'ip' | 'url' | 'malware' | 'cyber-threat';

interface ModuleSidebarProps {
  activeModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
}

const MODULES = [
  {
    id: 'ip' as ModuleType,
    label: 'IP Check',
    icon: '🌐',
    description: 'Check IP addresses',
  },
  {
    id: 'url' as ModuleType,
    label: 'URL Check',
    icon: '🔗',
    description: 'Check web URLs',
  },
  {
    id: 'malware' as ModuleType,
    label: 'Malware Analysis',
    icon: '🦠',
    description: 'Analyze file hashes',
  },
  {
    id: 'cyber-threat' as ModuleType,
    label: 'Cyber Threat Intel',
    icon: '🎯',
    description: 'Search threat feeds',
  },
];

export function ModuleSidebar({ activeModule, onModuleChange }: ModuleSidebarProps) {
  return (
    <div className="w-full md:w-64 space-y-2">
      <div className="px-4 py-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Threat Modules
        </h2>
      </div>

      {MODULES.map((module) => (
        <Button
          key={module.id}
          variant={activeModule === module.id ? 'default' : 'outline'}
          className={cn(
            'w-full justify-start gap-3 h-auto py-3 px-4',
            activeModule === module.id && 'bg-accent text-accent-foreground'
          )}
          onClick={() => onModuleChange(module.id)}
        >
          <span className="text-lg">{module.icon}</span>
          <div className="flex-1 text-left">
            <div className="font-semibold text-sm">{module.label}</div>
            <div className="text-xs opacity-70">{module.description}</div>
          </div>
        </Button>
      ))}
    </div>
  );
}
