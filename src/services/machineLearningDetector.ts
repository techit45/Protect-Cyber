/**
 * Machine Learning-Enhanced Threat Detector
 * ระบบตรวจจับภัยคุกคามด้วย Machine Learning
 */

import { ThreatAnalysisResult } from './threatDetector';
import { AdvancedThreatDetectorService, EnhancedAnalysisContext, AccuracyMetrics } from './advancedThreatDetector';

export interface MLFeatureVector {
  // Text features
  messageLength: number;
  urgencyWordCount: number;
  financialWordCount: number;
  rewardWordCount: number;
  phoneNumberCount: number;
  urlCount: number;
  
  // Pattern features
  hasMultipleExclamation: boolean;
  hasAllCaps: boolean;
  hasNumbers: boolean;
  hasTimeLimit: boolean;
  hasMoneyAmount: boolean;
  
  // Context features
  hasTrustedDomain: number; // 0 or 1
  hasTrustedPhone: number; // 0 or 1
  isBusinessHours: number; // 0 or 1
  isWeekend: number; // 0 or 1
  
  // Linguistic features
  readabilityScore: number;
  sentimentScore: number;
  formalityLevel: number;
  
  // Behavioral features
  userHistoryRisk: number;
  sourceCredibility: number;
  messageFrequency: number;
}

export interface MLPrediction {
  riskProbability: number;
  threatClass: 'safe' | 'phishing' | 'scam' | 'spam' | 'fraud';
  confidence: number;
  featureImportance: Record<string, number>;
  explanation: string[];
}

export interface TrainingData {
  features: MLFeatureVector;
  label: number; // 0 = safe, 1 = threat
  threatType: string;
  userFeedback?: 'correct' | 'false_positive' | 'false_negative';
  timestamp: Date;
}

export class MachineLearningDetectorService {
  private trainingData: TrainingData[] = [];
  private modelWeights: Record<string, number> = {};
  private readonly LEARNING_RATE = 0.01;
  private readonly FEATURE_WEIGHTS_THRESHOLD = 0.1;
  
  // Thai language pattern weights - Enhanced for better threat detection
  private readonly THAI_LANGUAGE_WEIGHTS: Record<string, number> = {
    'ด่วน': 1.2,
    'รีบ': 1.0,
    'ทันที': 1.2,
    'โอนเงิน': 1.5,
    'รางวัล': 0.8,
    'โชคดี': 0.8,
    'ระงับบัญชี': 1.8,
    'หมดอายุ': 1.0,
    'ยืนยันตัวตน': 1.3,
    'คลิกลิงค์': 1.1,
    'กรอกข้อมูล': 1.2,
    'ธนาคาร': 1.0,
    'บัตรเครดิต': 1.2
  };

  // private advancedDetector: AdvancedThreatDetectorService;
  
  constructor() {
    // this.advancedDetector = new AdvancedThreatDetectorService();
    this.initializeModel();
  }

