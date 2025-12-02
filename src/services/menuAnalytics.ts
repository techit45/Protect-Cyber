/**
 * Rich Menu Analytics Service
 * ระบบวิเคราะห์การใช้งาน Rich Menu สำหรับ ProtectCyber
 */

import { logger } from '../utils/logger';

export interface MenuInteraction {
  userId: string;
  menuId: string;
  action: string;
  timestamp: Date;
  menuType: 'main' | 'elderly' | 'emergency';
  buttonArea: string;
  sessionId?: string;
  userAgent?: string;
  previousAction?: string;
}

export interface MenuAnalytics {
  totalInteractions: number;
  uniqueUsers: number;
  mostUsedActions: { action: string; count: number }[];
  menuTypeUsage: { [key: string]: number };
  userEngagement: {
    avgInteractionsPerUser: number;
    returnUsers: number;
    newUsers: number;
  };
  timeBasedAnalytics: {
    hourlyDistribution: { [hour: string]: number };
    dailyDistribution: { [day: string]: number };
  };
  conversionMetrics: {
    threatsReported: number;
    helpRequested: number;
    emergencyContacted: number;
  };
}

export interface UserMenuPreference {
  userId: string;
  preferredMenuType: 'main' | 'elderly' | 'emergency';
  frequentActions: string[];
  lastMenuSwitch: Date;
  accessibilityNeeds: {
    largeButtons: boolean;
    highContrast: boolean;
    simpleLayout: boolean;
  };
  learningHistory: {
    action: string;
    frequency: number;
    lastUsed: Date;
  }[];
}

class MenuAnalyticsService {
  private interactions: MenuInteraction[] = [];
  private userPreferences: Map<string, UserMenuPreference> = new Map();
  private readonly maxInteractionsInMemory = 10000;
  private readonly serviceLogger = logger;

  /**
   * บันทึกการใช้งาน Rich Menu
   */
  public trackInteraction(interaction: MenuInteraction): void {
    try {
      // Add timestamp if not provided
      if (!interaction.timestamp) {
        interaction.timestamp = new Date();
      }

      // Add to memory storage
      this.interactions.push(interaction);

      // Maintain memory limit
      if (this.interactions.length > this.maxInteractionsInMemory) {
        this.interactions = this.interactions.slice(-this.maxInteractionsInMemory);
      }

      // Update user preferences
      this.updateUserPreference(interaction);

      // Log analytics event
      this.serviceLogger.info('MenuAnalytics', 'Menu interaction tracked', {
        userId: interaction.userId,
        action: interaction.action,
        menuType: interaction.menuType,
        buttonArea: interaction.buttonArea
      });

      // Log specific metrics for important actions
      if (this.isCriticalAction(interaction.action)) {
        this.serviceLogger.warn('MenuAnalytics', 'Critical action performed', {
          userId: interaction.userId,
          action: interaction.action,
          menuType: interaction.menuType
        });
      }

    } catch (error) {
      this.serviceLogger.error('MenuAnalytics', 'Failed to track interaction', error as Error, {
        userId: interaction.userId,
        action: interaction.action
      });
    }
  }

  /**
   * วิเคราะห์การใช้งาน Rich Menu
   */
  public getAnalytics(timeRange?: { start: Date; end: Date }): MenuAnalytics {
    try {
      let filteredInteractions = this.interactions;

      // Filter by time range if provided
      if (timeRange) {
        filteredInteractions = this.interactions.filter(
          interaction => interaction.timestamp >= timeRange.start && interaction.timestamp <= timeRange.end
        );
      }

      const analytics: MenuAnalytics = {
        totalInteractions: filteredInteractions.length,
        uniqueUsers: new Set(filteredInteractions.map(i => i.userId)).size,
        mostUsedActions: this.getMostUsedActions(filteredInteractions),
        menuTypeUsage: this.getMenuTypeUsage(filteredInteractions),
        userEngagement: this.getUserEngagement(filteredInteractions),
        timeBasedAnalytics: this.getTimeBasedAnalytics(filteredInteractions),
        conversionMetrics: this.getConversionMetrics(filteredInteractions)
      };

      this.serviceLogger.info('MenuAnalytics', 'Analytics generated', {
        totalInteractions: analytics.totalInteractions,
        uniqueUsers: analytics.uniqueUsers,
        timeRange: timeRange ? `${timeRange.start.toISOString()} - ${timeRange.end.toISOString()}` : 'all'
      });

      return analytics;

    } catch (error) {
      this.serviceLogger.error('MenuAnalytics', 'Failed to generate analytics', error as Error);
      throw error;
    }
  }

