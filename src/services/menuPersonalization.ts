/**
 * Rich Menu Personalization Service
 * ระบบปรับแต่งเมนูตามผู้ใช้สำหรับ ProtectCyber
 */

import { logger } from '../utils/logger';
import { richMenuClient, RichMenuTemplate, RichMenuButton } from '../utils/richMenuClient';
import { menuAnalytics } from './menuAnalytics';
import { dynamicMenuSwitcher } from './dynamicMenuSwitcher';

export interface UserPersonalizationProfile {
  userId: string;
  preferences: {
    language: 'th' | 'en';
    menuStyle: 'standard' | 'elderly-friendly' | 'minimal' | 'high-contrast';
    buttonSize: 'small' | 'medium' | 'large';
    colorScheme: 'default' | 'dark' | 'high-contrast' | 'colorblind-friendly';
    accessibility: {
      largeText: boolean;
      highContrast: boolean;
      simplifiedLayout: boolean;
      voiceAssistant: boolean;
    };
  };
  behaviorProfile: {
    frequentActions: string[];
    usagePatterns: {
      peakHours: number[];
      preferredMenuType: 'main' | 'elderly' | 'emergency';
      averageSessionDuration: number;
    };
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    riskProfile: 'high' | 'medium' | 'low';
  };
  customizations: {
    favoriteButtons: string[];
    hiddenButtons: string[];
    buttonOrder: string[];
    customShortcuts: Array<{
      id: string;
      name: string;
      action: any;
      icon: string;
    }>;
  };
  learningData: {
    onboardingCompleted: boolean;
    tutorialProgress: number;
    errorCount: number;
    successfulInteractions: number;
    lastUpdated: Date;
  };
}

export interface PersonalizedMenuConfig {
  templateId: string;
  customizations: {
    buttons: RichMenuButton[];
    layout: 'main' | 'elderly' | 'emergency' | 'custom';
    style: any;
  };
  reason: string;
  confidence: number;
}

class MenuPersonalizationService {
  private userProfiles: Map<string, UserPersonalizationProfile> = new Map();
  private readonly serviceLogger = logger;
  private readonly learningThreshold = 10; // Minimum interactions before personalization

  /**
   * สร้างโปรไฟล์ผู้ใช้ใหม่
   */
  public createUserProfile(userId: string, initialPreferences?: Partial<UserPersonalizationProfile['preferences']>): UserPersonalizationProfile {
    try {
      const profile: UserPersonalizationProfile = {
        userId,
        preferences: {
          language: 'th',
          menuStyle: 'standard',
          buttonSize: 'medium',
          colorScheme: 'default',
          accessibility: {
            largeText: false,
            highContrast: false,
            simplifiedLayout: false,
            voiceAssistant: false
          },
          ...initialPreferences
        },
        behaviorProfile: {
          frequentActions: [],
          usagePatterns: {
            peakHours: [],
            preferredMenuType: 'main',
            averageSessionDuration: 0
          },
          skillLevel: 'beginner',
          riskProfile: 'medium'
        },
        customizations: {
          favoriteButtons: [],
          hiddenButtons: [],
          buttonOrder: [],
          customShortcuts: []
        },
        learningData: {
          onboardingCompleted: false,
          tutorialProgress: 0,
          errorCount: 0,
          successfulInteractions: 0,
          lastUpdated: new Date()
        }
      };

      this.userProfiles.set(userId, profile);

      this.serviceLogger.info('MenuPersonalization', 'User profile created', {
        userId,
        language: profile.preferences.language,
        menuStyle: profile.preferences.menuStyle
      });

      return profile;

    } catch (error) {
      this.serviceLogger.error('MenuPersonalization', 'Failed to create user profile', error as Error, {
        userId
      });
      throw error;
    }
  }

