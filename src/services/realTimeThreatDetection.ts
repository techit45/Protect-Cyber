import { ThaiThreatIntelligenceService, ThaiThreatAnalysis } from './thaiThreatIntelligence';
import { BehavioralBiometricsService, DuressAnalysis } from './behavioralBiometrics';
import { EducationalContentService, PersonalizedTip } from './educationalContent';
import { ThreatDetectorService, ThreatAnalysisResult } from './threatDetector';
import { EventEmitter } from 'events';

export interface RealTimeThreatEvent {
  id: string;
  userId: string;
  timestamp: Date;
  message: string;
  analysis: ThreatAnalysisResult;
  thaiIntelligence: ThaiThreatAnalysis;
  behavioralAnalysis: DuressAnalysis;
  educationalTips: PersonalizedTip[];
  actionRequired: boolean;
  emergencyLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  familyAlert: boolean;
}

export interface ThreatAlert {
  alertId: string;
  userId: string;
  alertType: 'threat_detected' | 'duress_detected' | 'elderly_at_risk' | 'family_notification';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actionItems: string[];
  expiresAt: Date;
}

export interface RealTimeMetrics {
  totalThreatsDetected: number;
  elderlyUsersProtected: number;
  familyAlertsTriggered: number;
  averageResponseTime: number;
  threatCategories: { [key: string]: number };
  hourlyActivity: number[];
}

export class RealTimeThreatDetectionService extends EventEmitter {
  private threatDetector: ThreatDetectorService;
  private thaiIntelligence: ThaiThreatIntelligenceService;
  private behavioralBiometrics: BehavioralBiometricsService;
  private educationalContent: EducationalContentService;
  
  private activeEvents: Map<string, RealTimeThreatEvent> = new Map();
  private activeAlerts: Map<string, ThreatAlert> = new Map();
  private metrics: RealTimeMetrics;
  
  constructor() {
    super();
    
    this.threatDetector = new ThreatDetectorService();
    this.thaiIntelligence = new ThaiThreatIntelligenceService();
    this.behavioralBiometrics = new BehavioralBiometricsService();
    this.educationalContent = new EducationalContentService();
    
    this.metrics = {
      totalThreatsDetected: 0,
      elderlyUsersProtected: 0,
      familyAlertsTriggered: 0,
      averageResponseTime: 0,
      threatCategories: {},
      hourlyActivity: new Array(24).fill(0)
    };
    
    // Start background monitoring
    this.startBackgroundMonitoring();
  }

