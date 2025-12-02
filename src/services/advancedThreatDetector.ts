/**
 * Advanced Threat Detector with Enhanced Accuracy
 * ระบบตรวจจับภัยคุกคามขั้นสูงที่มีความแม่นยำสูง
 */

import { ThreatDetectorService, ThreatAnalysisResult } from './threatDetector';
import { AIAnalyzer, AIAnalysisResult } from './aiAnalyzer';
import { ThaiThreatIntelligenceService, ThaiThreatAnalysis } from './thaiThreatIntelligence';
import { URLContentAnalyzerService, URLAnalysisResult } from './urlContentAnalyzer';
import { TrustedWebsiteChecker } from '../data/trustedWebsites';
import { TrustedPhoneChecker } from '../data/trustedPhoneNumbers';
import { ThaiPhoneNumberDetector } from '../utils/phoneNumberDetector';

export interface EnhancedAnalysisContext {
  hasTrustedDomains: boolean;
  hasTrustedPhones: boolean;
  isOfficialAccount: boolean;
  hasMultipleRiskFactors: boolean;
  userHistory?: ThreatAnalysisResult[];
  messageSource: 'sms' | 'line' | 'email' | 'unknown';
  timeContext: 'business_hours' | 'night' | 'weekend';
}

export interface ConfidenceWeightedResult {
  result: any;
  confidence: number;
  weight: number;
  source: string;
}

export interface AccuracyMetrics {
  falsePositiveRate: number;
  falseNegativeRate: number;
  overallAccuracy: number;
  confidenceScore: number;
  processingTime: number;
}

export class AdvancedThreatDetectorService {
  private readonly AI_WEIGHT = 0.4;
  private readonly KEYWORD_WEIGHT = 0.2;
  private readonly THAI_INTELLIGENCE_WEIGHT = 0.2;
  private readonly URL_ANALYSIS_WEIGHT = 0.2;
  
  // Dynamic thresholds based on context
  private readonly BASE_THRESHOLD = {
    SAFE: 0.2,
    LOW: 0.4,
    MEDIUM: 0.6,
    HIGH: 0.8,
    CRITICAL: 0.9
  };

  // False positive patterns to avoid
  private readonly FALSE_POSITIVE_PATTERNS = [
    'ธนาคารกรุงเทพ', 'ธนาคารกสิกรไทย', 'ธนาคารไทยพาณิชย์',
    'บริษัท ทรู', 'บริษัท ดีแทค', 'บริษัท เอไอเอส',
    'การไฟฟ้านครหลวง', 'การไฟฟ้าส่วนภูมิภาค',
    'สำนักงานคณะกรรมการกิจการกระจายเสียง',
    'กรมสรรพากร', 'กรมการขนส่งทางบก'
  ];

  // Legitimate business communication patterns
  private readonly BUSINESS_COMMUNICATION_PATTERNS = [
    'แจ้งยอดคงเหลือ', 'รายการใช้จ่าย', 'กำหนดชำระ',
    'ใบกำกับภาษี', 'ใบเสร็จรับเงิน', 'การนัดหมาย',
    'รหัสยืนยัน OTP', 'รหัสสำหรับการทำรายการ'
  ];

