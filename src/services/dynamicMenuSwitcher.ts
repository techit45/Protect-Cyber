/**
 * Dynamic Rich Menu Switching Service
 * ระบบสลับ Rich Menu แบบไดนามิกสำหรับ ProtectCyber
 */

import { Client } from '@line/bot-sdk';
import { logger } from '../utils/logger';
import { menuAnalytics, MenuInteraction } from './menuAnalytics';

export interface MenuSwitchRule {
  id: string;
  name: string;
  condition: MenuSwitchCondition;
  targetMenuType: 'main' | 'elderly' | 'emergency';
  priority: number;
  enabled: boolean;
  description: string;
}

export interface MenuSwitchCondition {
  type: 'threat_level' | 'time_based' | 'user_behavior' | 'interaction_count' | 'emergency' | 'accessibility';
  parameters: {
    threatLevel?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';
    timeRange?: { start: string; end: string }; // HH:MM format
    minInteractions?: number;
    maxInteractions?: number;
    dayOfWeek?: number[]; // 0-6, Sunday = 0
    userAge?: 'elderly' | 'adult' | 'young';
    emergencyKeywords?: string[];
    accessibilityNeeds?: boolean;
  };
}

export interface MenuSwitchEvent {
  userId: string;
  fromMenuType: 'main' | 'elderly' | 'emergency';
  toMenuType: 'main' | 'elderly' | 'emergency';
  reason: string;
  ruleId: string;
  timestamp: Date;
  automatic: boolean;
}

class DynamicMenuSwitcherService {
  private client: Client;
  private switchRules: MenuSwitchRule[] = [];
  private userMenuStates: Map<string, 'main' | 'elderly' | 'emergency'> = new Map();
  private switchHistory: MenuSwitchEvent[] = [];
  private readonly serviceLogger = logger;

  constructor() {
    this.client = new Client({
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
      channelSecret: process.env.LINE_CHANNEL_SECRET!
    });

    this.initializeDefaultRules();
  }

  /**
   * เพิ่มกฎการสลับเมนู
   */
  public addSwitchRule(rule: MenuSwitchRule): void {
    try {
      // Validate rule
      if (!rule.id || !rule.name || !rule.targetMenuType) {
        throw new Error('Invalid rule: missing required fields');
      }

      // Check for duplicate ID
      if (this.switchRules.find(r => r.id === rule.id)) {
        throw new Error(`Rule with ID ${rule.id} already exists`);
      }

      this.switchRules.push(rule);
      this.switchRules.sort((a, b) => b.priority - a.priority); // Sort by priority

      this.serviceLogger.info('DynamicMenuSwitcher', `Switch rule added: ${rule.name}`, {
        ruleId: rule.id,
        targetMenuType: rule.targetMenuType,
        priority: rule.priority
      });

    } catch (error) {
      this.serviceLogger.error('DynamicMenuSwitcher', 'Failed to add switch rule', error as Error, {
        ruleId: rule.id
      });
      throw error;
    }
  }

  /**
   * ประเมินและสลับเมนูตามกฎที่กำหนด
   */
  public async evaluateAndSwitch(
    userId: string, 
    context: {
      currentThreatLevel?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';
      messageContent?: string;
      userInteractionCount?: number;
      isEmergency?: boolean;
      userAge?: 'elderly' | 'adult' | 'young';
    }
  ): Promise<boolean> {
    try {
      const currentMenuType = this.userMenuStates.get(userId) || 'main';
      
      // Find applicable rules
      const applicableRules = this.findApplicableRules(userId, context);
      
      if (applicableRules.length === 0) {
        return false; // No rules apply
      }

      // Get highest priority rule
      const selectedRule = applicableRules[0];
      const targetMenuType = selectedRule.targetMenuType;

      // Don't switch if already on target menu
      if (currentMenuType === targetMenuType) {
        return false;
      }

      // Perform the switch
      const success = await this.switchUserMenu(userId, targetMenuType, selectedRule.id, selectedRule.name);

      if (success) {
        // Record the switch event
        const switchEvent: MenuSwitchEvent = {
          userId,
          fromMenuType: currentMenuType,
          toMenuType: targetMenuType,
          reason: selectedRule.name,
          ruleId: selectedRule.id,
          timestamp: new Date(),
          automatic: true
        };

        this.switchHistory.push(switchEvent);

        this.serviceLogger.info('DynamicMenuSwitcher', 'Menu switched successfully', {
          userId,
          fromMenuType: currentMenuType,
          toMenuType: targetMenuType,
          reason: selectedRule.name
        });
      }

      return success;

    } catch (error) {
      this.serviceLogger.error('DynamicMenuSwitcher', 'Failed to evaluate and switch menu', error as Error, {
        userId,
        context
      });
      return false;
    }
  }