  async analyzeMessageRealTime(
    userId: string,
    message: string,
    sessionData?: {
      typingDuration?: number;
      characterCount?: number;
      errors?: number;
    }
  ): Promise<RealTimeThreatEvent> {
    
    const startTime = Date.now();
    const timestamp = new Date();
    const eventId = this.generateEventId();
    
    console.log('🔄 Starting real-time threat analysis for:', { userId, eventId });
    
    try {
      // Run comprehensive analysis in parallel
      const [
        analysis,
        thaiIntelligence,
        behavioralAnalysis
      ] = await Promise.all([
        this.threatDetector.analyze(message, userId),
        this.thaiIntelligence.analyzeForThaiThreats(message),
        this.behavioralBiometrics.analyzeUserBehavior(userId, message, timestamp, sessionData)
      ]);
      
      // Generate educational tips based on analysis
      const userProfile = {
        isElderly: this.behavioralBiometrics.isUserElderly(userId),
        recentThreats: thaiIntelligence.threatCategory ? [thaiIntelligence.threatCategory] : [],
        riskLevel: analysis.riskLevel
      };
      
      const educationalTips = await this.educationalContent.generatePersonalizedTips(userId, userProfile);
      
      // Determine emergency level and required actions
      const emergencyLevel = this.determineEmergencyLevel(analysis, behavioralAnalysis, userProfile.isElderly);
      const familyAlert = this.shouldTriggerFamilyAlert(analysis, behavioralAnalysis, userProfile.isElderly);
      
      // Create real-time threat event
      const threatEvent: RealTimeThreatEvent = {
        id: eventId,
        userId,
        timestamp,
        message,
        analysis,
        thaiIntelligence,
        behavioralAnalysis,
        educationalTips,
        actionRequired: emergencyLevel !== 'none',
        emergencyLevel,
        familyAlert
      };
      
      // Store active event
      this.activeEvents.set(eventId, threatEvent);
      
      // Update metrics
      this.updateMetrics(threatEvent, startTime);
      
      // Generate alerts if necessary
      await this.processAlerts(threatEvent);
      
      // Emit real-time event for external listeners
      this.emit('threatDetected', threatEvent);
      
      console.log('✅ Real-time analysis completed:', {
        eventId,
        userId,
        emergencyLevel,
        familyAlert,
        processingTime: Date.now() - startTime
      });
      
      return threatEvent;
      
    } catch (error) {
      console.error('❌ Real-time analysis failed:', error);
      
      // Create fallback event
      const fallbackEvent: RealTimeThreatEvent = {
        id: eventId,
        userId,
        timestamp,
        message,
        analysis: {
          riskScore: 0.5,
          riskLevel: 'MEDIUM',
          threatType: 'SAFE',
          confidence: 0.3,
          detectedPatterns: ['analysis_failed'],
          suspiciousKeywords: [],
          urls: [],
          phoneNumbers: [],
          trustedPhoneNumbers: [],
          suspiciousPhoneNumbers: [],
          recommendations: ['ไม่สามารถวิเคราะห์ได้ กรุณาระวัง'],
          analysisMethod: 'basic' as const,
          allowFeedback: false,
          processingTime: Date.now() - startTime
        },
        thaiIntelligence: {
          threatCategory: null,
          iocMatches: [],
          riskScore: 0.3,
          educationalTips: ['ตรวจสอบข้อความอย่างระมัดระวัง'],
          elderlyWarnings: ['ปรึกษาครอบครัวหากไม่แน่ใจ']
        },
        behavioralAnalysis: {
          isDuressDetected: false,
          confidenceLevel: 0,
          indicators: [],
          elderlySpecificRisks: [],
          recommendations: [],
          emergencyContact: false
        },
        educationalTips: [],
        actionRequired: false,
        emergencyLevel: 'none',
        familyAlert: false
      };
      
      return fallbackEvent;
    }
  }

  private determineEmergencyLevel(
    analysis: ThreatAnalysisResult,
    behavioralAnalysis: DuressAnalysis,
    isElderly: boolean
  ): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    
    let level: 'none' | 'low' | 'medium' | 'high' | 'critical' = 'none';
    
    // Base level on threat analysis
    switch (analysis.riskLevel) {
      case 'CRITICAL':
        level = 'critical';
        break;
      case 'HIGH':
        level = 'high';
        break;
      case 'MEDIUM':
        level = 'medium';
        break;
      case 'LOW':
        level = 'low';
        break;
    }
    
    // Upgrade if duress detected
    if (behavioralAnalysis.isDuressDetected) {
      if (level === 'none' || level === 'low') {
        level = 'medium';
      }
      if (isElderly && behavioralAnalysis.emergencyContact) {
        level = 'high';
      }
    }
    
    // Special consideration for elderly users
    if (isElderly && (analysis.riskLevel === 'HIGH' || analysis.riskLevel === 'CRITICAL')) {
      level = 'critical';
    }
    
