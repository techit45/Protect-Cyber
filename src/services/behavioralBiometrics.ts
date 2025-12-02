import crypto from 'crypto';

export interface UserBehaviorProfile {
  userId: string;
  age?: number;
  isElderly: boolean; // 60+ years old
  behaviorPatterns: {
    typingSpeed: number; // characters per minute
    responseTime: number; // average time to respond in seconds
    messageLength: number; // average message length
    errorRate: number; // typing errors per message
    sessionDuration: number; // average session length in minutes
    timeOfDay: number[]; // preferred hours (0-23)
    weeklyActivity: number[]; // activity per day (0-6, Mon-Sun)
  };
  duressIndicators: {
    hastySend: boolean; // messages sent too quickly
    unusualTime: boolean; // activity at unusual hours
    shortResponses: boolean; // abnormally short responses
    repetitiveMessages: boolean; // repeated urgent requests
    familiarityDrop: boolean; // unfamiliar language patterns
  };
  lastUpdate: Date;
  trustScore: number; // 0-1, higher = more normal behavior
}

export interface DuressAnalysis {
  isDuressDetected: boolean;
  confidenceLevel: number; // 0-1
  indicators: string[];
  elderlySpecificRisks: string[];
  recommendations: string[];
  emergencyContact: boolean; // should family be notified
}

export class BehavioralBiometricsService {
  private userProfiles: Map<string, UserBehaviorProfile> = new Map();
  
  // Baseline patterns for elderly users based on research
  private readonly elderlyBaseline = {
    typingSpeed: 45, // slower typing (45 CPM vs 65 CPM for younger)
    responseTime: 180, // slower response (3 minutes vs 1 minute)
    messageLength: 25, // shorter messages
    errorRate: 0.08, // higher error rate
    sessionDuration: 15, // shorter sessions
    preferredHours: [8, 9, 10, 11, 14, 15, 16, 17, 18, 19], // daytime hours
    weeklyPattern: [0.6, 0.8, 0.8, 0.8, 0.8, 0.9, 0.7] // less weekend activity
  };

  async analyzeUserBehavior(
    userId: string, 
    message: string, 
    timestamp: Date,
    sessionData?: {
      typingDuration?: number;
      characterCount?: number;
      errors?: number;
    }
  ): Promise<DuressAnalysis> {
    
    console.log('🧠 Analyzing behavioral biometrics for user:', userId);
    
    // Get or create user profile
    let profile = this.userProfiles.get(userId);
    if (!profile) {
      profile = this.createNewProfile(userId);
      this.userProfiles.set(userId, profile);
    }
    
    // Update behavior patterns
    this.updateBehaviorPatterns(profile, message, timestamp, sessionData);
    
    // Analyze for duress indicators
    const duressAnalysis = this.analyzeForDuress(profile, message, timestamp);
    
    // Update trust score
    profile.trustScore = this.calculateTrustScore(profile);
    profile.lastUpdate = timestamp;
    
    console.log('🧠 Behavioral analysis completed:', {
      userId,
      isDuress: duressAnalysis.isDuressDetected,
      trustScore: profile.trustScore,
      isElderly: profile.isElderly
    });
    
    return duressAnalysis;
  }

  private createNewProfile(userId: string): UserBehaviorProfile {
    return {
      userId,
      isElderly: false, // Will be determined by behavior patterns
      behaviorPatterns: {
        typingSpeed: 0,
        responseTime: 0,
        messageLength: 0,
        errorRate: 0,
        sessionDuration: 0,
        timeOfDay: [],
        weeklyActivity: [0, 0, 0, 0, 0, 0, 0]
      },
      duressIndicators: {
        hastySend: false,
        unusualTime: false,
        shortResponses: false,
        repetitiveMessages: false,
        familiarityDrop: false
      },
      lastUpdate: new Date(),
      trustScore: 0.5
    };
  }