  /**
   * สลับเมนูด้วยตนเองสำหรับผู้ใช้
   */
  public async manualSwitch(userId: string, targetMenuType: 'main' | 'elderly' | 'emergency', reason?: string): Promise<boolean> {
    try {
      const currentMenuType = this.userMenuStates.get(userId) || 'main';
      
      if (currentMenuType === targetMenuType) {
        return true; // Already on target menu
      }

      const success = await this.switchUserMenu(userId, targetMenuType, 'manual', reason || 'User manual switch');

      if (success) {
        const switchEvent: MenuSwitchEvent = {
          userId,
          fromMenuType: currentMenuType,
          toMenuType: targetMenuType,
          reason: reason || 'User manual switch',
          ruleId: 'manual',
          timestamp: new Date(),
          automatic: false
        };

        this.switchHistory.push(switchEvent);

        this.serviceLogger.info('DynamicMenuSwitcher', 'Manual menu switch completed', {
          userId,
          fromMenuType: currentMenuType,
          toMenuType: targetMenuType,
          reason
        });
      }

      return success;

    } catch (error) {
      this.serviceLogger.error('DynamicMenuSwitcher', 'Failed to perform manual menu switch', error as Error, {
        userId,
        targetMenuType
      });
      return false;
    }
  }

  /**
   * รับสถานะเมนูปัจจุบันของผู้ใช้
   */
  public getCurrentMenuType(userId: string): 'main' | 'elderly' | 'emergency' {
    return this.userMenuStates.get(userId) || 'main';
  }

