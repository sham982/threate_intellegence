'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Shield,
  Globe,
  Bug,
  AlertCircle,
  FileText,
  Settings,
  HelpCircle,
  ChevronDown,
  LayoutGrid,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
  disabled?: boolean;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: 'Main',
    items: [
      {
        id: 'overview',
        label: 'Overview',
        icon: <LayoutGrid className="h-4 w-4" />,
        href: '/dashboard',
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: <BarChart3 className="h-4 w-4" />,
        href: '/dashboard/analytics',
      },
    ],
  },
  {
    title: 'Threat Analysis',
    items: [
      {
        id: 'ip-check',
        label: 'IP Check',
        icon: <Shield className="h-4 w-4" />,
        href: '/dashboard?tab=ip',
      },
      {
        id: 'url-check',
        label: 'URL Check',
        icon: <Globe className="h-4 w-4" />,
        href: '/dashboard?tab=url',
      },
      {
        id: 'malware',
        label: 'Malware Analysis',
        icon: <Bug className="h-4 w-4" />,
        href: '/dashboard?tab=malware',
      },
      {
        id: 'cyber-threat',
        label: 'Cyber Threats',
        icon: <AlertCircle className="h-4 w-4" />,
        href: '/dashboard?tab=cyber-threat',
      },
    ],
  },
  {
    title: 'Reports & Data',
    items: [
      {
        id: 'reports',
        label: 'Reports',
        icon: <FileText className="h-4 w-4" />,
        href: '/dashboard/reports',
      },
    ],
  },
  {
    title: 'Configuration',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        icon: <Settings className="h-4 w-4" />,
        href: '/dashboard/settings',
      },
      {
        id: 'help',
        label: 'Help & Support',
        icon: <HelpCircle className="h-4 w-4" />,
        href: '/dashboard/help',
      },
    ],
  },
];

interface AppSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function AppSidebar({ isOpen = true, onToggle }: AppSidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href !== '/dashboard' && pathname.includes(href.split('?')[0])) return true;
    if (href.includes('?') && pathname === '/dashboard') {
      const tab = new URLSearchParams(href.split('?')[1]).get('tab');
      const currentTab = new URLSearchParams(window.location.search).get('tab');
      return tab === currentTab;
    }
    return false;
  };

  return (
    <aside
      className={cn(
        'fixed inset-y-14 left-0 z-30 border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 lg:translate-x-0 overflow-y-auto flex flex-col',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        expanded ? 'w-64' : 'w-20'
      )}
    >
      {/* Logo Section */}
      <div className="px-4 py-4 border-b border-sidebar-border flex items-center justify-between">
        {expanded && (
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg flex-1">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center text-sidebar-primary-foreground flex-shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <span className="truncate">SecCheck</span>
          </Link>
        )}
        {!expanded && (
          <Link href="/dashboard" className="w-full flex items-center justify-center">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center text-sidebar-primary-foreground">
              <Shield className="h-5 w-5" />
            </div>
          </Link>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded hover:bg-sidebar-accent/20 transition-colors"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', !expanded && 'rotate-180')} />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto">
        {SIDEBAR_SECTIONS.map((section) => (
          <div key={section.title} className="px-3 py-4">
            {expanded && (
              <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
            )}

            <div className="space-y-1">
              {section.items.map((item) => (
                <Link key={item.id} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? 'default' : 'ghost'}
                    className={cn(
                      'h-9 transition-all',
                      expanded ? 'w-full justify-start gap-2 px-3' : 'w-full justify-center',
                      isActive(item.href)
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-foreground'
                    )}
                    disabled={item.disabled}
                    title={!expanded ? item.label : undefined}
                  >
                    {item.icon}
                    {expanded && (
                      <>
                        <span className="flex-1 text-left text-sm">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Section */}
      <div className="border-t border-sidebar-border bg-sidebar p-3">
        {expanded && (
          <div className="bg-sidebar-accent/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-sidebar-foreground mb-2">API Usage</p>
            <div className="space-y-2">
              <div className="text-xs text-sidebar-foreground/70">
                <p>2,480 / 5,000 requests</p>
                <div className="w-full bg-sidebar-border rounded-full h-2 mt-1">
                  <div
                    className="bg-sidebar-primary h-2 rounded-full"
                    style={{ width: '49.6%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {!expanded && (
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-sidebar-accent/20 rounded-lg flex items-center justify-center">
              <span className="text-xs font-semibold text-sidebar-foreground">50%</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