  private updateBehaviorPatterns(
    profile: UserBehaviorProfile,
    message: string,
    timestamp: Date,
    sessionData?: {
      typingDuration?: number;
      characterCount?: number;
      errors?: number;
    }
  ): void {
    
    const hour = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();
    const messageLength = message.length;
    
    // Update message length (rolling average)
    profile.behaviorPatterns.messageLength = this.updateRollingAverage(
      profile.behaviorPatterns.messageLength,
      messageLength,
      0.1
    );
    
    // Update typing speed if available
    if (sessionData?.typingDuration && sessionData?.characterCount) {
      const typingSpeed = (sessionData.characterCount / sessionData.typingDuration) * 60; // CPM
      profile.behaviorPatterns.typingSpeed = this.updateRollingAverage(
        profile.behaviorPatterns.typingSpeed,
        typingSpeed,
        0.1
      );
    }
    
    // Update error rate if available
    if (sessionData?.errors !== undefined) {
      const errorRate = sessionData.errors / messageLength;
      profile.behaviorPatterns.errorRate = this.updateRollingAverage(
        profile.behaviorPatterns.errorRate,
        errorRate,
        0.1
      );
    }
    
    // Update time patterns
    if (!profile.behaviorPatterns.timeOfDay.includes(hour)) {
      profile.behaviorPatterns.timeOfDay.push(hour);
      if (profile.behaviorPatterns.timeOfDay.length > 10) {
        profile.behaviorPatterns.timeOfDay.shift(); // Keep only recent patterns
      }
    }
    
    // Update weekly activity
    profile.behaviorPatterns.weeklyActivity[dayOfWeek] += 0.1;
    
    // Determine if user is likely elderly based on patterns
    this.updateElderlyClassification(profile);
  }

  private updateElderlyClassification(profile: UserBehaviorProfile): void {
    let elderlyScore = 0;
    
    // Slow typing indicates elderly
    if (profile.behaviorPatterns.typingSpeed > 0 && 
        profile.behaviorPatterns.typingSpeed < this.elderlyBaseline.typingSpeed) {
      elderlyScore += 0.3;
    }
    
    // High error rate
    if (profile.behaviorPatterns.errorRate > this.elderlyBaseline.errorRate) {
      elderlyScore += 0.2;
    }
    
    // Shorter messages
    if (profile.behaviorPatterns.messageLength < this.elderlyBaseline.messageLength) {
      elderlyScore += 0.2;
    }
    
    // Daytime activity preference
    const daytimeActivity = profile.behaviorPatterns.timeOfDay.filter(
      hour => this.elderlyBaseline.preferredHours.includes(hour)
    ).length;
    if (daytimeActivity / profile.behaviorPatterns.timeOfDay.length > 0.7) {
      elderlyScore += 0.3;
    }
    
    profile.isElderly = elderlyScore > 0.6;
  }

