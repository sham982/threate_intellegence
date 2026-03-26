/**
 * Notification Service - Handles alerts, webhooks, and multi-channel notifications
 */

export interface NotificationRule {
  id: string;
  name: string;
  enabled: boolean;
  condition: {
    riskLevel?: 'high' | 'medium' | 'low' | 'safe';
    minRiskScore?: number;
    checkTypes?: string[];
  };
  channels: NotificationChannel[];
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  config: Record<string, unknown>;
  enabled: boolean;
}

export interface Alert {
  id: string;
  ruleId: string;
  trigger: {
    checkType: string;
    query: string;
    riskScore: number;
    riskLevel: string;
  };
  createdAt: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed';
}

class NotificationService {
  private rules: Map<string, NotificationRule> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private webhookQueue: Alert[] = [];

  /**
   * Create or update a notification rule
   */
  setRule(rule: NotificationRule): void {
    this.rules.set(rule.id, rule);
    this.persistRules();
  }

  /**
   * Get a notification rule
   */
  getRule(ruleId: string): NotificationRule | undefined {
    return this.rules.get(ruleId);
  }

  /**
   * Get all notification rules
   */
  getAllRules(): NotificationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Delete a notification rule
   */
  deleteRule(ruleId: string): void {
    this.rules.delete(ruleId);
    this.persistRules();
  }

  /**
   * Check if an alert should be triggered based on rules
   */
  evaluateAlert(check: {
    type: string;
    query: string;
    riskScore: number;
    riskLevel: string;
  }): NotificationRule[] {
    const matchingRules: NotificationRule[] = [];

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      const { condition } = rule;

      // Check risk level
      if (condition.riskLevel && check.riskLevel !== condition.riskLevel) {
        continue;
      }

      // Check minimum risk score
      if (condition.minRiskScore && check.riskScore < condition.minRiskScore) {
        continue;
      }

      // Check check types
      if (condition.checkTypes && !condition.checkTypes.includes(check.type)) {
        continue;
      }

      matchingRules.push(rule);
    }

    return matchingRules;
  }

  /**
   * Send notification through a specific channel
   */
  async sendNotification(
    channel: NotificationChannel,
    alert: Alert,
    rule: NotificationRule
  ): Promise<boolean> {
    try {
      switch (channel.type) {
        case 'email':
          return await this.sendEmail(channel, alert, rule);
        case 'slack':
          return await this.sendSlack(channel, alert, rule);
        case 'webhook':
          return await this.sendWebhook(channel, alert, rule);
        case 'sms':
          return await this.sendSMS(channel, alert, rule);
        default:
          return false;
      }
    } catch (error) {
      console.error(`Failed to send ${channel.type} notification:`, error);
      return false;
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(
    channel: NotificationChannel,
    alert: Alert,
    rule: NotificationRule
  ): Promise<boolean> {
    const email = channel.config.email as string;
    const subject = `SecCheck Alert: ${alert.trigger.riskLevel.toUpperCase()} threat detected`;
    const body = `
      Rule: ${rule.name}
      Type: ${alert.trigger.checkType}
      Query: ${alert.trigger.query}
      Risk Score: ${alert.trigger.riskScore}/100
      Risk Level: ${alert.trigger.riskLevel}
      Time: ${new Date().toISOString()}
    `;

    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`Email to ${email}:`, subject, body);
    return true;
  }

  /**
   * Send Slack notification
   */
  private async sendSlack(
    channel: NotificationChannel,
    alert: Alert,
    rule: NotificationRule
  ): Promise<boolean> {
    const webhookUrl = channel.config.webhookUrl as string;

    const payload = {
      text: `SecCheck Alert: ${alert.trigger.riskLevel.toUpperCase()} threat detected`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${alert.trigger.riskLevel.toUpperCase()} Risk Alert`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Rule:*\n${rule.name}`,
            },
            {
              type: 'mrkdwn',
              text: `*Type:*\n${alert.trigger.checkType}`,
            },
            {
              type: 'mrkdwn',
              text: `*Query:*\n${alert.trigger.query}`,
            },
            {
              type: 'mrkdwn',
              text: `*Risk Score:*\n${alert.trigger.riskScore}/100`,
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return response.ok;
    } catch (error) {
      console.error('Slack notification failed:', error);
      return false;
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhook(
    channel: NotificationChannel,
    alert: Alert,
    rule: NotificationRule
  ): Promise<boolean> {
    const webhookUrl = channel.config.url as string;

    const payload = {
      event: 'threat_alert',
      rule: rule.name,
      alert: {
        id: alert.id,
        type: alert.trigger.checkType,
        query: alert.trigger.query,
        riskScore: alert.trigger.riskScore,
        riskLevel: alert.trigger.riskLevel,
        timestamp: alert.createdAt.toISOString(),
      },
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return response.ok;
    } catch (error) {
      console.error('Webhook notification failed:', error);
      return false;
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(
    channel: NotificationChannel,
    alert: Alert,
    rule: NotificationRule
  ): Promise<boolean> {
    const phoneNumber = channel.config.phoneNumber as string;
    const message = `SecCheck: ${alert.trigger.riskLevel.toUpperCase()} threat detected on ${alert.trigger.checkType}. Risk: ${alert.trigger.riskScore}/100`;

    // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log(`SMS to ${phoneNumber}:`, message);
    return true;
  }

  /**
   * Create an alert
   */
  createAlert(
    ruleId: string,
    trigger: Alert['trigger']
  ): Alert {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random()}`,
      ruleId,
      trigger,
      createdAt: new Date(),
      status: 'pending',
    };

    this.alerts.set(alert.id, alert);
    return alert;
  }

  /**
   * Get alert by ID
   */
  getAlert(alertId: string): Alert | undefined {
    return this.alerts.get(alertId);
  }

  /**
   * Get all alerts
   */
  getAllAlerts(filter?: { status?: Alert['status']; ruleId?: string }): Alert[] {
    const alerts = Array.from(this.alerts.values());

    if (filter?.status) {
      alerts = alerts.filter((a) => a.status === filter.status);
    }
    if (filter?.ruleId) {
      alerts = alerts.filter((a) => a.ruleId === filter.ruleId);
    }

    return alerts;
  }

  /**
   * Mark alert as sent
   */
  markAsSent(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.status = 'sent';
      alert.sentAt = new Date();
    }
  }

  /**
   * Persist rules to storage
   */
  private persistRules(): void {
    if (typeof window !== 'undefined') {
      const rules = Array.from(this.rules.values());
      localStorage.setItem('seccheck:notification_rules', JSON.stringify(rules));
    }
  }

  /**
   * Load rules from storage
   */
  loadRules(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('seccheck:notification_rules');
      if (stored) {
        const rules = JSON.parse(stored) as NotificationRule[];
        rules.forEach((rule) => this.setRule(rule));
      }
    }
  }
}

export const notificationService = new NotificationService();