  /**
   * อัปเดตโปรไฟล์ผู้ใช้จากการวิเคราะห์พฤติกรรม
   */
  public async updateUserProfileFromBehavior(userId: string): Promise<void> {
    try {
      let profile = this.userProfiles.get(userId);
      if (!profile) {
        profile = this.createUserProfile(userId);
      }

      // Get user statistics from analytics
      const userStats = menuAnalytics.getUserStats(userId);
      const menuRecommendation = menuAnalytics.getMenuRecommendation(userId);

      // Update behavior profile
      profile.behaviorProfile.frequentActions = userStats.favoriteActions;
      profile.behaviorProfile.usagePatterns.preferredMenuType = menuRecommendation.recommendedMenuType;

      // Analyze skill level based on interaction patterns
      profile.behaviorProfile.skillLevel = this.determineSkillLevel(userStats);

      // Update risk profile based on threat detection history
      profile.behaviorProfile.riskProfile = await this.assessUserRiskProfile(userId);

      // Update learning data
      profile.learningData.successfulInteractions = userStats.totalInteractions;
      profile.learningData.lastUpdated = new Date();

      // Auto-adjust preferences based on behavior
      this.autoAdjustPreferences(profile);

      this.userProfiles.set(userId, profile);

      this.serviceLogger.info('MenuPersonalization', 'User profile updated from behavior', {
        userId,
        skillLevel: profile.behaviorProfile.skillLevel,
        preferredMenuType: profile.behaviorProfile.usagePatterns.preferredMenuType,
        totalInteractions: userStats.totalInteractions
      });

    } catch (error) {
      this.serviceLogger.error('MenuPersonalization', 'Failed to update user profile from behavior', error as Error, {
        userId
      });
    }
  }

  /**
   * สร้างเมนูที่ปรับแต่งสำหรับผู้ใช้
   */
  public async generatePersonalizedMenu(userId: string): Promise<PersonalizedMenuConfig | null> {
    try {
      let profile = this.userProfiles.get(userId);
      if (!profile) {
        await this.updateUserProfileFromBehavior(userId);
        profile = this.userProfiles.get(userId);
      }

      if (!profile) {
        return null;
      }

      // Check if user has enough data for personalization
      if (profile.learningData.successfulInteractions < this.learningThreshold) {
        return this.generateDefaultMenu(profile);
      }

      // Select base template based on preferences and behavior
      const baseTemplate = this.selectBaseTemplate(profile);
      
      // Customize the template
      const personalizedConfig = this.customizeTemplate(baseTemplate, profile);

      this.serviceLogger.info('MenuPersonalization', 'Personalized menu generated', {
        userId,
        templateId: personalizedConfig.templateId,
        confidence: personalizedConfig.confidence,
        reason: personalizedConfig.reason
      });

      return personalizedConfig;

    } catch (error) {
      this.serviceLogger.error('MenuPersonalization', 'Failed to generate personalized menu', error as Error, {
        userId
      });
      return null;
    }
  }

  /**
   * อัปเดตการตั้งค่าผู้ใช้
   */
  public updateUserPreferences(
    userId: string, 
    preferences: Partial<UserPersonalizationProfile['preferences']>
  ): void {
    try {
      let profile = this.userProfiles.get(userId);
      if (!profile) {
        profile = this.createUserProfile(userId, preferences);
      } else {
        profile.preferences = { ...profile.preferences, ...preferences };
        profile.learningData.lastUpdated = new Date();
        this.userProfiles.set(userId, profile);
      }

      this.serviceLogger.info('MenuPersonalization', 'User preferences updated', {
        userId,
        updatedFields: Object.keys(preferences)
      });

    } catch (error) {
      this.serviceLogger.error('MenuPersonalization', 'Failed to update user preferences', error as Error, {
        userId
      });
    }
  }

  /**
   * เพิ่มปุ่มที่กำหนดเองให้ผู้ใช้
   */
  public addCustomShortcut(
    userId: string, 
    shortcut: {
      name: string;
      action: any;
      icon: string;
    }
  ): void {
    try {
      let profile = this.userProfiles.get(userId);
      if (!profile) {
        profile = this.createUserProfile(userId);
      }

      const customShortcut = {
        id: `custom_${Date.now()}`,
        ...shortcut
      };

      profile.customizations.customShortcuts.push(customShortcut);
      profile.learningData.lastUpdated = new Date();
      this.userProfiles.set(userId, profile);

      this.serviceLogger.info('MenuPersonalization', 'Custom shortcut added', {
        userId,
        shortcutName: shortcut.name,
        shortcutId: customShortcut.id
      });

    } catch (error) {
      this.serviceLogger.error('MenuPersonalization', 'Failed to add custom shortcut', error as Error, {
        userId
      });
    }
  }

