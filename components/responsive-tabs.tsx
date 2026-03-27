'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from './responsive-tabs.module.css';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface ResponsiveTabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

export function ResponsiveTabs({
  tabs,
  defaultTab,
  onChange,
}: ResponsiveTabsProps) {
  const activeTab = defaultTab || tabs[0]?.id;

  return (
    <div className={styles.tabsWrapper}>
      {tabs.map((tab, index) => (
        <div key={tab.id}>
          <input
            type="radio"
            name="responsive-tabs"
            id={`tab-${tab.id}`}
            className={styles.tabHead}
            defaultChecked={tab.id === activeTab}
            onChange={() => onChange?.(tab.id)}
          />
          <label htmlFor={`tab-${tab.id}`} className={styles.tabLabel}>
            {tab.label}
          </label>
        </div>
      ))}

      <div className={styles.tabBodyWrapper}>
        {tabs.map((tab) => (
          <div
            key={`content-${tab.id}`}
            id={`tab-content-${tab.id}`}
            className={styles.tabBody}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