  /**
   * รับคำแนะนำเมนูสำหรับผู้ใช้
   */
  public getMenuRecommendation(userId: string): {
    recommendedMenuType: 'main' | 'elderly' | 'emergency';
    reason: string;
    confidence: number;
  } {
    try {
      const userPreference = this.userPreferences.get(userId);
      const userInteractions = this.interactions.filter(i => i.userId === userId);

      if (!userPreference || userInteractions.length === 0) {
        return {
          recommendedMenuType: 'main',
          reason: 'ผู้ใช้ใหม่ - ใช้เมนูมาตรฐาน',
          confidence: 0.5
        };
      }

      // Analyze usage patterns
      const recentInteractions = userInteractions
        .filter(i => {
          const daysDiff = (new Date().getTime() - i.timestamp.getTime()) / (1000 * 3600 * 24);
          return daysDiff <= 7; // Last 7 days
        });

      const menuTypeFrequency = this.getMenuTypeUsage(recentInteractions);
      const mostUsedMenuType = Object.entries(menuTypeFrequency)
        .sort(([,a], [,b]) => b - a)[0];

      if (!mostUsedMenuType) {
        return {
          recommendedMenuType: userPreference.preferredMenuType,
          reason: 'ตามการตั้งค่าผู้ใช้',
          confidence: 0.7
        };
      }

      const [menuType, frequency] = mostUsedMenuType;
      const confidence = Math.min(0.95, 0.5 + (frequency / recentInteractions.length) * 0.5);

      return {
        recommendedMenuType: menuType as 'main' | 'elderly' | 'emergency',
        reason: `ใช้เมนูนี้บ่อยที่สุดในช่วง 7 วันที่ผ่านมา (${frequency} ครั้ง)`,
        confidence
      };

    } catch (error) {
      this.serviceLogger.error('MenuAnalytics', 'Failed to get menu recommendation', error as Error, {
        userId
      });
      
      return {
        recommendedMenuType: 'main',
        reason: 'เกิดข้อผิดพลาดในการวิเคราะห์ - ใช้เมนูมาตรฐาน',
        confidence: 0.3
      };
    }
  }

  /**
   * รับสถิติผู้ใช้รายบุคคล
   */
  public getUserStats(userId: string): {
    totalInteractions: number;
    favoriteActions: string[];
    preferredMenuType: string;
    lastActive: Date | null;
    engagementLevel: 'high' | 'medium' | 'low';
  } {
    const userInteractions = this.interactions.filter(i => i.userId === userId);
    const userPreference = this.userPreferences.get(userId);

    if (userInteractions.length === 0) {
      return {
        totalInteractions: 0,
        favoriteActions: [],
        preferredMenuType: 'main',
        lastActive: null,
        engagementLevel: 'low'
      };
    }

    const actionCounts = userInteractions.reduce((acc, interaction) => {
      acc[interaction.action] = (acc[interaction.action] || 0) + 1;
      return acc;
    }, {} as { [action: string]: number });

    const favoriteActions = Object.entries(actionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([action]) => action);

    const lastActive = userInteractions
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]?.timestamp || null;

    // Determine engagement level
    const engagementLevel = this.determineEngagementLevel(userInteractions.length);

