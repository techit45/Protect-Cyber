/**
 * Feedback Learning System for Continuous Improvement
 * ระบบเรียนรู้จากผลป้อนกลับเพื่อปรับปรุงความแม่นยำ
 */

import { ThreatAnalysisResult } from './threatDetector';
import { MachineLearningDetectorService, MLFeatureVector, TrainingData } from './machineLearningDetector';

export interface UserFeedback {
  id: string;
  userId: string;
  messageId: string;
  originalMessage: string;
  originalResult: ThreatAnalysisResult;
  feedbackType: 'correct' | 'false_positive' | 'false_negative' | 'partially_correct';
  userComment?: string;
  correctedThreatType?: string;
  correctedRiskLevel?: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: Date;
  processed: boolean;
  confidence: number; // User's confidence in their feedback (0-1)
}

export interface LearningMetrics {
  totalFeedback: number;
  correctPredictions: number;
  falsePositives: number;
  falseNegatives: number;
  partiallyCorrect: number;
  accuracyImprovement: number;
  lastLearningUpdate: Date;
  modelVersion: string;
}

export interface PatternLearning {
  pattern: string;
  frequency: number;
  accuracy: number;
  contexts: string[];
  lastSeen: Date;
  userConfidence: number;
  needsReview: boolean;
}

export class FeedbackLearningSystem {
  private feedback: UserFeedback[] = [];
  private patternDatabase: Map<string, PatternLearning> = new Map();
  private mlDetector: MachineLearningDetectorService;
  private readonly MAX_FEEDBACK_STORAGE = 10000;
  private readonly LEARNING_BATCH_SIZE = 50;
  private readonly PATTERN_CONFIDENCE_THRESHOLD = 0.7;

  constructor(mlDetector: MachineLearningDetectorService) {
    this.mlDetector = mlDetector;
    this.initializePatternDatabase();
  }

  /**
   * Record user feedback for learning
   */
  public async recordFeedback(feedback: Omit<UserFeedback, 'id' | 'timestamp' | 'processed'>): Promise<string> {
    const feedbackEntry: UserFeedback = {
      ...feedback,
      id: this.generateFeedbackId(),
      timestamp: new Date(),
      processed: false
    };

    this.feedback.push(feedbackEntry);

    // Immediate learning for high-confidence feedback
    if (feedback.confidence > this.PATTERN_CONFIDENCE_THRESHOLD) {
      await this.processImmediateLearning(feedbackEntry);
    }

    // Batch learning when we have enough feedback
    if (this.feedback.filter(f => !f.processed).length >= this.LEARNING_BATCH_SIZE) {
      await this.processBatchLearning();
    }

    // Update pattern database
    this.updatePatternDatabase(feedbackEntry);

    // Cleanup old feedback if needed
    this.cleanupOldFeedback();

    console.log(`📝 Recorded feedback: ${feedback.feedbackType} (confidence: ${feedback.confidence})`);
    return feedbackEntry.id;
  }

  /**
   * Get learning metrics and statistics
   */
  public getLearningMetrics(): LearningMetrics {
    const total = this.feedback.length;
    const correct = this.feedback.filter(f => f.feedbackType === 'correct').length;
    const falsePositives = this.feedback.filter(f => f.feedbackType === 'false_positive').length;
    const falseNegatives = this.feedback.filter(f => f.feedbackType === 'false_negative').length;
    const partiallyCorrect = this.feedback.filter(f => f.feedbackType === 'partially_correct').length;

    // Calculate accuracy improvement over time
    const recentFeedback = this.feedback.filter(f => 
      f.timestamp.getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000) // Last 7 days
    );
    const recentAccuracy = recentFeedback.length > 0 ? 
      recentFeedback.filter(f => f.feedbackType === 'correct').length / recentFeedback.length : 0;

    const olderFeedback = this.feedback.filter(f => 
      f.timestamp.getTime() <= Date.now() - (7 * 24 * 60 * 60 * 1000) &&
      f.timestamp.getTime() > Date.now() - (14 * 24 * 60 * 60 * 1000) // 7-14 days ago
    );
    const olderAccuracy = olderFeedback.length > 0 ? 
      olderFeedback.filter(f => f.feedbackType === 'correct').length / olderFeedback.length : 0;