  /**
   * รับประวัติการสลับเมนูของผู้ใช้
   */
  public getUserSwitchHistory(userId: string, limit: number = 10): MenuSwitchEvent[] {
    return this.switchHistory
      .filter(event => event.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * รับสถิติการสลับเมนู
   */
  public getSwitchStatistics(): {
    totalSwitches: number;
    automaticSwitches: number;
    manualSwitches: number;
    menuTypeDistribution: { [key: string]: number };
    mostTriggeredRules: { ruleId: string; count: number }[];
  } {
    const stats = {
      totalSwitches: this.switchHistory.length,
      automaticSwitches: this.switchHistory.filter(s => s.automatic).length,
      manualSwitches: this.switchHistory.filter(s => !s.automatic).length,
      menuTypeDistribution: {} as { [key: string]: number },
      mostTriggeredRules: [] as { ruleId: string; count: number }[]
    };

    // Calculate menu type distribution
    this.switchHistory.forEach(event => {
      stats.menuTypeDistribution[event.toMenuType] = 
        (stats.menuTypeDistribution[event.toMenuType] || 0) + 1;
    });

    // Calculate most triggered rules
    const ruleCounts = this.switchHistory.reduce((acc, event) => {
      acc[event.ruleId] = (acc[event.ruleId] || 0) + 1;
      return acc;
    }, {} as { [ruleId: string]: number });

    stats.mostTriggeredRules = Object.entries(ruleCounts)
      .map(([ruleId, count]) => ({ ruleId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return stats;
  }

  // Private helper methods
  private async switchUserMenu(userId: string, targetMenuType: 'main' | 'elderly' | 'emergency', ruleId: string, reason: string): Promise<boolean> {
    try {
      // Get the appropriate rich menu ID for the target type
      const richMenuId = await this.getRichMenuIdForType(targetMenuType);
      
      if (!richMenuId) {
        this.serviceLogger.warn('DynamicMenuSwitcher', `No rich menu found for type: ${targetMenuType}`);
        return false;
      }

      // Link the user to the new rich menu
      await this.client.linkRichMenuToUser(userId, richMenuId);

      // Update user menu state
      this.userMenuStates.set(userId, targetMenuType);

      // Track the interaction
      const interaction: MenuInteraction = {
        userId,
        menuId: richMenuId,
        action: 'menu_switch',
        timestamp: new Date(),
        menuType: targetMenuType,
        buttonArea: 'system',
        sessionId: `switch_${Date.now()}`
      };

      menuAnalytics.trackInteraction(interaction);

      return true;

    } catch (error) {
      this.serviceLogger.error('DynamicMenuSwitcher', 'Failed to switch user menu', error as Error, {
        userId,
        targetMenuType,
        ruleId
      });
      return false;
    }
  }

  private async getRichMenuIdForType(menuType: 'main' | 'elderly' | 'emergency'): Promise<string | null> {
    try {
      const richMenus = await this.client.getRichMenuList();
      
      // Find menu by name pattern
      const targetMenu = richMenus.find(menu => {
        const name = menu.name.toLowerCase();
        
        switch (menuType) {
          case 'main':
            return name.includes('main') || name.includes('standard') || name.includes('หลัก');
          case 'elderly':
            return name.includes('elderly') || name.includes('ผู้สูงอายุ') || name.includes('ง่าย');
          case 'emergency':
            return name.includes('emergency') || name.includes('ฉุกเฉิน');
          default:
            return false;
        }
      });

      return targetMenu?.richMenuId || null;

    } catch (error) {
      this.serviceLogger.error('DynamicMenuSwitcher', 'Failed to get rich menu ID', error as Error, {
        menuType
      });
      return null;
    }
  }

  private findApplicableRules(
    userId: string, 
    context: {
      currentThreatLevel?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';
      messageContent?: string;
      userInteractionCount?: number;
      isEmergency?: boolean;
      userAge?: 'elderly' | 'adult' | 'young';
    }
  ): MenuSwitchRule[] {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay();

    return this.switchRules.filter(rule => {
      if (!rule.enabled) return false;

      const condition = rule.condition;

      switch (condition.type) {
        case 'threat_level':
          return context.currentThreatLevel === condition.parameters.threatLevel;

        case 'emergency':
          return context.isEmergency || this.hasEmergencyKeywords(context.messageContent, condition.parameters.emergencyKeywords);

        case 'time_based':
          if (condition.parameters.dayOfWeek && !condition.parameters.dayOfWeek.includes(currentDay)) {
            return false;
          }
          if (condition.parameters.timeRange) {
            return this.isTimeInRange(currentHour, currentMinute, condition.parameters.timeRange);
          }
          return true;

        case 'user_behavior':
          const userStats = menuAnalytics.getUserStats(userId);
          if (condition.parameters.minInteractions && userStats.totalInteractions < condition.parameters.minInteractions) {
            return false;
          }
          if (condition.parameters.maxInteractions && userStats.totalInteractions > condition.parameters.maxInteractions) {
            return false;
          }
          return true;

        case 'interaction_count':
          const interactionCount = context.userInteractionCount || 0;
          if (condition.parameters.minInteractions && interactionCount < condition.parameters.minInteractions) {
            return false;
          }
          if (condition.parameters.maxInteractions && interactionCount > condition.parameters.maxInteractions) {
            return false;
          }
          return true;

        case 'accessibility':
          return context.userAge === 'elderly' && condition.parameters.accessibilityNeeds;

        default:
          return false;
      }
    });
  }

  private hasEmergencyKeywords(messageContent?: string, keywords?: string[]): boolean {
    if (!messageContent || !keywords) return false;
    
    const content = messageContent.toLowerCase();
    return keywords.some(keyword => content.includes(keyword.toLowerCase()));
  }

  private isTimeInRange(currentHour: number, currentMinute: number, timeRange: { start: string; end: string }): boolean {
    const [startHour, startMinute] = timeRange.start.split(':').map(Number);
    const [endHour, endMinute] = timeRange.end.split(':').map(Number);

    const currentTime = currentHour * 60 + currentMinute;
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Handle overnight range (e.g., 22:00 - 06:00)
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private initializeDefaultRules(): void {
    const defaultRules: MenuSwitchRule[] = [
      {
        id: 'emergency_threat',
        name: 'สลับเป็นเมนูฉุกเฉินเมื่อพบภัยคุกคามระดับวิกฤต',
        condition: {
          type: 'threat_level',
          parameters: { threatLevel: 'CRITICAL' }
        },
        targetMenuType: 'emergency',
        priority: 100,
        enabled: true,
        description: 'สลับไปเมนูฉุกเฉินอัตโนมัติเมื่อตรวจพบภัยคุกคามระดับวิกฤต'
      },
      {
        id: 'elderly_accessibility',
        name: 'สลับเป็นเมนูผู้สูงอายุสำหรับผู้ที่ต้องการความช่วยเหลือพิเศษ',
        condition: {
          type: 'accessibility',
          parameters: { accessibilityNeeds: true }
        },
        targetMenuType: 'elderly',
        priority: 80,
        enabled: true,
        description: 'สลับไปเมนูผู้สูงอายุสำหรับผู้ใช้ที่ต้องการการช่วยเหลือพิเศษ'
      },
      {
        id: 'night_time_elderly',
        name: 'สลับเป็นเมนูผู้สูงอายุในเวลากลางคืน',
        condition: {
          type: 'time_based',
          parameters: { 
            timeRange: { start: '22:00', end: '06:00' }
          }
        },
        targetMenuType: 'elderly',
        priority: 60,
        enabled: true,
        description: 'สลับไปเมนูผู้สูงอายุในช่วงเวลากลางคืนเพื่อความสะดวกในการใช้งาน'
      },
      {
        id: 'high_interaction_main',
        name: 'สลับเป็นเมนูหลักสำหรับผู้ใช้ที่ใช้งานบ่อย',
        condition: {
          type: 'user_behavior',
          parameters: { minInteractions: 10 }
        },
        targetMenuType: 'main',
        priority: 40,
        enabled: true,
        description: 'สลับไปเมนูหลักสำหรับผู้ใช้ที่มีประสบการณ์การใช้งาน'
      },
      {
        id: 'emergency_keywords',
        name: 'สลับเป็นเมนูฉุกเฉินเมื่อมีคำสำคัญฉุกเฉิน',
        condition: {
          type: 'emergency',
          parameters: { 
            emergencyKeywords: ['ฉุกเฉิน', 'ช่วยด้วย', 'โดนโกง', 'หลอกลวง', 'อันตราย', 'emergency', 'help'] 
          }
        },
        targetMenuType: 'emergency',
        priority: 90,
        enabled: true,
        description: 'สลับไปเมนูฉุกเฉินเมื่อตรวจพบคำสำคัญที่บ่งบอกถึงสถานการณ์ฉุกเฉิน'
      }
    ];

    defaultRules.forEach(rule => {
      try {
        this.addSwitchRule(rule);
      } catch (error) {
        this.serviceLogger.error('DynamicMenuSwitcher', 'Failed to add default rule', error as Error, {
          ruleId: rule.id
        });
      }
    });

    this.serviceLogger.info('DynamicMenuSwitcher', 'Default switch rules initialized', {
      totalRules: this.switchRules.length
    });
  }
}

// Export singleton instance
export const dynamicMenuSwitcher = new DynamicMenuSwitcherService();