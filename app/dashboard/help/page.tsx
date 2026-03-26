import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Mail, Book, Play } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'How do I check an IP address?',
    answer: 'Navigate to the IP Check tab, enter your IP address, and click "Check IP". The system will query multiple threat intelligence sources and provide a comprehensive report.',
  },
  {
    question: 'What threat sources are included?',
    answer: 'We integrate with 50+ threat intelligence platforms including VirusTotal, AbuseIPDB, AlienVault OTX, Shodan, and many others for comprehensive coverage.',
  },
  {
    question: 'How often is threat data updated?',
    answer: 'Our threat databases are updated in real-time from various sources. Most data is refreshed hourly for maximum accuracy.',
  },
  {
    question: 'Can I generate custom reports?',
    answer: 'Yes! Use the Reports section to generate executive, technical, or detailed reports. You can customize the format and content before downloading.',
  },
  {
    question: 'What is the API rate limit?',
    answer: 'Free tier includes 5,000 API requests per month. Premium tiers offer higher limits. Check your dashboard for current usage.',
  },
  {
    question: 'How do I export my data?',
    answer: 'In the Settings section, you can export all your data in JSON, CSV, or Excel format. You can also schedule automatic exports.',
  },
];

const RESOURCES = [
  {
    title: 'API Documentation',
    description: 'Complete guide to our REST API for programmatic access',
    icon: <Book className="h-5 w-5" />,
  },
  {
    title: 'Video Tutorials',
    description: 'Learn how to use SecCheck with step-by-step video guides',
    icon: <Play className="h-5 w-5" />,
  },
  {
    title: 'Best Practices',
    description: 'Security and threat intelligence best practices guide',
    icon: <Book className="h-5 w-5" />,
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-8 p-4 lg:p-6 max-w-4xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">Find answers and get support</p>
      </div>

      {/* Quick Support */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 cursor-pointer hover:bg-muted/50 transition-colors">
          <MessageCircle className="h-6 w-6 text-primary mb-3" />
          <h3 className="font-semibold mb-1">Live Chat</h3>
          <p className="text-sm text-muted-foreground">Chat with our support team</p>
        </Card>
        <Card className="p-6 cursor-pointer hover:bg-muted/50 transition-colors">
          <Mail className="h-6 w-6 text-primary mb-3" />
          <h3 className="font-semibold mb-1">Email Support</h3>
          <p className="text-sm text-muted-foreground">support@seccheck.io</p>
        </Card>
        <Card className="p-6 cursor-pointer hover:bg-muted/50 transition-colors">
          <Book className="h-6 w-6 text-primary mb-3" />
          <h3 className="font-semibold mb-1">Documentation</h3>
          <p className="text-sm text-muted-foreground">Browse knowledge base</p>
        </Card>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Search Help Articles</label>
        <Input
          placeholder="Search for help articles..."
          className="w-full"
        />
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <Card key={index} className="p-4 cursor-pointer hover:bg-muted/50 transition-colors group">
              <details className="space-y-2">
                <summary className="font-semibold cursor-pointer">
                  {item.question}
                </summary>
                <p className="text-sm text-muted-foreground pt-2">
                  {item.answer}
                </p>
              </details>
            </Card>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RESOURCES.map((resource, index) => (
            <Card key={index} className="p-6 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="text-primary mb-3">{resource.icon}</div>
              <h3 className="font-semibold mb-1">{resource.title}</h3>
              <p className="text-sm text-muted-foreground">{resource.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-2">Still need help?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Our support team is available 24/7 to help you with any questions or issues.
        </p>
        <Button>Contact Support</Button>
      </Card>
    </div>
  );
}