  /**
   * Enhanced threat analysis with improved accuracy
   */
  public async analyzeAdvanced(
    message: string,
    context?: Partial<EnhancedAnalysisContext>
  ): Promise<ThreatAnalysisResult & { accuracyMetrics: AccuracyMetrics }> {
    const startTime = Date.now();
    
    try {
      // Build analysis context
      const analysisContext = await this.buildAnalysisContext(message, context);
      
      // Perform multi-layer analysis with confidence weighting
      const analysisResults = await this.performMultiLayerAnalysis(message, analysisContext);
      
      // Calculate ensemble score with confidence weighting
      const ensembleScore = this.calculateEnsembleScore(analysisResults);
      
      // Apply context-based threshold adjustment
      const adjustedThreshold = this.adjustThresholdByContext(ensembleScore, analysisContext);
      
      // Determine final risk assessment
      const riskAssessment = this.determineRiskLevel(adjustedThreshold, analysisContext);
      
      // Check for false positive patterns
      const falsePositiveCheck = this.checkFalsePositivePatterns(message, analysisContext);
      
      // Generate accuracy metrics
      const accuracyMetrics = this.calculateAccuracyMetrics(analysisResults, analysisContext, Date.now() - startTime);
      
      // Build enhanced result
      const enhancedResult = await this.buildEnhancedResult(
        message,
        analysisResults,
        riskAssessment,
        falsePositiveCheck,
        analysisContext,
        Date.now() - startTime
      );

      return {
        ...enhancedResult,
        accuracyMetrics
      };

    } catch (error) {
      console.error('❌ Enhanced threat analysis failed:', error);
      
      // Fallback to basic analysis
      const threatDetector = new ThreatDetectorService();
      const fallbackResult = await threatDetector.analyze(message);
      return {
        ...fallbackResult,
        accuracyMetrics: {
          falsePositiveRate: 0.15,
          falseNegativeRate: 0.10,
          overallAccuracy: 0.75,
          confidenceScore: 0.5,
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Build comprehensive analysis context
   */
  private async buildAnalysisContext(
    message: string,
    context?: Partial<EnhancedAnalysisContext>
  ): Promise<EnhancedAnalysisContext> {
    // Extract URLs and phone numbers
    const urls = this.extractUrls(message);
    const phoneNumbers = ThaiPhoneNumberDetector.extractPhoneNumbers(message);
    
    // Check trusted sources
    const hasTrustedDomains = urls.length > 0 && urls.every(url => TrustedWebsiteChecker.isTrustedWebsite(url));
    const hasTrustedPhones = phoneNumbers.length > 0 && phoneNumbers.every((phone: string) => TrustedPhoneChecker.isTrustedNumber(phone));
    
    // Detect multiple risk factors
    const hasMultipleRiskFactors = this.detectMultipleRiskFactors(message);
    
    // Determine time context
    const timeContext = this.getTimeContext();
    
    return {
      hasTrustedDomains,
      hasTrustedPhones,
      isOfficialAccount: context?.isOfficialAccount || false,
      hasMultipleRiskFactors,
      userHistory: context?.userHistory || [],
      messageSource: context?.messageSource || 'unknown',
      timeContext,
      ...context
    };
  }

  /**
   * Perform multi-layer analysis with confidence scoring
   */
  private async performMultiLayerAnalysis(
    message: string,
    context: EnhancedAnalysisContext
  ): Promise<ConfidenceWeightedResult[]> {
    const results: ConfidenceWeightedResult[] = [];

    try {
      // Enhanced AI Analysis
      const aiPrompt = this.createContextAwarePrompt(message, context);
      const aiAnalyzer = new AIAnalyzer();
      const aiAnalysis = await aiAnalyzer.analyzeMessage(aiPrompt);
      results.push({
        result: aiAnalysis,
        confidence: context.hasTrustedDomains ? 0.7 : 0.9, // Lower confidence for trusted domains
        weight: this.AI_WEIGHT,
        source: 'ai_analysis'
      });
    } catch (error) {
      console.warn('AI analysis failed, using fallback');
    }

    try {
      // Enhanced keyword analysis
      const keywordAnalysis = this.performEnhancedKeywordAnalysis(message, context);
      results.push({
        result: keywordAnalysis,
        confidence: 0.8,
        weight: this.KEYWORD_WEIGHT,
        source: 'keyword_analysis'
      });
    } catch (error) {
      console.warn('Keyword analysis failed');
    }

    try {
      // Thai intelligence analysis
      const thaiThreatIntelligence = new ThaiThreatIntelligenceService();
      const thaiAnalysis = await thaiThreatIntelligence.analyzeForThaiThreats(message);
      results.push({
        result: thaiAnalysis,
        confidence: 0.85,
        weight: this.THAI_INTELLIGENCE_WEIGHT,
        source: 'thai_intelligence'
      });
    } catch (error) {
      console.warn('Thai intelligence analysis failed');
    }

    try {
      // URL analysis (if URLs present)
      const urls = this.extractUrls(message);
      if (urls.length > 0) {
        const urlContentAnalyzer = new URLContentAnalyzerService();
        const urlAnalysis = await urlContentAnalyzer.analyzeURL(urls[0]);
        results.push({
          result: urlAnalysis,
          confidence: 0.9,
          weight: this.URL_ANALYSIS_WEIGHT,
          source: 'url_analysis'
        });
      }
    } catch (error) {
      console.warn('URL analysis failed');
    }

    return results;
  }

  /**
   * Create context-aware AI prompt
   */
  private createContextAwarePrompt(message: string, context: EnhancedAnalysisContext): string {
    let prompt = `วิเคราะห์ข้อความภาษาไทยต่อไปนี้เพื่อหาภัยคุกคาม:`;
    
    if (context.hasTrustedDomains) {
      prompt += `\n**สำคัญ**: ข้อความนี้มีลิงค์จากเว็บไซต์ที่เชื่อถือได้ กรุณาลดคะแนนความเสี่ยง`;
    }
    
    if (context.hasTrustedPhones) {
      prompt += `\n**สำคัญ**: ข้อความนี้มีเบอร์โทรจากหน่วยงานที่เชื่อถือได้`;
    }

    if (context.isOfficialAccount) {
      prompt += `\n**สำคัญ**: ข้อความนี้มาจากบัญชีทางการที่ยืนยันตัวตนแล้ว`;
    }

    if (context.timeContext === 'business_hours') {
      prompt += `\n**บริบท**: ข้อความนี้ส่งในเวลาทำการ มีโอกาสเป็นการติดต่อทางธุรกิจปกติ`;
    }
    
    prompt += `\n\nข้อความ: "${message}"`;
    prompt += `\n\nกรุณาให้คะแนนความเสี่ยง (0-1) และระบุประเภทภัยคุกคาม`;
    
    return prompt;
  }

  /**
   * Enhanced keyword analysis with context awareness
   */
  private performEnhancedKeywordAnalysis(message: string, context: EnhancedAnalysisContext): any {
    let riskScore = 0;
    const detectedPatterns: string[] = [];
    const suspiciousKeywords: string[] = [];

    // Check for false positive patterns first
    const isFalsePositive = this.FALSE_POSITIVE_PATTERNS.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );

    if (isFalsePositive) {
      riskScore *= 0.3; // Significantly reduce risk for false positive patterns
      detectedPatterns.push('potential_false_positive');
    }

    // Check for legitimate business communication
    const isBusinessCommunication = this.BUSINESS_COMMUNICATION_PATTERNS.some(pattern =>
      message.toLowerCase().includes(pattern.toLowerCase())
    );

    if (isBusinessCommunication && context.hasTrustedDomains) {
      riskScore *= 0.5; // Reduce risk for legitimate business communication
      detectedPatterns.push('legitimate_business_communication');
    }

    // Enhanced keyword scoring with context
    const keywords = [
      { words: ['ระงับบัญชี', 'บัญชีถูกอายัด'], score: 0.8, category: 'financial_threat' },
      { words: ['โชคดี', 'รางวัล', 'ผู้โชคดี'], score: 0.6, category: 'lottery_scam' },
      { words: ['ด่วน', 'ทันที', 'รีบ'], score: 0.4, category: 'urgency' },
      { words: ['โอนเงิน', 'ชำระเงิน', 'จ่ายเงิน'], score: 0.7, category: 'payment_request' }
    ];

    for (const keywordGroup of keywords) {
      for (const keyword of keywordGroup.words) {
        if (message.includes(keyword)) {
          // Apply context-based scoring adjustment
          let adjustedScore = keywordGroup.score;
          
          if (context.hasTrustedDomains || context.hasTrustedPhones) {
            adjustedScore *= 0.6; // Reduce score for trusted sources
          }
          
          if (context.isOfficialAccount) {
            adjustedScore *= 0.4; // Further reduce for official accounts
          }
          
          riskScore = Math.max(riskScore, adjustedScore);
          suspiciousKeywords.push(keyword);
          detectedPatterns.push(keywordGroup.category);
        }
      }
    }

    return {
      riskScore: Math.min(riskScore, 1.0),
      detectedPatterns: [...new Set(detectedPatterns)],
      suspiciousKeywords: [...new Set(suspiciousKeywords)]
    };
  }

  /**
   * Calculate ensemble score with confidence weighting
   */
  private calculateEnsembleScore(analyses: ConfidenceWeightedResult[]): number {
    if (analyses.length === 0) return 0.5;

    const weightedSum = analyses.reduce((sum, analysis) => {
      const riskScore = this.extractRiskScore(analysis.result);
      return sum + (riskScore * analysis.confidence * analysis.weight);
    }, 0);

    const totalWeight = analyses.reduce((sum, analysis) => {
      return sum + (analysis.confidence * analysis.weight);
    }, 0);

    return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
  }

  /**
   * Extract risk score from various analysis result types
   */
  private extractRiskScore(result: any): number {
    if (typeof result === 'number') return result;
    if (result?.riskScore !== undefined) return result.riskScore;
    if (result?.score !== undefined) return result.score;
    if (result?.risk !== undefined) return result.risk;
    return 0.5; // Default neutral score
  }

  /**
   * Adjust threshold based on context
   */
  private adjustThresholdByContext(baseScore: number, context: EnhancedAnalysisContext): number {
    let adjustedScore = baseScore;
    
    // Trust factor adjustments
    if (context.hasTrustedDomains) adjustedScore *= 0.7;
    if (context.hasTrustedPhones) adjustedScore *= 0.8;
    if (context.isOfficialAccount) adjustedScore *= 0.6;
    
    // Risk factor adjustments
    if (context.hasMultipleRiskFactors) adjustedScore *= 1.2;
    
    // Time context adjustments
    if (context.timeContext === 'night' || context.timeContext === 'weekend') {
      adjustedScore *= 1.1; // Slightly higher risk outside business hours
    }
    
    return Math.min(0.95, Math.max(0.05, adjustedScore));
  }

  /**
   * Determine risk level with enhanced logic
   */
  private determineRiskLevel(score: number, context: EnhancedAnalysisContext): {
    riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confidence: number;
  } {
    // Dynamic thresholds based on context
    let thresholds = { ...this.BASE_THRESHOLD };
    
    if (context.hasTrustedDomains || context.hasTrustedPhones || context.isOfficialAccount) {
      // Raise thresholds for trusted sources
      thresholds.LOW += 0.1;
      thresholds.MEDIUM += 0.15;
      thresholds.HIGH += 0.1;
    }

    let riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    let confidence: number;

    if (score < thresholds.SAFE) {
      riskLevel = 'SAFE';
      confidence = 0.9;
    } else if (score < thresholds.LOW) {
      riskLevel = 'LOW';
      confidence = 0.8;
    } else if (score < thresholds.MEDIUM) {
      riskLevel = 'MEDIUM';
      confidence = 0.8;
    } else if (score < thresholds.HIGH) {
      riskLevel = 'HIGH';
      confidence = 0.85;
    } else {
      riskLevel = 'CRITICAL';
      confidence = 0.9;
    }

    return { riskLevel, confidence };
  }

  /**
   * Check for known false positive patterns
   */
  private checkFalsePositivePatterns(message: string, context: EnhancedAnalysisContext): {
    isFalsePositive: boolean;
    reason?: string;
  } {
    // Check for legitimate business communication from trusted sources
    if ((context.hasTrustedDomains || context.hasTrustedPhones) && 
        this.BUSINESS_COMMUNICATION_PATTERNS.some(pattern => 
          message.toLowerCase().includes(pattern.toLowerCase())
        )) {
      return {
        isFalsePositive: true,
        reason: 'legitimate_business_communication_from_trusted_source'
      };
    }

    // Check for official organization patterns
    if (context.isOfficialAccount && 
        this.FALSE_POSITIVE_PATTERNS.some(pattern => 
          message.toLowerCase().includes(pattern.toLowerCase())
        )) {
      return {
        isFalsePositive: true,
        reason: 'official_organization_communication'
      };
    }

    return { isFalsePositive: false };
  }

  /**
   * Calculate accuracy metrics
   */
  private calculateAccuracyMetrics(
    analyses: ConfidenceWeightedResult[],
    context: EnhancedAnalysisContext,
    processingTime: number
  ): AccuracyMetrics {
    // Estimate false positive rate based on trust factors
    let falsePositiveRate = 0.10; // Base rate
    if (context.hasTrustedDomains) falsePositiveRate *= 0.5;
    if (context.hasTrustedPhones) falsePositiveRate *= 0.6;
    if (context.isOfficialAccount) falsePositiveRate *= 0.3;

    // Estimate false negative rate based on analysis depth
    let falseNegativeRate = 0.08; // Base rate
    if (analyses.length < 3) falseNegativeRate *= 1.5; // Fewer analyses = higher false negative risk
    
    // Calculate overall accuracy
    const overallAccuracy = 1 - (falsePositiveRate + falseNegativeRate);
    
    // Calculate confidence score based on analysis consensus
    const consensusScore = this.calculateConsensusScore(analyses);
    
    return {
      falsePositiveRate,
      falseNegativeRate,
      overallAccuracy,
      confidenceScore: consensusScore,
      processingTime
    };
  }

  /**
   * Calculate consensus score from multiple analyses
   */
  private calculateConsensusScore(analyses: ConfidenceWeightedResult[]): number {
    if (analyses.length < 2) return 0.7; // Lower confidence with fewer analyses
    
    const scores = analyses.map(a => this.extractRiskScore(a.result));
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Calculate variance
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
    
    // Higher variance = lower consensus = lower confidence
    const consensusScore = Math.max(0.5, 1 - variance);
    
    return consensusScore;
  }

  // Helper methods
  private detectMultipleRiskFactors(message: string): boolean {
    const riskFactors = [
      /ด่วน|รีบ|ทันที/.test(message),
      /โอนเงิน|จ่ายเงิน|ชำระเงิน/.test(message),
      /รางวัล|โชคดี|ผู้โชคดี/.test(message),
      /ระงับ|อายัด|หมดอายุ/.test(message),
      /คลิก|กด|ลิงค์/.test(message)
    ];
    
    return riskFactors.filter(Boolean).length >= 2;
  }

  private getTimeContext(): 'business_hours' | 'night' | 'weekend' {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    if (day === 0 || day === 6) return 'weekend';
    if (hour >= 9 && hour <= 17) return 'business_hours';
    return 'night';
  }

  private extractUrls(message: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return message.match(urlRegex) || [];
  }

  private async buildEnhancedResult(
    message: string,
    analyses: ConfidenceWeightedResult[],
    riskAssessment: { riskLevel: string; confidence: number },
    falsePositiveCheck: { isFalsePositive: boolean; reason?: string },
    context: EnhancedAnalysisContext,
    processingTime: number
  ): Promise<ThreatAnalysisResult> {
    // If false positive detected, override risk assessment
    if (falsePositiveCheck.isFalsePositive) {
      return {
        riskScore: 0.1,
        riskLevel: 'SAFE',
        threatType: 'SAFE',
        confidence: 0.9,
        detectedPatterns: ['false_positive_detected'],
        suspiciousKeywords: [],
        urls: this.extractUrls(message),
        phoneNumbers: ThaiPhoneNumberDetector.extractPhoneNumbers(message),
        trustedPhoneNumbers: [],
        suspiciousPhoneNumbers: [],
        recommendations: ['ข้อความนี้ดูเหมือนจะเป็นการติดต่อทางธุรกิจปกติ'],
        analysisMethod: 'enhanced' as const,
        allowFeedback: true,
        processingTime
      };
    }

    // Build comprehensive result from all analyses
    const combinedResult = this.combineEnhancedAnalysisResults(analyses, message, riskAssessment, context, processingTime);
    
    return combinedResult;
  }

  private combineEnhancedAnalysisResults(
    analyses: ConfidenceWeightedResult[],
    message: string,
    riskAssessment: { riskLevel: string; confidence: number },
    context: EnhancedAnalysisContext,
    processingTime: number
  ): ThreatAnalysisResult {
    // Extract and combine all detected patterns
    const allPatterns: string[] = [];
    const allKeywords: string[] = [];
    const allRecommendations: string[] = [];

    analyses.forEach(analysis => {
      if (analysis.result?.detectedPatterns) {
        allPatterns.push(...analysis.result.detectedPatterns);
      }
      if (analysis.result?.suspiciousKeywords) {
        allKeywords.push(...analysis.result.suspiciousKeywords);
      }
      if (analysis.result?.recommendations) {
        allRecommendations.push(...analysis.result.recommendations);
      }
    });

    // Enhanced recommendations based on context
    if (context.hasTrustedDomains || context.hasTrustedPhones) {
      allRecommendations.push('ข้อความนี้มาจากแหล่งที่เชื่อถือได้ แต่ควรระมัดระวังเนื้อหาที่ขอข้อมูลส่วนตัว');
    }

    if (context.isOfficialAccount) {
      allRecommendations.push('ตรวจสอบความถูกต้องโดยติดต่อหน่วยงานโดยตรงเพิ่มเติม');
    }

    return {
      riskScore: this.calculateEnsembleScore(analyses),
      riskLevel: riskAssessment.riskLevel as any,
      threatType: this.determineThreatType(allPatterns),
      confidence: riskAssessment.confidence,
      detectedPatterns: [...new Set(allPatterns)],
      suspiciousKeywords: [...new Set(allKeywords)],
      urls: this.extractUrls(message),
      phoneNumbers: ThaiPhoneNumberDetector.extractPhoneNumbers(message),
      trustedPhoneNumbers: [],
      suspiciousPhoneNumbers: [],
      recommendations: [...new Set(allRecommendations)],
      analysisMethod: 'enhanced' as const,
      allowFeedback: true,
      processingTime
    };
  }

  private determineThreatType(patterns: string[]): 'PHISHING' | 'SCAM' | 'SPAM' | 'ROMANCE_SCAM' | 'INVESTMENT_FRAUD' | 'SAFE' {
    if (patterns.includes('financial_threat')) return 'PHISHING';
    if (patterns.includes('lottery_scam')) return 'SCAM';
    if (patterns.includes('investment_fraud')) return 'INVESTMENT_FRAUD';
    if (patterns.includes('romance_scam')) return 'ROMANCE_SCAM';
    if (patterns.includes('false_positive_detected')) return 'SAFE';
    if (patterns.length > 0) return 'SCAM';
    return 'SAFE';
  }
}