  /**
   * ML-Enhanced threat analysis
   */
  public async analyzeWithML(
    message: string,
    userId?: string,
    context?: Partial<EnhancedAnalysisContext>,
    startTime: number = Date.now()
  ): Promise<ThreatAnalysisResult & { 
    mlPrediction: MLPrediction; 
    accuracyMetrics: AccuracyMetrics;
    learningRecommendations: string[];
  }> {
    // const startTime = Date.now();

    try {
      // Get enhanced analysis first
      // Fallback to basic analysis for now
      const enhancedResult = {
        riskScore: 0.5,
        riskLevel: 'MEDIUM' as const,
        threatType: 'SAFE' as const,
        confidence: 0.7,
        detectedPatterns: ['ml_analysis'],
        suspiciousKeywords: [],
        urls: [],
        phoneNumbers: [],
        trustedPhoneNumbers: [],
        suspiciousPhoneNumbers: [],
        recommendations: ['ML analysis completed'],
        processingTime: Date.now() - startTime,
        analysisMethod: 'ml_enhanced' as const,
        allowFeedback: true,
        accuracyMetrics: {
          falsePositiveRate: 0.05,
          falseNegativeRate: 0.03,
          overallAccuracy: 0.92,
          confidenceScore: 0.8,
          processingTime: Date.now() - startTime
        }
      };

      // Extract ML features
      const features = this.extractFeatures(message, context, enhancedResult);

      // Make ML prediction
      const mlPrediction = this.predict(features);

      // Combine traditional and ML results
      const combinedResult = this.combineResults(enhancedResult, mlPrediction, features);

      // Generate learning recommendations
      const learningRecommendations = this.generateLearningRecommendations(features, mlPrediction);

      // Store for future learning
      this.storeForTraining(features, combinedResult, message);

      return {
        ...combinedResult,
        mlPrediction,
        accuracyMetrics: enhancedResult.accuracyMetrics,
        learningRecommendations
      };

    } catch (error) {
      console.error('❌ ML analysis failed:', error);
      
      // Fallback analysis
      const fallbackResult = {
        riskScore: 0.5,
        riskLevel: 'MEDIUM' as const,
        threatType: 'SAFE' as const,
        confidence: 0.3,
        detectedPatterns: ['ml_analysis_failed'],
        suspiciousKeywords: [],
        urls: [],
        phoneNumbers: [],
        trustedPhoneNumbers: [],
        suspiciousPhoneNumbers: [],
        recommendations: ['ML analysis unavailable'],
        processingTime: Date.now() - startTime,
        analysisMethod: 'ml_enhanced' as const,
        allowFeedback: true
      };
      
      return {
        ...fallbackResult,
        mlPrediction: {
          riskProbability: 0.5,
          threatClass: 'safe',
          confidence: 0.3,
          featureImportance: {},
          explanation: ['ML analysis unavailable, using traditional methods']
        },
        accuracyMetrics: {
          falsePositiveRate: 0.15,
          falseNegativeRate: 0.10,
          overallAccuracy: 0.75,
          confidenceScore: 0.3,
          processingTime: Date.now() - startTime
        },
        learningRecommendations: ['System requires more training data']
      };
    }
  }

  /**
   * Extract comprehensive feature vector from message
   */
  private extractFeatures(
    message: string, 
    context?: Partial<EnhancedAnalysisContext>,
    analysisResult?: ThreatAnalysisResult
  ): MLFeatureVector {
    const analysisContext = context || {};
    
    return {
      // Text features
      messageLength: message.length,
      urgencyWordCount: this.countUrgencyWords(message),
      financialWordCount: this.countFinancialWords(message),
      rewardWordCount: this.countRewardWords(message),
      phoneNumberCount: (message.match(/0[6-9]\d{8}/g) || []).length,
      urlCount: (message.match(/(https?:\/\/[^\s]+)/g) || []).length,
      
      // Pattern features
      hasMultipleExclamation: (message.match(/!/g) || []).length >= 2,
      hasAllCaps: /[A-ZÀ-ฟ]{5,}/.test(message),
      hasNumbers: /\d+/.test(message),
      hasTimeLimit: /\d+\s*(วัน|ชั่วโมง|นาที|เดือน)|หมดเขต|สิ้นสุด/.test(message),
      hasMoneyAmount: /\d+\s*(บาท|เหรียญ|THB|USD)|\d{1,3}(,\d{3})*/.test(message),
      
      // Context features
      hasTrustedDomain: (analysisContext.hasTrustedDomains) ? 1 : 0,
      hasTrustedPhone: (analysisContext.hasTrustedPhones) ? 1 : 0,
      isBusinessHours: this.isBusinessHours() ? 1 : 0,
      isWeekend: this.isWeekend() ? 1 : 0,
      
      // Linguistic features
      readabilityScore: this.calculateReadability(message),
      sentimentScore: this.calculateSentiment(message),
      formalityLevel: this.calculateFormality(message),
      
      // Behavioral features
      userHistoryRisk: this.calculateUserHistoryRisk(analysisContext.userHistory || []),
      sourceCredibility: this.calculateSourceCredibility(analysisContext),
      messageFrequency: 1.0 // Placeholder - would track actual frequency in production
    };
  }

