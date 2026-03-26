'use client';

import { useState } from 'react';
import { Plus, Upload, FileText, MoreVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface FloatingAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'outline';
}

interface FloatingActionBarProps {
  actions?: FloatingAction[];
  onNewCheck?: () => void;
  onBulkUpload?: () => void;
  onGenerateReport?: () => void;
}

export function FloatingActionBar({
  actions = [],
  onNewCheck,
  onBulkUpload,
  onGenerateReport,
}: FloatingActionBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultActions: FloatingAction[] = [
    {
      id: 'new-check',
      label: 'New Check',
      icon: <Plus className="h-4 w-4" />,
      onClick: onNewCheck || (() => {}),
    },
    {
      id: 'bulk-upload',
      label: 'Bulk Upload',
      icon: <Upload className="h-4 w-4" />,
      onClick: onBulkUpload || (() => {}),
    },
    {
      id: 'generate-report',
      label: 'Generate Report',
      icon: <FileText className="h-4 w-4" />,
      onClick: onGenerateReport || (() => {}),
    },
  ];

  const finalActions = actions.length > 0 ? actions : defaultActions;

  return (
    <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-3 items-end">
      {/* Secondary Actions */}
      {isOpen && (
        <div className="flex flex-col gap-3 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {finalActions.slice(1).map((action) => (
            <div key={action.id} className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground bg-background border border-border rounded-lg px-3 py-1.5 shadow-lg">
                {action.label}
              </span>
              <Button
                size="icon"
                variant="outline"
                className="h-10 w-10 rounded-full shadow-lg"
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
              >
                {action.icon}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Primary Action */}
      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg"
        onClick={() => {
          if (!isOpen && finalActions.length > 1) {
            setIsOpen(true);
          } else if (isOpen) {
            setIsOpen(false);
          } else {
            finalActions[0].onClick();
          }
        }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>

      {/* Tooltip */}
      {!isOpen && (
        <div className="text-xs font-medium text-muted-foreground">
          Quick Actions
        </div>
      )}
    </div>
  );
}