  private analyzeForDuress(
    profile: UserBehaviorProfile,
    message: string,
    timestamp: Date
  ): DuressAnalysis {
    
    const indicators: string[] = [];
    const elderlyRisks: string[] = [];
    const recommendations: string[] = [];
    let confidenceLevel = 0;
    let emergencyContact = false;
    
    // Check for hasty sending (too fast for elderly users)
    if (profile.isElderly && profile.behaviorPatterns.typingSpeed > 0) {
      const expectedTime = message.length / profile.behaviorPatterns.typingSpeed * 60;
      if (expectedTime > 30) { // Message should take more than 30 seconds normally
        indicators.push('ข้อความถูกส่งเร็วผิดปกติ');
        elderlyRisks.push('อาจถูกบีบบังคับให้ส่งข้อความ');
        confidenceLevel += 0.3;
      }
    }
    
    // Check for unusual time activity
    const hour = timestamp.getHours();
    const isUnusualHour = (hour < 6 || hour > 22);
    if (profile.isElderly && isUnusualHour) {
      const normalTimeActivity = profile.behaviorPatterns.timeOfDay.filter(
        h => h >= 6 && h <= 22
      ).length;
      
      if (normalTimeActivity > 5) { // User normally active during daytime
        indicators.push('กิจกรรมในเวลาผิดปกติ');
        elderlyRisks.push('ผู้สูงอายุไม่ควรใช้งานในช่วงเวลานี้');
        confidenceLevel += 0.25;
      }
    }
    
    // Check for abnormally short responses
    if (message.length < 5 && profile.behaviorPatterns.messageLength > 15) {
      indicators.push('ข้อความสั้นผิดปกติ');
      confidenceLevel += 0.2;
    }
    
    // Check for repeated urgent keywords (potential coercion)
    const urgentKeywords = ['ด่วน', 'รีบ', 'ทันที', 'ช่วย', 'เร็ว'];
    const urgentCount = urgentKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword)
    ).length;
    
    if (urgentCount > 1) {
      indicators.push('ใช้คำเร่งด่วนมากเกินไป');
      if (profile.isElderly) {
        elderlyRisks.push('อาจถูกหลอกให้รีบตัดสินใจ');
        emergencyContact = true;
      }
      confidenceLevel += 0.4;
    }
    
    // Check for money-related keywords (financial duress)
    const moneyKeywords = ['เงิน', 'ชำระ', 'โอน', 'บัญชี', 'รีบจ่าย'];
    const moneyCount = moneyKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword)
    ).length;
    
    if (moneyCount > 0 && urgentCount > 0) {
      indicators.push('ข้อความเกี่ยวกับเงินที่เร่งด่วน');
      if (profile.isElderly) {
        elderlyRisks.push('เสี่ยงการหลอกลวงทางการเงิน');
        emergencyContact = true;
      }
      confidenceLevel += 0.5;
    }
    
    // Generate recommendations
    if (confidenceLevel > 0.3) {
      recommendations.push('ตรวจสอบสภาพจิตใจของผู้ใช้');
      
      if (profile.isElderly) {
        recommendations.push('ติดต่อสมาชิกในครอบครัวเพื่อยืนยัน');
        recommendations.push('สอบถามเพิ่มเติมเพื่อความมั่นใจ');
      }
    }
    
    if (emergencyContact) {
      recommendations.push('แจ้งเตือนผู้ติดต่อฉุกเฉินทันที');
      recommendations.push('บันทึกข้อความสำหรับการตรวจสอบ');
    }
    
    const isDuressDetected = confidenceLevel > 0.4;
    
    return {
      isDuressDetected,
      confidenceLevel,
      indicators,
      elderlySpecificRisks: elderlyRisks,
      recommendations,
      emergencyContact
    };
  }

  private calculateTrustScore(profile: UserBehaviorProfile): number {
    let score = 0.5; // Base score
    
    // Consistent behavior patterns increase trust
    if (profile.behaviorPatterns.timeOfDay.length > 5) {
      score += 0.2; // Has established time patterns
    }
    
    // Stable typing patterns
    if (profile.behaviorPatterns.typingSpeed > 0 && 
        profile.behaviorPatterns.errorRate < 0.15) {
      score += 0.2;
    }
    
    // Regular activity increases trust
    const totalActivity = profile.behaviorPatterns.weeklyActivity.reduce((a, b) => a + b, 0);
    if (totalActivity > 5) {
      score += 0.1;
    }
    
    return Math.min(Math.max(score, 0), 1);
  }

  private updateRollingAverage(currentAvg: number, newValue: number, alpha: number): number {
    if (currentAvg === 0) return newValue;
    return (1 - alpha) * currentAvg + alpha * newValue;
  }

  // Public methods for external use
  
  getUserProfile(userId: string): UserBehaviorProfile | undefined {
    return this.userProfiles.get(userId);
  }

  isUserElderly(userId: string): boolean {
    const profile = this.userProfiles.get(userId);
    return profile?.isElderly || false;
  }

  setUserAge(userId: string, age: number): void {
    let profile = this.userProfiles.get(userId);
    if (!profile) {
      profile = this.createNewProfile(userId);
      this.userProfiles.set(userId, profile);
    }
    
    profile.age = age;
    profile.isElderly = age >= 60;
  }

  async generateElderlyReport(userId: string): Promise<{
    isElderly: boolean;
    riskFactors: string[];
    protectionTips: string[];
    familyAlert: boolean;
  }> {
    
    const profile = this.userProfiles.get(userId);
    
    if (!profile?.isElderly) {
      return {
        isElderly: false,
        riskFactors: [],
        protectionTips: [],
        familyAlert: false
      };
    }
    
    const riskFactors: string[] = [];
    const protectionTips: string[] = [];
    let familyAlert = false;
    
    // Analyze risk factors
    if (profile.behaviorPatterns.errorRate > 0.1) {
      riskFactors.push('อัตราการพิมพ์ผิดสูง อาจส่งผลต่อการตัดสินใจ');
      protectionTips.push('ตรวจสอบข้อความก่อนส่งทุกครั้ง');
    }
    
    if (profile.trustScore < 0.4) {
      riskFactors.push('รูปแบบพฤติกรรมไม่สม่ำเสมอ');
      protectionTips.push('ขอให้ครอบครัวช่วยตรวจสอบข้อความสำคัญ');
      familyAlert = true;
    }
    
    // General elderly protection tips
    protectionTips.push(
      'ไม่ให้ข้อมูลส่วนตัวผ่านข้อความ',
      'ปรึกษาลูกหลานก่อนทำธุรกรรมทางการเงิน',
      'ระวังข้อความที่สร้างความเร่งด่วน'
    );
    
    return {
      isElderly: true,
      riskFactors,
      protectionTips,
      familyAlert
    };
  }

  // Cleanup old profiles (call periodically)
  cleanupOldProfiles(daysOld: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    for (const [userId, profile] of this.userProfiles.entries()) {
      if (profile.lastUpdate < cutoffDate) {
        this.userProfiles.delete(userId);
      }
    }
    
    console.log(`🧹 Cleaned up behavioral profiles older than ${daysOld} days`);
  }
}