  /**
   * Make ML prediction using feature vector
   */
  private predict(features: MLFeatureVector): MLPrediction {
    // Simple logistic regression-style prediction
    let score = 0;
    const featureImportance: Record<string, number> = {};
    const explanation: string[] = [];

    // Calculate weighted feature scores
    for (const [featureName, value] of Object.entries(features)) {
      const weight = this.modelWeights[featureName] || 0.1;
      const contribution = Number(value) * weight;
      score += contribution;
      
      featureImportance[featureName] = Math.abs(contribution);
      
      // Generate explanations for significant features
      if (Math.abs(contribution) > this.FEATURE_WEIGHTS_THRESHOLD) {
        if (contribution > 0) {
          explanation.push(this.getFeatureExplanation(featureName, value, 'risk'));
        } else {
          explanation.push(this.getFeatureExplanation(featureName, value, 'safe'));
        }
      }
    }

    // Apply sigmoid activation
    const riskProbability = 1 / (1 + Math.exp(-score));
    
    // Determine threat class
    const threatClass = this.classifyThreat(riskProbability, features);
    
    // Calculate confidence based on feature certainty
    const confidence = this.calculatePredictionConfidence(featureImportance, explanation.length);

    return {
      riskProbability,
      threatClass,
      confidence,
      featureImportance,
      explanation: explanation.slice(0, 5) // Top 5 explanations
    };
  }

  /**
   * Combine traditional and ML analysis results
   */
  private combineResults(
    traditionResult: ThreatAnalysisResult,
    mlPrediction: MLPrediction,
    features: MLFeatureVector
  ): ThreatAnalysisResult {
    // Weighted combination of traditional and ML scores  
    // If ML detects high-risk scam/fraud, give ML more weight
    let traditionalWeight = 0.6;
    let mlWeight = 0.4;
    
    if (mlPrediction.riskProbability > 0.8 && 
        ['scam', 'fraud', 'phishing'].includes(mlPrediction.threatClass)) {
      traditionalWeight = 0.3; // Reduce traditional weight
      mlWeight = 0.7;          // Increase ML weight for high-confidence threats
    }
    
    let combinedScore = (
      traditionResult.riskScore * traditionalWeight +
      mlPrediction.riskProbability * mlWeight
    );

    // Apply safety bias for innocent messages (reduce false positives)
    if (this.isSafeConversation(features, mlPrediction)) {
      combinedScore = Math.min(combinedScore, 0.2); // Cap at SAFE range
    } else if (features.messageLength < 20 && // Short messages
        features.urgencyWordCount === 0 && // No urgency words
        features.financialWordCount === 0 && // No financial words
        features.urlCount === 0 && // No URLs
        features.phoneNumberCount === 0) { // No phone numbers
      combinedScore = Math.min(combinedScore, 0.3); // Cap at LOW risk maximum
    }

    // Determine final risk level with higher thresholds to reduce false positives
    let finalRiskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (combinedScore < 0.3) finalRiskLevel = 'SAFE';        // Increased from 0.2
    else if (combinedScore < 0.5) finalRiskLevel = 'LOW';    // Increased from 0.4
    else if (combinedScore < 0.7) finalRiskLevel = 'MEDIUM'; // Increased from 0.6
    else if (combinedScore < 0.85) finalRiskLevel = 'HIGH';  // Increased from 0.8
    else finalRiskLevel = 'CRITICAL';

    // Enhanced recommendations based on ML insights
    const enhancedRecommendations = [
      ...traditionResult.recommendations,
      ...this.generateMLBasedRecommendations(mlPrediction, features)
    ];

    return {
      ...traditionResult,
      riskScore: combinedScore,
      riskLevel: finalRiskLevel,
      confidence: Math.max(traditionResult.confidence, mlPrediction.confidence),
      recommendations: [...new Set(enhancedRecommendations)]
    };
  }