  /**
   * รับคำแนะนำการปรับปรุงเมนู
   */
  public getMenuOptimizationSuggestions(userId: string): Array<{
    type: 'layout' | 'buttons' | 'style' | 'accessibility';
    suggestion: string;
    reason: string;
    impact: 'high' | 'medium' | 'low';
  }> {
    try {
      const profile = this.userProfiles.get(userId);
      if (!profile) {
        return [];
      }

      const suggestions: Array<{
        type: 'layout' | 'buttons' | 'style' | 'accessibility';
        suggestion: string;
        reason: string;
        impact: 'high' | 'medium' | 'low';
      }> = [];

      // Analyze usage patterns for suggestions
      const userStats = menuAnalytics.getUserStats(userId);

      // Layout suggestions
      if (profile.behaviorProfile.skillLevel === 'beginner' && profile.preferences.menuStyle === 'standard') {
        suggestions.push({
          type: 'layout',
          suggestion: 'เปลี่ยนเป็นเมนูผู้สูงอายุ',
          reason: 'ผู้ใช้ยังใหม่ เมนูแบบง่ายจะใช้งานง่ายกว่า',
          impact: 'high'
        });
      }

      // Button suggestions based on frequent actions
      if (profile.behaviorProfile.frequentActions.length > 0) {
        const frequentAction = profile.behaviorProfile.frequentActions[0];
        if (!profile.customizations.favoriteButtons.includes(frequentAction)) {
          suggestions.push({
            type: 'buttons',
            suggestion: `เพิ่ม "${frequentAction}" เป็นปุ่มโปรด`,
            reason: 'คุณใช้ฟังก์ชันนี้บ่อยที่สุด',
            impact: 'medium'
          });
        }
      }

      // Accessibility suggestions
      if (userStats.engagementLevel === 'low' && !profile.preferences.accessibility.largeText) {
        suggestions.push({
          type: 'accessibility',
          suggestion: 'เปิดใช้งานตัวอักษรขนาดใหญ่',
          reason: 'อาจช่วยให้อ่านและใช้งานได้ง่ายขึ้น',
          impact: 'medium'
        });
      }

      // Style suggestions based on usage time
      const currentHour = new Date().getHours();
      if ((currentHour < 6 || currentHour > 20) && profile.preferences.colorScheme === 'default') {
        suggestions.push({
          type: 'style',
          suggestion: 'เปลี่ยนเป็นโหมดมืด',
          reason: 'ลดแสงจากหน้าจอในเวลากลางคืน',
          impact: 'low'
        });
      }

      return suggestions;

    } catch (error) {
      this.serviceLogger.error('MenuPersonalization', 'Failed to get optimization suggestions', error as Error, {
        userId
      });
      return [];
    }
  }

  /**
   * รับโปรไฟล์ผู้ใช้
   */
  public getUserProfile(userId: string): UserPersonalizationProfile | null {
    return this.userProfiles.get(userId) || null;
  }

  /**
   * ส่งออกข้อมูลส่วนบุคคล
   */
  public exportUserData(userId: string): string {
    try {
      const profile = this.userProfiles.get(userId);
      if (!profile) {
        return JSON.stringify({ error: 'User profile not found' });
      }

      const exportData = {
        userId,
        profile,
        menuAnalytics: menuAnalytics.getUserStats(userId),
        switchHistory: dynamicMenuSwitcher.getUserSwitchHistory(userId, 50),
        exportDate: new Date().toISOString()
      };

      return JSON.stringify(exportData, null, 2);

    } catch (error) {
      this.serviceLogger.error('MenuPersonalization', 'Failed to export user data', error as Error, {
        userId
      });
      return JSON.stringify({ error: 'Export failed' });
    }
  }

  // Private helper methods
  private determineSkillLevel(userStats: any): 'beginner' | 'intermediate' | 'advanced' {
    if (userStats.totalInteractions < 5) return 'beginner';
    if (userStats.totalInteractions < 20) return 'intermediate';
    return 'advanced';
  }

  private async assessUserRiskProfile(userId: string): Promise<'high' | 'medium' | 'low'> {
    // This would analyze the user's threat detection history
    // For now, return medium as default
    return 'medium';
  }

  private autoAdjustPreferences(profile: UserPersonalizationProfile): void {
    // Auto-adjust based on behavior patterns
    if (profile.behaviorProfile.skillLevel === 'beginner' && 
        profile.preferences.menuStyle === 'standard') {
      // Suggest simpler interface for beginners
      profile.preferences.menuStyle = 'elderly-friendly';
    }

    // Auto-enable accessibility features if user shows signs of difficulty
    if (profile.learningData.errorCount > profile.learningData.successfulInteractions * 0.3) {
      profile.preferences.accessibility.largeText = true;
      profile.preferences.accessibility.simplifiedLayout = true;
    }
  }

