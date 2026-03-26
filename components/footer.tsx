'use client';

import { Separator } from '@/components/ui/separator';
import {
  getIPThreatSources,
  getURLThreatSources,
  getMalwareThreatSources,
  getCyberThreatSources,
} from '@/lib/threat-checker';

export function Footer() {
  const ipSources = getIPThreatSources();
  const urlSources = getURLThreatSources();
  const malwareSources = getMalwareThreatSources();
  const cyberSources = getCyberThreatSources();

  const categories = [
    {
      title: 'IP Threat Intelligence',
      sources: ipSources,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'URL & Domain Analysis',
      sources: urlSources,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Malware Analysis',
      sources: malwareSources,
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Cyber Threat Intelligence',
      sources: cyberSources,
      color: 'from-red-500 to-red-600',
    },
  ];

  return (
    <footer className="border-t border-border bg-card/30 backdrop-blur-sm mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-8 text-foreground">Threat Intelligence Sources</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <div key={category.title} className="space-y-4">
                <div className={`bg-gradient-to-r ${category.color} rounded-lg px-4 py-2 inline-block`}>
                  <h3 className="font-semibold text-white text-sm">{category.title}</h3>
                </div>
                
                <div className="space-y-2">
                  {category.sources.map((source) => (
                    <a
                      key={source.id}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block text-sm text-muted-foreground hover:text-foreground transition-colors py-1 hover:pl-1"
                    >
                      <span className="inline-block mr-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      {source.name}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>Threat Intelligence Checker - Comprehensive Security Analysis Platform</p>
          <p className="mt-4 md:mt-0">© 2024. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
