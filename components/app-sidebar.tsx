'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Shield,
  Globe,
  Virus,
  AlertCircle,
  FileText,
  Settings,
  HelpCircle,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

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
        icon: <Virus className="h-4 w-4" />,
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
}

export function AppSidebar({ isOpen = true }: AppSidebarProps) {
  const pathname = usePathname();

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
        'fixed inset-y-14 left-0 z-30 w-64 border-r border-border bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0 overflow-y-auto',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Logo Section */}
      <div className="px-6 py-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center text-sidebar-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <span>SecCheck</span>
        </Link>
      </div>

      {/* Navigation Sections */}
      {SIDEBAR_SECTIONS.map((section) => (
        <div key={section.title} className="px-3 py-4">
          <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-3">
            {section.title}
          </h3>

          <div className="space-y-1">
            {section.items.map((item) => (
              <Link key={item.id} href={item.href}>
                <Button
                  variant={isActive(item.href) ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-2 h-9 px-3',
                    isActive(item.href)
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-foreground'
                  )}
                  disabled={item.disabled}
                >
                  {item.icon}
                  <span className="flex-1 text-left text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Footer Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border bg-sidebar p-4">
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
      </div>
    </aside>
  );
}