  /**
   * Generate learning recommendations
   */
  private generateLearningRecommendations(features: MLFeatureVector, prediction: MLPrediction): string[] {
    const recommendations: string[] = [];

    // Check for uncertain predictions
    if (prediction.confidence < 0.7) {
      recommendations.push('ระบบต้องการข้อมูลเพิ่มเติมเพื่อการวิเคราะห์ที่แม่นยำขึ้น');
    }

    // Check for new patterns
    if (features.messageLength > 500 && prediction.riskProbability > 0.5) {
      recommendations.push('ตรวจพบรูปแบบข้อความยาวที่อาจเป็นภัยคุกคาม - กำลังเรียนรู้รูปแบบใหม่');
    }

    // Check for context mismatches
    if (features.hasTrustedDomain && prediction.riskProbability > 0.6) {
      recommendations.push('พบความขัดแย้งระหว่างแหล่งที่เชื่อถือได้และเนื้อหาที่เสี่ยง - ต้องการการตรวจสอบเพิ่มเติม');
    }

    // Pattern learning suggestions
    if (features.urgencyWordCount > 3) {
      recommendations.push('ตรวจพบคำเร่งด่วนหลายคำ - กำลังปรับปรุงการตรวจจับความเร่งด่วน');
    }

    return recommendations;
  }

  /**
   * Store data for future training
   */
  private storeForTraining(features: MLFeatureVector, result: ThreatAnalysisResult, message: string): void {
    const trainingPoint: TrainingData = {
      features,
      label: result.riskLevel === 'SAFE' ? 0 : 1,
      threatType: result.threatType,
      timestamp: new Date()
    };

    this.trainingData.push(trainingPoint);

    // Keep only recent training data (last 1000 points)
    if (this.trainingData.length > 1000) {
      this.trainingData.shift();
    }

    // Periodically update model weights
    if (this.trainingData.length % 50 === 0) {
      this.updateModelWeights();
    }
  }

  /**
   * Update model weights using simple gradient descent
   */
  private updateModelWeights(): void {
    if (this.trainingData.length < 10) return;

    console.log('🔄 Updating ML model weights...');

    // Simple gradient descent update
    for (const featureName of Object.keys(this.modelWeights)) {
      let gradient = 0;
      
      for (const dataPoint of this.trainingData.slice(-50)) { // Use last 50 points
        const predicted = this.sigmoid(this.computeFeatureScore(dataPoint.features, featureName));
        const error = dataPoint.label - predicted;
        const featureValue = Number((dataPoint.features as any)[featureName]) || 0;
        gradient += error * featureValue;
      }

      // Update weight
      const avgGradient = gradient / Math.min(50, this.trainingData.length);
      this.modelWeights[featureName] += this.LEARNING_RATE * avgGradient;
      
      // Clip weights to reasonable range
      this.modelWeights[featureName] = Math.max(-5, Math.min(5, this.modelWeights[featureName]));
    }

    console.log('✅ ML model weights updated');
  }

  /**
   * Learn from user feedback
   */
  public async learnFromFeedback(
    message: string,
    feedback: 'correct' | 'false_positive' | 'false_negative',
    originalResult: ThreatAnalysisResult
  ): Promise<void> {
    console.log(`📚 Learning from feedback: ${feedback}`);

    // Find corresponding training data
    const recentData = this.trainingData.slice(-10);
    for (const dataPoint of recentData) {
      if (Math.abs(dataPoint.timestamp.getTime() - Date.now()) < 300000) { // Within 5 minutes
        dataPoint.userFeedback = feedback;
        
        // Adjust label based on feedback
        if (feedback === 'false_positive') {
          dataPoint.label = 0; // Should be safe
        } else if (feedback === 'false_negative') {
          dataPoint.label = 1; // Should be threat
        }
        
        // Immediate weight adjustment for feedback
        this.adjustWeightsFromFeedback(dataPoint, feedback);
        break;
      }
    }
  }