  private selectBaseTemplate(profile: UserPersonalizationProfile): RichMenuTemplate {
    const templates = richMenuClient.getAvailableTemplates();
    
    // Select based on preferences and behavior
    if (profile.preferences.accessibility.simplifiedLayout || 
        profile.behaviorProfile.skillLevel === 'beginner') {
      return templates.find(t => t.layout === 'elderly') || templates[0];
    }

    if (profile.behaviorProfile.usagePatterns.preferredMenuType === 'emergency') {
      return templates.find(t => t.layout === 'emergency') || templates[0];
    }

    return templates.find(t => t.layout === 'main') || templates[0];
  }

  private customizeTemplate(
    template: RichMenuTemplate, 
    profile: UserPersonalizationProfile
  ): PersonalizedMenuConfig {
    const customizedButtons = [...template.imageConfig.buttons];

    // Customize button order based on frequent actions
    if (profile.behaviorProfile.frequentActions.length > 0) {
      customizedButtons.sort((a, b) => {
        const aIndex = profile.behaviorProfile.frequentActions.indexOf(a.id);
        const bIndex = profile.behaviorProfile.frequentActions.indexOf(b.id);
        
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }

    // Apply accessibility customizations
    if (profile.preferences.accessibility.largeText) {
      customizedButtons.forEach(button => {
        button.style.fontSize = Math.max(button.style.fontSize, 20);
      });
    }

    // Apply color scheme
    if (profile.preferences.colorScheme === 'high-contrast') {
      customizedButtons.forEach(button => {
        button.style.backgroundColor = '#000000';
        button.style.textColor = '#FFFFFF';
      });
    }

    // Apply language preferences
    if (profile.preferences.language === 'en') {
      customizedButtons.forEach(button => {
        button.text = button.textEn || button.text;
      });
    }

    const confidence = this.calculatePersonalizationConfidence(profile);

    return {
      templateId: `personalized_${template.id}_${profile.userId}`,
      customizations: {
        buttons: customizedButtons,
        layout: template.layout,
        style: {
          ...template.imageConfig,
          style: profile.preferences.menuStyle
        }
      },
      reason: this.generatePersonalizationReason(profile),
      confidence
    };
  }

  private generateDefaultMenu(profile: UserPersonalizationProfile): PersonalizedMenuConfig {
    const templates = richMenuClient.getAvailableTemplates();
    const mainTemplate = templates.find(t => t.layout === 'main') || templates[0];

    return {
      templateId: `default_${mainTemplate.id}`,
      customizations: {
        buttons: mainTemplate.imageConfig.buttons,
        layout: mainTemplate.layout,
        style: mainTemplate.imageConfig
      },
      reason: 'ผู้ใช้ใหม่ - ใช้เมนูมาตรฐาน',
      confidence: 0.5
    };
  }

  private calculatePersonalizationConfidence(profile: UserPersonalizationProfile): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on interaction count
    const interactionBonus = Math.min(0.3, profile.learningData.successfulInteractions / 100);
    confidence += interactionBonus;

    // Increase confidence if user has set preferences
    if (profile.preferences.language !== 'th' || 
        profile.preferences.menuStyle !== 'standard' ||
        Object.values(profile.preferences.accessibility).some(v => v)) {
      confidence += 0.2;
    }

    // Increase confidence based on behavior data richness
    if (profile.behaviorProfile.frequentActions.length > 0) {
      confidence += 0.1;
    }

    return Math.min(0.95, confidence);
  }

  private generatePersonalizationReason(profile: UserPersonalizationProfile): string {
    const reasons: string[] = [];

    if (profile.behaviorProfile.skillLevel === 'beginner') {
      reasons.push('ปรับให้เหมาะกับผู้ใช้ใหม่');
    }

    if (profile.preferences.accessibility.largeText) {
      reasons.push('ขยายตัวอักษรให้อ่านง่าย');
    }

    if (profile.behaviorProfile.frequentActions.length > 0) {
      reasons.push('จัดเรียงตามการใช้งานบ่อย');
    }

    if (profile.preferences.language === 'en') {
      reasons.push('แสดงภาษาอังกฤษ');
    }

    return reasons.length > 0 ? reasons.join(', ') : 'ปรับแต่งตามข้อมูลผู้ใช้';
  }
}

// Export singleton instance
export const menuPersonalization = new MenuPersonalizationService();