    return {
      totalFeedback: total,
      correctPredictions: correct,
      falsePositives,
      falseNegatives,
      partiallyCorrect,
      accuracyImprovement: recentAccuracy - olderAccuracy,
      lastLearningUpdate: this.getLastLearningUpdate(),
      modelVersion: this.getModelVersion()
    };
  }

  /**
   * Get patterns that need review
   */
  public getPatternsNeedingReview(): PatternLearning[] {
    return Array.from(this.patternDatabase.values())
      .filter(pattern => pattern.needsReview || pattern.accuracy < 0.6)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  /**
   * Get most confident learned patterns
   */
  public getLearnedPatterns(limit: number = 20): PatternLearning[] {
    return Array.from(this.patternDatabase.values())
      .filter(pattern => pattern.accuracy > this.PATTERN_CONFIDENCE_THRESHOLD)
      .sort((a, b) => b.userConfidence - a.userConfidence)
      .slice(0, limit);
  }

  /**
   * Process feedback to improve future predictions
   */
  public async processImprovements(): Promise<{
    patternsUpdated: number;
    modelUpdated: boolean;
    accuracyGain: number;
  }> {
    let patternsUpdated = 0;
    let accuracyGain = 0;

    // Process unprocessed feedback
    const unprocessedFeedback = this.feedback.filter(f => !f.processed);
    
    for (const feedback of unprocessedFeedback) {
      // Update ML model
      await this.mlDetector.learnFromFeedback(
        feedback.originalMessage,
        feedback.feedbackType as any,
        feedback.originalResult
      );

      // Update patterns
      if (this.updatePatternsFromFeedback(feedback)) {
        patternsUpdated++;
      }

      feedback.processed = true;
    }

    // Calculate accuracy improvement
    const metrics = this.getLearningMetrics();
    accuracyGain = metrics.accuracyImprovement;

    console.log(`🎓 Processed improvements: ${patternsUpdated} patterns, accuracy gain: ${(accuracyGain * 100).toFixed(1)}%`);

    return {
      patternsUpdated,
      modelUpdated: unprocessedFeedback.length > 0,
      accuracyGain
    };
  }

  /**
   * Generate recommendations for system improvements
   */
  public generateImprovementRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.getLearningMetrics();

    // False positive analysis
    if (metrics.falsePositives / metrics.totalFeedback > 0.15) {
      recommendations.push('🔍 ระบบตรวจจับ False Positive สูง - ควรปรับปรุงการกรองข้อความจากแหล่งที่เชื่อถือได้');
    }

    // False negative analysis
    if (metrics.falseNegatives / metrics.totalFeedback > 0.10) {
      recommendations.push('⚠️ มีภัยคุกคามที่หลุดการตรวจจับ - ควรเพิ่มการตรวจจับรูปแบบใหม่');
    }

    // Pattern analysis
    const lowAccuracyPatterns = this.getPatternsNeedingReview();
    if (lowAccuracyPatterns.length > 5) {
      recommendations.push(`📊 มี ${lowAccuracyPatterns.length} รูปแบบที่ต้องการการปรับปรุง`);
    }

    // Data quality
    if (metrics.totalFeedback < 100) {
      recommendations.push('📝 ต้องการข้อมูล feedback เพิ่มเติมเพื่อการเรียนรู้ที่ดีขึ้น');
    }

    // Accuracy trend
    if (metrics.accuracyImprovement < 0) {
      recommendations.push('📉 ความแม่นยำลดลง - ควรทบทวนการเปลี่ยนแปลงล่าสุด');
    } else if (metrics.accuracyImprovement > 0.1) {
      recommendations.push('📈 ความแม่นยำดีขึ้นเรื่อยๆ - กำลังเรียนรู้ได้ดี');
    }

    return recommendations;
  }

  /**
   * Export learning data for analysis
   */
  public exportLearningData(): {
    feedback: UserFeedback[];
    patterns: PatternLearning[];
    metrics: LearningMetrics;
    exportTimestamp: Date;
  } {
    return {
      feedback: this.feedback.map(f => ({ ...f })), // Deep copy
      patterns: Array.from(this.patternDatabase.values()),
      metrics: this.getLearningMetrics(),
      exportTimestamp: new Date()
    };
  }

  /**
   * Import learning data from previous sessions
   */
  public importLearningData(data: {
    feedback: UserFeedback[];
    patterns: PatternLearning[];
  }): void {
    // Merge feedback data
    this.feedback = [...this.feedback, ...data.feedback];
    
    // Remove duplicates
    const feedbackMap = new Map();
    this.feedback.forEach(f => feedbackMap.set(f.id, f));
    this.feedback = Array.from(feedbackMap.values());

    // Merge pattern data
    data.patterns.forEach(pattern => {
      const existing = this.patternDatabase.get(pattern.pattern);
      if (existing) {
        // Merge pattern data
        existing.frequency += pattern.frequency;
        existing.accuracy = (existing.accuracy + pattern.accuracy) / 2;
        existing.userConfidence = Math.max(existing.userConfidence, pattern.userConfidence);
        existing.contexts = [...new Set([...existing.contexts, ...pattern.contexts])];
        existing.lastSeen = new Date(Math.max(existing.lastSeen.getTime(), pattern.lastSeen.getTime()));
      } else {
        this.patternDatabase.set(pattern.pattern, pattern);
      }
    });

    console.log(`📥 Imported learning data: ${data.feedback.length} feedback entries, ${data.patterns.length} patterns`);
  }

  // Private methods
  private async processImmediateLearning(feedback: UserFeedback): Promise<void> {
    try {
      // Quick learning from high-confidence feedback
      await this.mlDetector.learnFromFeedback(
        feedback.originalMessage,
        feedback.feedbackType as any,
        feedback.originalResult
      );

      feedback.processed = true;
      console.log(`⚡ Immediate learning applied for: ${feedback.feedbackType}`);
    } catch (error) {
      console.error('❌ Immediate learning failed:', error);
    }
  }

  private async processBatchLearning(): Promise<void> {
    const unprocessedFeedback = this.feedback.filter(f => !f.processed).slice(0, this.LEARNING_BATCH_SIZE);
    
    console.log(`🎓 Processing batch learning for ${unprocessedFeedback.length} feedback entries`);

    for (const feedback of unprocessedFeedback) {
      try {
        await this.mlDetector.learnFromFeedback(
          feedback.originalMessage,
          feedback.feedbackType as any,
          feedback.originalResult
        );
        feedback.processed = true;
      } catch (error) {
        console.error('❌ Batch learning failed for feedback:', feedback.id, error);
      }
    }
  }

  private updatePatternDatabase(feedback: UserFeedback): void {
    // Extract patterns from the message
    const patterns = this.extractPatterns(feedback.originalMessage);
    
    patterns.forEach(pattern => {
      const existing = this.patternDatabase.get(pattern);
      
      if (existing) {
        existing.frequency++;
        existing.lastSeen = new Date();
        
        // Update accuracy based on feedback
        if (feedback.feedbackType === 'correct') {
          existing.accuracy = (existing.accuracy * existing.frequency + 1) / (existing.frequency + 1);
        } else if (feedback.feedbackType === 'false_positive' || feedback.feedbackType === 'false_negative') {
          existing.accuracy = (existing.accuracy * existing.frequency + 0) / (existing.frequency + 1);
          existing.needsReview = true;
        }
        
        existing.userConfidence = (existing.userConfidence + feedback.confidence) / 2;
        
        // Add context
        const context = this.getMessageContext(feedback.originalMessage);
        if (!existing.contexts.includes(context)) {
          existing.contexts.push(context);
        }
      } else {
        this.patternDatabase.set(pattern, {
          pattern,
          frequency: 1,
          accuracy: feedback.feedbackType === 'correct' ? 1 : 0,
          contexts: [this.getMessageContext(feedback.originalMessage)],
          lastSeen: new Date(),
          userConfidence: feedback.confidence,
          needsReview: feedback.feedbackType !== 'correct'
        });
      }
    });
  }

  private updatePatternsFromFeedback(feedback: UserFeedback): boolean {
    const patterns = this.extractPatterns(feedback.originalMessage);
    let updated = false;

    patterns.forEach(pattern => {
      const patternData = this.patternDatabase.get(pattern);
      if (patternData) {
        // Adjust pattern scoring based on feedback
        if (feedback.feedbackType === 'false_positive') {
          patternData.accuracy *= 0.9; // Reduce accuracy
          patternData.needsReview = true;
          updated = true;
        } else if (feedback.feedbackType === 'false_negative') {
          patternData.accuracy = Math.min(1, patternData.accuracy * 1.1); // Increase accuracy
          updated = true;
        }
      }
    });

    return updated;
  }

  private extractPatterns(message: string): string[] {
    const patterns: string[] = [];
    
    // Common Thai threat patterns
    const threatPatterns = [
      /ระงับบัญชี/g,
      /ยืนยันตัวตน/g,
      /โอนเงิน.*ด่วน/g,
      /รางวัล.*โชคดี/g,
      /ชำระ.*ค่าธรรมเนียม/g,
      /คลิก.*ลิงค์/g,
      /กรอก.*ข้อมูล/g,
      /หมดอายุ.*\d+.*วัน/g
    ];

    threatPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        patterns.push(...matches);
      }
    });

    // Extract phone number patterns
    const phoneMatches = message.match(/0[6-9]\d{8}/g);
    if (phoneMatches) {
      patterns.push(`phone_pattern_${phoneMatches.length}`);
    }

    // Extract URL patterns
    const urlMatches = message.match(/(https?:\/\/[^\s]+)/g);
    if (urlMatches) {
      patterns.push(`url_pattern_${urlMatches.length}`);
    }

    return patterns;
  }

  private getMessageContext(message: string): string {
    if (message.includes('ธนาคาร') || message.includes('บัญชี')) return 'banking';
    if (message.includes('รางวัล') || message.includes('โชคดี')) return 'lottery';
    if (message.includes('เงิน') || message.includes('โอน')) return 'financial';
    if (message.includes('ลิงค์') || message.includes('คลิก')) return 'phishing';
    if (message.includes('ด่วน') || message.includes('รีบ')) return 'urgent';
    return 'general';
  }

  private initializePatternDatabase(): void {
    // Initialize with some known patterns
    const knownPatterns = [
      { pattern: 'ระงับบัญชี', accuracy: 0.9, context: 'banking' },
      { pattern: 'ยืนยันตัวตน', accuracy: 0.85, context: 'banking' },
      { pattern: 'รางวัลโชคดี', accuracy: 0.8, context: 'lottery' },
      { pattern: 'โอนเงินด่วน', accuracy: 0.95, context: 'financial' },
      { pattern: 'คลิกลิงค์', accuracy: 0.75, context: 'phishing' }
    ];

    knownPatterns.forEach(({ pattern, accuracy, context }) => {
      this.patternDatabase.set(pattern, {
        pattern,
        frequency: 1,
        accuracy,
        contexts: [context],
        lastSeen: new Date(),
        userConfidence: 0.8,
        needsReview: false
      });
    });
  }

  private generateFeedbackId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private cleanupOldFeedback(): void {
    if (this.feedback.length > this.MAX_FEEDBACK_STORAGE) {
      // Keep only the most recent feedback
      this.feedback.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      this.feedback = this.feedback.slice(0, this.MAX_FEEDBACK_STORAGE);
    }
  }

  private getLastLearningUpdate(): Date {
    const lastProcessed = this.feedback.filter(f => f.processed).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
    return lastProcessed ? lastProcessed.timestamp : new Date(0);
  }

  private getModelVersion(): string {
    return `v1.0.${this.feedback.filter(f => f.processed).length}`;
  }
}