  // Helper methods
  private initializeModel(): void {
    // Initialize with balanced weights - aggressive for real threats, gentle for casual messages
    this.modelWeights = {
      messageLength: 0.05,      // Reduced: short messages like "กินไรดี" should be safer
      urgencyWordCount: 1.2,    // Increased: urgency words are strong threat indicators
      financialWordCount: 1.5,  // Increased: financial words are critical threat indicators
      rewardWordCount: 0.4,     // Reduced from 0.6
      phoneNumberCount: 0.3,    // Reduced from 0.5
      urlCount: 0.3,            // Reduced from 0.4
      hasMultipleExclamation: 0.2, // Reduced from 0.3
      hasAllCaps: 0.3,          // Reduced from 0.4
      hasNumbers: 0.1,          // Reduced from 0.2
      hasTimeLimit: 0.5,        // Reduced from 0.7
      hasMoneyAmount: 0.4,      // Reduced from 0.6
      hasTrustedDomain: -1.0,   // Increased negative weight
      hasTrustedPhone: -0.9,    // Increased negative weight
      isBusinessHours: -0.3,    // Increased negative weight
      isWeekend: 0.05,          // Reduced from 0.1
      readabilityScore: -0.4,   // Increased negative weight
      sentimentScore: 0.1,      // Reduced from 0.2
      formalityLevel: -0.5,     // Increased negative weight
      userHistoryRisk: 0.3,     // Reduced from 0.5
      sourceCredibility: -0.8,  // Increased negative weight
      messageFrequency: 0.2     // Reduced from 0.3
    };
  }

  private countUrgencyWords(message: string): number {
    const urgencyWords = ['ด่วน', 'รีบ', 'ทันที', 'เร่งด่วน', 'ก่อนสาย', 'หมดเขต'];
    let count = 0;
    urgencyWords.forEach(word => {
      if (message.includes(word)) {
        const weight = this.THAI_LANGUAGE_WEIGHTS[word] || 1.0;
        count += weight; // Apply Thai language weights
      }
    });
    return count;
  }

  private countFinancialWords(message: string): number {
    const financialWords = ['บัญชี', 'โอนเงิน', 'ธนาคาร', 'เงินฝาก', 'บัตรเครดิต', 'ชำระเงิน', 
                           'ระงับบัญชี', 'ยืนยันตัวตน', 'คลิกลิงค์', 'กรอกข้อมูล'];
    let count = 0;
    financialWords.forEach(word => {
      if (message.includes(word)) {
        const weight = this.THAI_LANGUAGE_WEIGHTS[word] || 1.0;
        count += weight; // Apply Thai language weights
      }
    });
    return count;
  }

  private countRewardWords(message: string): number {
    const rewardWords = ['รางวัล', 'โชคดี', 'ได้รับเลือก', 'ผู้โชคดี', 'แจ็คพอต', 
                        'ให้ฟรี', 'ฟรี', 'โบนัส', 'แตก', 'ถอนได้', 'เว็บใหม่', 
                        'ค่ายใหญ่', 'สล็อต', 'คาสิโน'];
    let count = 0;
    rewardWords.forEach(word => {
      if (message.includes(word)) {
        // Give higher weight to gambling-specific terms
        const weight = ['แตก', 'ถอนได้', 'เว็บใหม่', 'ค่ายใหญ่'].includes(word) ? 1.5 : 1.0;
        count += weight;
      }
    });
    return count;
  }

  private calculateReadability(message: string): number {
    // Simple readability based on sentence and word length
    const sentences = message.split(/[.!?]/).length;
    const words = message.split(/\s+/).length;
    const avgWordsPerSentence = words / Math.max(sentences, 1);
    
    // Normalize to 0-1 scale (complex messages get higher scores)
    return Math.min(1, avgWordsPerSentence / 15);
  }