    return {
      totalInteractions: userInteractions.length,
      favoriteActions,
      preferredMenuType: userPreference?.preferredMenuType || 'main',
      lastActive,
      engagementLevel
    };
  }

  /**
   * ส่งออกข้อมูลสำหรับการวิเคราะห์ขั้นสูง
   */
  public exportAnalyticsData(format: 'json' | 'csv' = 'json'): string {
    try {
      if (format === 'csv') {
        return this.convertToCSV(this.interactions);
      }

      const exportData = {
        metadata: {
          totalInteractions: this.interactions.length,
          uniqueUsers: new Set(this.interactions.map(i => i.userId)).size,
          exportDate: new Date().toISOString(),
          timeRange: {
            earliest: this.interactions[0]?.timestamp?.toISOString() || null,
            latest: this.interactions[this.interactions.length - 1]?.timestamp?.toISOString() || null
          }
        },
        interactions: this.interactions,
        userPreferences: Array.from(this.userPreferences.values()),
        analytics: this.getAnalytics()
      };

      return JSON.stringify(exportData, null, 2);

    } catch (error) {
      this.serviceLogger.error('MenuAnalytics', 'Failed to export analytics data', error as Error);
      throw error;
    }
  }

  // Private helper methods
  private updateUserPreference(interaction: MenuInteraction): void {
    let userPref = this.userPreferences.get(interaction.userId);

    if (!userPref) {
      userPref = {
        userId: interaction.userId,
        preferredMenuType: interaction.menuType,
        frequentActions: [],
        lastMenuSwitch: new Date(),
        accessibilityNeeds: {
          largeButtons: interaction.menuType === 'elderly',
          highContrast: false,
          simpleLayout: interaction.menuType === 'elderly'
        },
        learningHistory: []
      };
    }

    // Update learning history
    const existingLearning = userPref.learningHistory.find(l => l.action === interaction.action);
    if (existingLearning) {
      existingLearning.frequency++;
      existingLearning.lastUsed = interaction.timestamp;
    } else {
      userPref.learningHistory.push({
        action: interaction.action,
        frequency: 1,
        lastUsed: interaction.timestamp
      });
    }

    // Update frequent actions (top 5)
    userPref.frequentActions = userPref.learningHistory
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5)
      .map(l => l.action);

    // Update preferred menu type if user consistently uses a different type
    if (interaction.menuType !== userPref.preferredMenuType) {
      const recentInteractions = this.interactions
        .filter(i => i.userId === interaction.userId)
        .slice(-10); // Last 10 interactions

      const typeCount = recentInteractions.reduce((acc, i) => {
        acc[i.menuType] = (acc[i.menuType] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      const mostUsedType = Object.entries(typeCount)
        .sort(([,a], [,b]) => b - a)[0];

      if (mostUsedType && mostUsedType[1] >= 7) { // If used 7+ times out of last 10
        userPref.preferredMenuType = mostUsedType[0] as 'main' | 'elderly' | 'emergency';
        userPref.lastMenuSwitch = new Date();
      }
    }

    this.userPreferences.set(interaction.userId, userPref);
  }

  private getMostUsedActions(interactions: MenuInteraction[]): { action: string; count: number }[] {
    const actionCounts = interactions.reduce((acc, interaction) => {
      acc[interaction.action] = (acc[interaction.action] || 0) + 1;
      return acc;
    }, {} as { [action: string]: number });

    return Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 actions
  }

  private getMenuTypeUsage(interactions: MenuInteraction[]): { [key: string]: number } {
    return interactions.reduce((acc, interaction) => {
      acc[interaction.menuType] = (acc[interaction.menuType] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  private getUserEngagement(interactions: MenuInteraction[]): MenuAnalytics['userEngagement'] {
    const userInteractionCounts = interactions.reduce((acc, interaction) => {
      acc[interaction.userId] = (acc[interaction.userId] || 0) + 1;
      return acc;
    }, {} as { [userId: string]: number });

    const uniqueUsers = Object.keys(userInteractionCounts).length;
    const totalInteractions = interactions.length;
    const avgInteractionsPerUser = uniqueUsers > 0 ? totalInteractions / uniqueUsers : 0;

    // Simple heuristic: users with more than 1 interaction are "return users"
    const returnUsers = Object.values(userInteractionCounts).filter(count => count > 1).length;
    const newUsers = uniqueUsers - returnUsers;

    return {
      avgInteractionsPerUser: Math.round(avgInteractionsPerUser * 100) / 100,
      returnUsers,
      newUsers
    };
  }

  private getTimeBasedAnalytics(interactions: MenuInteraction[]): MenuAnalytics['timeBasedAnalytics'] {
    const hourlyDistribution: { [hour: string]: number } = {};
    const dailyDistribution: { [day: string]: number } = {};

    // Initialize with zeros
    for (let i = 0; i < 24; i++) {
      hourlyDistribution[i.toString()] = 0;
    }
    for (let i = 0; i < 7; i++) {
      dailyDistribution[i.toString()] = 0;
    }

    interactions.forEach(interaction => {
      const hour = interaction.timestamp.getHours().toString();
      const day = interaction.timestamp.getDay().toString();
      
      hourlyDistribution[hour]++;
      dailyDistribution[day]++;
    });

    return { hourlyDistribution, dailyDistribution };
  }

  private getConversionMetrics(interactions: MenuInteraction[]): MenuAnalytics['conversionMetrics'] {
    const threatsReported = interactions.filter(i => 
      i.action.includes('report') || i.action.includes('threat')
    ).length;

    const helpRequested = interactions.filter(i => 
      i.action.includes('help') || i.action.includes('support')
    ).length;

    const emergencyContacted = interactions.filter(i => 
      i.action.includes('emergency') || i.action.includes('191') || i.action.includes('1441')
    ).length;

    return { threatsReported, helpRequested, emergencyContacted };
  }

  private isCriticalAction(action: string): boolean {
    const criticalActions = [
      'emergency_contact',
      'report_threat',
      'call_police',
      'call_thaicert',
      'help_request'
    ];
    return criticalActions.includes(action);
  }

  private determineEngagementLevel(interactionCount: number): 'high' | 'medium' | 'low' {
    if (interactionCount >= 20) return 'high';
    if (interactionCount >= 5) return 'medium';
    return 'low';
  }

  private convertToCSV(interactions: MenuInteraction[]): string {
    const headers = ['userId', 'menuId', 'action', 'timestamp', 'menuType', 'buttonArea', 'sessionId'];
    const csvRows = [headers.join(',')];

    interactions.forEach(interaction => {
      const row = [
        interaction.userId,
        interaction.menuId,
        interaction.action,
        interaction.timestamp.toISOString(),
        interaction.menuType,
        interaction.buttonArea,
        interaction.sessionId || ''
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }
}

// Export singleton instance
export const menuAnalytics = new MenuAnalyticsService();