    return level;
  }

  private shouldTriggerFamilyAlert(
    analysis: ThreatAnalysisResult,
    behavioralAnalysis: DuressAnalysis,
    isElderly: boolean
  ): boolean {
    
    // Always alert for elderly critical threats
    if (isElderly && analysis.riskLevel === 'CRITICAL') {
      return true;
    }
    
    // Alert if duress detected with emergency contact flag
    if (behavioralAnalysis.isDuressDetected && behavioralAnalysis.emergencyContact) {
      return true;
    }
    
    // Alert for elderly users with high-risk financial threats
    if (isElderly && 
        analysis.riskLevel === 'HIGH' && 
        (analysis.threatType === 'PHISHING' || analysis.threatType === 'SCAM')) {
      return true;
    }
    
    return false;
  }

  private async processAlerts(event: RealTimeThreatEvent): Promise<void> {
    const alerts: ThreatAlert[] = [];
    
    // Create threat alert
    if (event.actionRequired) {
      alerts.push({
        alertId: `threat_${event.id}`,
        userId: event.userId,
        alertType: 'threat_detected',
        severity: event.emergencyLevel === 'critical' ? 'critical' : 
                 event.emergencyLevel === 'high' ? 'high' : 'medium',
        message: `ตรวจพบภัยคุกคาม: ${event.analysis.threatType} (ระดับ: ${event.analysis.riskLevel})`,
        actionItems: event.analysis.recommendations.slice(0, 3),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });
    }
    
    // Create duress alert
    if (event.behavioralAnalysis.isDuressDetected) {
      alerts.push({
        alertId: `duress_${event.id}`,
        userId: event.userId,
        alertType: 'duress_detected',
        severity: event.behavioralAnalysis.confidenceLevel > 0.7 ? 'high' : 'medium',
        message: 'ตรวจพบสัญญาณการถูกบีบบังคับ',
        actionItems: event.behavioralAnalysis.recommendations,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
      });
    }
    
    // Create family alert
    if (event.familyAlert) {
      alerts.push({
        alertId: `family_${event.id}`,
        userId: event.userId,
        alertType: 'family_notification',
        severity: 'high',
        message: 'ผู้สูงอายุมีความเสี่ยงจากภัยคุกคาม ควรติดต่อครอบครัว',
        actionItems: [
          'โทรติดต่อครอบครัวทันที',
          'ตรวจสอบสถานการณ์ของผู้ใช้',
          'ให้คำแนะนำเพิ่มเติม'
        ],
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hours
      });
    }
    
    // Store alerts
    for (const alert of alerts) {
      this.activeAlerts.set(alert.alertId, alert);
      this.emit('alertGenerated', alert);
    }
  }

  private updateMetrics(event: RealTimeThreatEvent, startTime: number): void {
    const processingTime = Date.now() - startTime;
    
    // Update totals
    this.metrics.totalThreatsDetected++;
    
    if (this.behavioralBiometrics.isUserElderly(event.userId)) {
      this.metrics.elderlyUsersProtected++;
    }
    
    if (event.familyAlert) {
      this.metrics.familyAlertsTriggered++;
    }
    
    // Update average response time
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime + processingTime) / 2;
    
    // Update threat categories
    const category = event.analysis.threatType;
    this.metrics.threatCategories[category] = 
      (this.metrics.threatCategories[category] || 0) + 1;
    
    // Update hourly activity
    const hour = event.timestamp.getHours();
    this.metrics.hourlyActivity[hour]++;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startBackgroundMonitoring(): void {
    // Clean up expired events and alerts every hour
    setInterval(() => {
      this.cleanupExpiredData();
    }, 60 * 60 * 1000); // 1 hour
    
    // Generate daily threat summary
    setInterval(() => {
      this.generateDailyThreatSummary();
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    console.log('🔄 Background monitoring started');
  }

  private cleanupExpiredData(): void {
    const now = new Date();
    
    // Clean up old events (older than 24 hours)
    const eventCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    for (const [eventId, event] of this.activeEvents.entries()) {
      if (event.timestamp < eventCutoff) {
        this.activeEvents.delete(eventId);
      }
    }
    
    // Clean up expired alerts
    for (const [alertId, alert] of this.activeAlerts.entries()) {
      if (alert.expiresAt < now) {
        this.activeAlerts.delete(alertId);
      }
    }
    
    // Clean up old behavioral profiles
    this.behavioralBiometrics.cleanupOldProfiles(30);
    
    console.log('🧹 Cleaned up expired real-time data');
  }

  private async generateDailyThreatSummary(): Promise<void> {
    const summary = {
      date: new Date().toISOString().split('T')[0],
      metrics: { ...this.metrics },
      topThreats: Object.entries(this.metrics.threatCategories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      recommendations: await this.generateDailyRecommendations()
    };
    
    this.emit('dailySummary', summary);
    console.log('📊 Generated daily threat summary:', summary);
  }

  private async generateDailyRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];
    
    // Analyze trending threats
    const trendAnalysis = await this.educationalContent.getTrendingThreats();
    
    if (this.metrics.elderlyUsersProtected > 0) {
      recommendations.push(`วันนี้ปกป้องผู้สูงอายุ ${this.metrics.elderlyUsersProtected} คน`);
    }
    
    if (this.metrics.familyAlertsTriggered > 0) {
      recommendations.push(`ส่งแจ้งเตือนครอบครัว ${this.metrics.familyAlertsTriggered} ครั้ง`);
    }
    
    recommendations.push(...trendAnalysis.weeklyInsights.slice(0, 2));
    
    return recommendations;
  }

  // Public API methods
  
  getActiveEvents(userId?: string): RealTimeThreatEvent[] {
    if (userId) {
      return Array.from(this.activeEvents.values())
        .filter(event => event.userId === userId);
    }
    return Array.from(this.activeEvents.values());
  }

  getActiveAlerts(userId?: string): ThreatAlert[] {
    if (userId) {
      return Array.from(this.activeAlerts.values())
        .filter(alert => alert.userId === userId);
    }
    return Array.from(this.activeAlerts.values());
  }

  getMetrics(): RealTimeMetrics {
    return { ...this.metrics };
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      this.activeAlerts.delete(alertId);
      this.emit('alertAcknowledged', alert);
      return true;
    }
    return false;
  }

  async getElderlyUserReport(userId: string): Promise<{
    isElderly: boolean;
    riskFactors: string[];
    protectionTips: string[];
    recentThreats: number;
    familyAlert: boolean;
  }> {
    
    const behavioralReport = await this.behavioralBiometrics.generateElderlyReport(userId);
    const userEvents = this.getActiveEvents(userId);
    const recentThreats = userEvents.filter(
      event => event.analysis.riskLevel === 'HIGH' || event.analysis.riskLevel === 'CRITICAL'
    ).length;
    
    return {
      ...behavioralReport,
      recentThreats,
      familyAlert: userEvents.some(event => event.familyAlert)
    };
  }

  // Emergency response methods
  
  async triggerEmergencyProtocol(userId: string, reason: string): Promise<void> {
    const emergencyAlert: ThreatAlert = {
      alertId: `emergency_${Date.now()}`,
      userId,
      alertType: 'family_notification',
      severity: 'critical',
      message: `เรียกใช้โปรโตคอลฉุกเฉิน: ${reason}`,
      actionItems: [
        'ติดต่อผู้ใช้ทันที',
        'แจ้งครอบครัวและผู้ติดต่อฉุกเฉิน',
        'บันทึกเหตุการณ์เพื่อติดตาม'
      ],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
    
    this.activeAlerts.set(emergencyAlert.alertId, emergencyAlert);
    this.emit('emergencyTriggered', emergencyAlert);
    
    console.log('🚨 Emergency protocol triggered:', { userId, reason });
  }

  async pauseMonitoring(userId: string, durationMinutes: number = 60): Promise<void> {
    // Implementation would pause monitoring for specific user
    console.log(`⏸️ Monitoring paused for user ${userId} for ${durationMinutes} minutes`);
    this.emit('monitoringPaused', { userId, durationMinutes });
  }
}