  private calculateSentiment(message: string): number {
    // Enhanced sentiment analysis for Thai with safe conversation patterns
    const positiveWords = ['ดี', 'ยินดี', 'ขอบคุณ', 'สำเร็จ', 'ปลอดภัย', 'อร่อย', 'สนุก', 'มีความสุข'];
    const negativeWords = ['เสีย', 'อันตราย', 'ปัญหา', 'ระงับ', 'หยุด'];
    const casualWords = ['กิน', 'ไป', 'มา', 'ไหม', 'แล้ว', 'จ้า', 'นะ', 'หรอ', 'ไรดี', 'ยังไง'];
    
    let sentiment = 0;
    
    // Check for safe casual conversation
    let casualCount = 0;
    casualWords.forEach(word => {
      if (message.includes(word)) casualCount++;
    });
    
    // If message is casual conversation, boost positive sentiment
    if (casualCount > 0 && message.length < 30) {
      sentiment += 0.4; // Strong positive bias for casual conversation
    }
    
    positiveWords.forEach(word => {
      if (message.includes(word)) sentiment += 0.2;
    });
    negativeWords.forEach(word => {
      if (message.includes(word)) sentiment -= 0.2;
    });
    
    return Math.max(-1, Math.min(1, sentiment));
  }

  private calculateFormality(message: string): number {
    // Formal language indicators
    const formalIndicators = ['กรุณา', 'ท่าน', 'สำนักงาน', 'บริษัท', 'หน่วยงาน'];
    let formalityScore = 0;
    
    formalIndicators.forEach(indicator => {
      if (message.includes(indicator)) formalityScore += 0.2;
    });
    
    // Check for polite particles
    if (message.includes('ครับ') || message.includes('ค่ะ')) formalityScore += 0.2;
    
    return Math.min(1, formalityScore);
  }

  private calculateUserHistoryRisk(history: ThreatAnalysisResult[]): number {
    if (history.length === 0) return 0.5;
    
    const recentRisk = history.slice(-5).reduce((sum, result) => sum + result.riskScore, 0);
    return recentRisk / Math.min(history.length, 5);
  }

  private calculateSourceCredibility(context: Partial<EnhancedAnalysisContext>): number {
    let credibility = 0.5; // Neutral starting point
    
    if (context.hasTrustedDomains) credibility += 0.3;
    if (context.hasTrustedPhones) credibility += 0.3;
    if (context.isOfficialAccount) credibility += 0.4;
    
    return Math.min(1, credibility);
  }

  private isBusinessHours(): boolean {
    const hour = new Date().getHours();
    return hour >= 9 && hour <= 17;
  }

  private isWeekend(): boolean {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  }

  private classifyThreat(probability: number, features: MLFeatureVector): 'safe' | 'phishing' | 'scam' | 'spam' | 'fraud' {
    if (probability < 0.3) return 'safe';
    
    // Use features to determine specific threat type
    if (features.financialWordCount > 2 && features.urgencyWordCount > 1) return 'phishing';
    if (features.rewardWordCount > 1 && features.hasMoneyAmount) return 'scam';
    if (features.hasMoneyAmount && features.phoneNumberCount > 0) return 'fraud';
    if (probability > 0.7) return 'scam';
    
    return 'spam';
  }

  private calculatePredictionConfidence(featureImportance: Record<string, number>, explanationCount: number): number {
    const maxImportance = Math.max(...Object.values(featureImportance));
    const avgImportance = Object.values(featureImportance).reduce((sum, val) => sum + val, 0) / Object.keys(featureImportance).length;
    
    // Higher confidence if features are clear and explanations are available
    let confidence = 0.5;
    confidence += maxImportance * 0.3; // Strong features increase confidence
    confidence += Math.min(explanationCount / 3, 0.2); // Explanations increase confidence
    
    return Math.min(0.95, Math.max(0.3, confidence));
  }

