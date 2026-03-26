'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

const BREADCRUMB_MAP: Record<string, Breadcrumb[]> = {
  '/dashboard': [
    { label: 'Dashboard', href: '/dashboard' },
  ],
  '/dashboard/analytics': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Analytics', href: '/dashboard/analytics' },
  ],
  '/dashboard/reports': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Reports', href: '/dashboard/reports' },
  ],
  '/dashboard/settings': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/dashboard/settings' },
  ],
  '/dashboard/help': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Help & Support', href: '/dashboard/help' },
  ],
};

export function AppBreadcrumbs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  let breadcrumbs = BREADCRUMB_MAP[pathname] || [
    { label: 'Dashboard', href: '/dashboard' },
  ];

  // Add tab-specific breadcrumb if on dashboard with tab
  const tab = searchParams.get('tab');
  if (pathname === '/dashboard' && tab) {
    const tabLabels: Record<string, string> = {
      ip: 'IP Check',
      url: 'URL Check',
      malware: 'Malware Analysis',
      'cyber-threat': 'Cyber Threats',
    };
    breadcrumbs = [
      ...breadcrumbs,
      { label: tabLabels[tab] || tab, href: `/dashboard?tab=${tab}` },
    ];
  }

  return (
    <nav className="flex items-center gap-2 text-sm px-4 lg:px-6 py-3 border-b border-border bg-muted/30">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center gap-2">
          <Link
            href={breadcrumb.href}
            className={cn(
              'hover:text-foreground transition-colors',
              index === breadcrumbs.length - 1
                ? 'text-foreground font-medium'
                : 'text-muted-foreground'
            )}
          >
            {breadcrumb.icon && <span className="mr-1">{breadcrumb.icon}</span>}
            {breadcrumb.label}
          </Link>
          {index < breadcrumbs.length - 1 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      ))}
    </nav>
  );
}