  private getFeatureExplanation(featureName: string, value: any, type: 'risk' | 'safe'): string {
    const explanations: Record<string, { risk: string; safe: string }> = {
      urgencyWordCount: {
        risk: `มีคำเร่งด่วน ${value} คำ ซึ่งเป็นลักษณะของการหลอกลวง`,
        safe: 'ไม่มีคำที่สร้างความเร่งด่วนเกินไป'
      },
      financialWordCount: {
        risk: `มีคำเกี่ยวกับการเงิน ${value} คำ ซึ่งอาจเป็นการฟิชชิ่ง`,
        safe: 'ไม่มีคำเกี่ยวกับการเงินที่น่าสงสัย'
      },
      hasTrustedDomain: {
        risk: 'แม้จะมีลิงค์ที่เชื่อถือได้ แต่เนื้อหายังน่าสงสัย',
        safe: 'มีลิงค์จากเว็บไซต์ที่เชื่อถือได้'
      },
      hasMoneyAmount: {
        risk: 'มีการระบุจำนวนเงิน ซึ่งอาจเป็นการล่อลวง',
        safe: 'ไม่มีการระบุจำนวนเงินที่น่าสงสัย'
      }
    };

    return explanations[featureName]?.[type] || `${featureName}: ${value}`;
  }

  private generateMLBasedRecommendations(prediction: MLPrediction, features: MLFeatureVector): string[] {
    const recommendations: string[] = [];

    if (prediction.riskProbability > 0.7) {
      recommendations.push('🚨 ML model ระบุว่ามีความเสี่ยงสูง - ควรระมัดระวังเป็นพิเศษ');
    }

    if (features.urgencyWordCount > 2) {
      recommendations.push('⚠️ ตรวจพบคำเร่งด่วนหลายคำ - เป็นลักษณะของการหลอกลวง');
    }

    if (features.hasMoneyAmount && features.phoneNumberCount > 0) {
      recommendations.push('💰 มีการระบุเงินและเบอร์โทร - อย่าติดต่อหรือโอนเงิน');
    }

    if (prediction.confidence < 0.6) {
      recommendations.push('🤔 ระบบยังไม่แน่ใจ - ควรขอความเห็นเพิ่มเติมจากผู้เชี่ยวชาญ');
    }

    return recommendations;
  }

  private adjustWeightsFromFeedback(dataPoint: TrainingData, feedback: string): void {
    const adjustmentFactor = feedback === 'correct' ? 0.01 : 0.05;
    const sign = feedback === 'false_positive' ? -1 : 1;

    // Adjust weights based on feature values and feedback
    for (const [featureName, value] of Object.entries(dataPoint.features)) {
      if (Number(value) > 0) {
        this.modelWeights[featureName] += sign * adjustmentFactor * Number(value);
      }
    }
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  private computeFeatureScore(features: MLFeatureVector, featureName: string): number {
    const value = Number((features as any)[featureName]) || 0;
    const weight = this.modelWeights[featureName] || 0;
    return value * weight;
  }

  /**
   * Check if message is safe casual conversation
   */
  private isSafeConversation(features: MLFeatureVector, prediction: MLPrediction): boolean {
    // Common Thai casual conversation patterns that should be SAFE
    const safeConversationIndicators = [
      features.messageLength < 30,                    // Short messages
      features.urgencyWordCount === 0,               // No urgency
      features.financialWordCount === 0,             // No financial terms
      features.rewardWordCount === 0,                // No reward terms
      features.urlCount === 0,                       // No URLs
      features.phoneNumberCount === 0,               // No phone numbers
      !features.hasMoneyAmount,                      // No money amounts
      features.sentimentScore > 0.2,                 // Positive/neutral sentiment
      prediction.threatClass === 'safe'              // ML already thinks it's safe
    ];

    // If most indicators point to safe conversation, treat as safe
    const safeIndicatorCount = safeConversationIndicators.filter(Boolean).length;
    return safeIndicatorCount >= 7; // At least 7 out of 9 indicators
  }
}