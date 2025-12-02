import crypto from 'crypto';
import { AIAnalyzer, AIAnalysisResult } from './aiAnalyzer';
import { ThaiThreatIntelligenceService, ThaiThreatAnalysis, ThaiThreatCategory } from './thaiThreatIntelligence';
import { URLContentAnalyzerService, URLAnalysisResult } from './urlContentAnalyzer';
import { ThaiPhoneNumberDetector } from '../utils/phoneNumberDetector';
import { TrustedPhoneChecker } from '../data/trustedPhoneNumbers';

// Enhanced Detection Services
import { AdvancedThreatDetectorService, EnhancedAnalysisContext, AccuracyMetrics } from './advancedThreatDetector';
import { MachineLearningDetectorService, MLPrediction } from './machineLearningDetector';
import { FeedbackLearningSystem, UserFeedback, LearningMetrics } from './feedbackLearningSystem';
// import { EnhancedUrlAnalyzerService, EnhancedURLAnalysis } from './enhancedUrlAnalyzer';

export interface ThreatAnalysisResult {
  riskScore: number;
  riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  threatType: 'PHISHING' | 'SCAM' | 'SPAM' | 'ROMANCE_SCAM' | 'INVESTMENT_FRAUD' | 'SAFE';
  confidence: number;
  detectedPatterns: string[];
  suspiciousKeywords: string[];
  urls: string[];
  phoneNumbers: string[];
  trustedPhoneNumbers: string[];
  suspiciousPhoneNumbers: string[];
  recommendations: string[];
  processingTime: number;
  // Thai Threat Intelligence Integration
  thaiThreatCategory?: ThaiThreatCategory;
  thaiAnalysis?: ThaiThreatAnalysis;
  elderlyWarnings?: string[];
  educationalTips?: string[];
  // URL Analysis Results
  urlAnalysisResults?: URLAnalysisResult[];
  hasUrls?: boolean;
  // Enhanced Detection Results
  enhancedAnalysis?: {
    mlPrediction?: MLPrediction;
    accuracyMetrics?: AccuracyMetrics;
    learningRecommendations?: string[];
    // enhancedUrlAnalysis?: EnhancedURLAnalysis[];
  };
  // Analysis method used
  analysisMethod: 'basic' | 'enhanced' | 'ml_enhanced';
  // User feedback for learning
  allowFeedback: boolean;
}

export class ThreatDetectorService {
  private aiAnalyzer: AIAnalyzer;
  private thaiThreatIntelligence: ThaiThreatIntelligenceService;
  private urlContentAnalyzer: URLContentAnalyzerService;
  
  // Enhanced Detection Services
  private advancedDetector: AdvancedThreatDetectorService;
  private mlDetector: MachineLearningDetectorService;
  private feedbackLearning: FeedbackLearningSystem;
  // private enhancedUrlAnalyzer: EnhancedUrlAnalyzerService;
  
  // Configuration
  private readonly ENABLE_ENHANCED_DETECTION = true;
  private readonly ENABLE_ML_DETECTION = true;
  private readonly ENABLE_FEEDBACK_LEARNING = true;
  
  // Thai suspicious keywords database
  private readonly SUSPICIOUS_KEYWORDS = [
    // Financial terms
    'ระงับบัญชี', 'ยืนยันตัวตน', 'อัปเดตข้อมูล', 'บัญชีถูกอายัด',
    'ชำระค่าธรรมเนียม', 'หมดอายุ', 'กรุณาดำเนินการ',
    
    // Urgency terms
    'ด่วน', 'รีบ', 'ทันที', 'จำกัดเวลา', 'หมดเขต', 'ก่อนสาย',
    'ห้ามพลาด', 'สิทธิ์จำกัด', 'มีจำกัด', 'รีบกด', 'ก่อนหมด',
    
    // Reward/Lottery terms  
    'โชคดี', 'รางวัล', 'ได้รับเลือก', 'ผู้โชคดี', 'แจ็คพอต',
    'รับเงินฟรี', 'โบนัส', 'ของรางวัล',
    
    // Investment terms
    'ลงทุน', 'ผลตอบแทน', 'กำไร', 'หุ้น', 'เทรด', 'ทำเงิน',
    'ได้เงินเร็ว', 'รายได้เสริม', 'โอกาส', 'เงินล้าน',
    
    // Romance scam
    'รัก', 'หวาน', 'คิดถึง', 'โอกาส', 'โชคชะตา', 'เหงา',
    
    // Authority impersonation
    'ตำรวจ', 'ไอบีเอ', 'ธนาคารแห่งประเทศไทย', 'การไฟฟ้า',
    'ประปา', 'ราชการ', 'ศาล', 'อัยการ', 'ปปง', 'กสิกรไทย',
    'ไปรษณีย์', 'DHL', 'Kerry', 'Flash Express',
    
    // Gambling/Casino terms
    'ให้ฟรี', 'เครดิตฟรี', 'ฟรีเครดิต', 'รับฟรี', 'แจกฟรี',
    'เว็บใหม่', 'ค่ายใหญ่', 'แตกง่าย', 'แตกเลย', 'เเตกก่อน',
    'ถอนได้เลย', 'ถอนไม่อั้น', 'scatter', 'free spin', 'ฟรีสปิน',
    'เฮงเกินต้าน', 'โปรแน่น', 'แจกจริง', 'สมัครกับ', 'ฝาก 100 รับ 200',
    'เล่นที่', 'กดที่', 'คลิก', 'แอดมาเลย', 'มีจำกัด', 'จำกัด',
    
    // Fake delivery scam
    'พัสดุ', 'จัดส่งไม่ได้', 'รถเกิดอุบัติเหตุ', 'ขนส่ง', 'เจ้าหน้าที่ขนส่ง',
    'ติดต่อเจ้าหน้าที่', 'อุบัติเหตุระหว่างขนส่ง'
  ];

  constructor() {
    // Initialize basic services
    this.aiAnalyzer = new AIAnalyzer();
    this.thaiThreatIntelligence = new ThaiThreatIntelligenceService();
    this.urlContentAnalyzer = new URLContentAnalyzerService();
    
    // Initialize enhanced detection services
    this.advancedDetector = new AdvancedThreatDetectorService();
    this.mlDetector = new MachineLearningDetectorService();
    // this.enhancedUrlAnalyzer = new EnhancedUrlAnalyzerService();
    
    // Initialize feedback learning system
    this.feedbackLearning = new FeedbackLearningSystem(this.mlDetector);
    
    console.log('🚀 Enhanced ThreatDetectorService initialized with ML and feedback learning');
  }

  async analyze(message: string, userId?: string, options?: {
    useEnhancedDetection?: boolean;
    useMachineLearning?: boolean;
    context?: Partial<EnhancedAnalysisContext>;
  }): Promise<ThreatAnalysisResult> {
    const startTime = Date.now();
    
    // Determine analysis method based on options and configuration
    const useEnhanced = options?.useEnhancedDetection ?? this.ENABLE_ENHANCED_DETECTION;
    const useML = options?.useMachineLearning ?? this.ENABLE_ML_DETECTION;
    
    try {
      console.log(`🚀 Starting ${useML ? 'ML-enhanced' : useEnhanced ? 'enhanced' : 'basic'} threat analysis...`);
      
      // Route to appropriate analysis method
      if (useML && this.mlDetector) {
        return await this.analyzeWithML(message, userId, options?.context, startTime);
      } else if (useEnhanced && this.advancedDetector) {
        return await this.analyzeWithEnhanced(message, userId, options?.context, startTime);
      } else {
        return await this.analyzeBasic(message, userId, startTime);
      }
      
    } catch (error) {
      console.error('❌ Enhanced analysis failed, falling back to basic analysis:', error);
      return await this.analyzeBasic(message, userId, startTime);
    }
  }
  
  /**
   * ML-Enhanced Analysis Method
   */
  private async analyzeWithML(
    message: string, 
    userId?: string, 
    context?: Partial<EnhancedAnalysisContext>,
    startTime: number = Date.now()
  ): Promise<ThreatAnalysisResult> {
    try {
      console.log('🤖 Using ML-enhanced analysis...');
      
      const mlResult = await this.mlDetector.analyzeWithML(message, userId, context, startTime);
      
      // Enhanced URL analysis if URLs are present
      const urls = this.extractUrls(message);
      // let enhancedUrlAnalysis: any[] = [];
      
      if (urls.length > 0) {
        console.log(`🔗 Performing enhanced URL analysis for ${urls.length} URLs...`);
        // Enhanced URL analysis would go here
        // Currently using basic URL analysis
      }
      
      return {
        ...mlResult,
        enhancedAnalysis: {
          mlPrediction: mlResult.mlPrediction,
          accuracyMetrics: mlResult.accuracyMetrics,
          learningRecommendations: mlResult.learningRecommendations
        },
        analysisMethod: 'ml_enhanced',
        allowFeedback: this.ENABLE_FEEDBACK_LEARNING,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error('❌ ML analysis failed:', error);
      return await this.analyzeWithEnhanced(message, userId, context, startTime);
    }
  }
  
  /**
   * Enhanced Analysis Method (without ML)
   */
  private async analyzeWithEnhanced(
    message: string, 
    userId?: string, 
    context?: Partial<EnhancedAnalysisContext>,
    startTime: number = Date.now()
  ): Promise<ThreatAnalysisResult> {
    try {
      console.log('🔍 Using enhanced analysis...');
      
      const enhancedResult = await this.advancedDetector.analyzeAdvanced(message, context);
      
      return {
        ...enhancedResult,
        enhancedAnalysis: {
          accuracyMetrics: enhancedResult.accuracyMetrics
        },
        analysisMethod: 'enhanced',
        allowFeedback: this.ENABLE_FEEDBACK_LEARNING,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error('❌ Enhanced analysis failed:', error);
      return await this.analyzeBasic(message, userId, startTime);
    }
  }
  
  /**
   * Basic Analysis Method (Original)
   */
  private async analyzeBasic(
    message: string, 
    userId?: string, 
    startTime: number = Date.now()
  ): Promise<ThreatAnalysisResult> {
    try {
      console.log('📝 Using basic analysis...');
      
      // Extract URLs first to determine if URL analysis is needed
      const urls = this.extractUrls(message);
      const hasUrls = urls.length > 0;
      
      // Run all analyses in parallel for maximum efficiency
      const [aiAnalysis, keywordAnalysis, thaiAnalysis] = await Promise.all([
        this.aiAnalyzer.analyzeMessage(message),
        this.performKeywordAnalysis(message),
        this.thaiThreatIntelligence.analyzeForThaiThreats(message)
      ]);
      
      // Add URL analysis if URLs are found
      let urlAnalysisResults: URLAnalysisResult[] = [];
      if (hasUrls) {
        console.log(`🔗 Found ${urls.length} URL(s), performing content analysis...`);
        urlAnalysisResults = await this.analyzeURLsInMessage(urls);
      }
      
      // Combine all analysis results including URL analysis
      const combinedResult = this.combineAllAnalysisResults(
        aiAnalysis, 
        keywordAnalysis, 
        thaiAnalysis, 
        urlAnalysisResults
      );
      
      const result: ThreatAnalysisResult = {
        ...combinedResult,
        thaiAnalysis,
        urlAnalysisResults,
        hasUrls,
        analysisMethod: 'basic',
        allowFeedback: this.ENABLE_FEEDBACK_LEARNING,
        processingTime: Date.now() - startTime
      };

      console.log('Basic threat analysis completed', {
        userId,
        riskLevel: result.riskLevel,
        threatType: result.threatType,
        thaiCategory: result.thaiThreatCategory?.nameTh,
        aiAnalyzed: aiAnalysis.isAnalyzed,
        urlCount: urlAnalysisResults.length,
        processingTime: result.processingTime
      });

      return result;
      
    } catch (error) {
      const { logger } = await import('../utils/logger');
      logger.error('ThreatDetector', 'Basic threat analysis failed', error as Error, { userId });
      
      // Fallback to keyword-only analysis
      const fallbackResult = await this.performKeywordAnalysis(message);
      
      return {
        ...fallbackResult,
        analysisMethod: 'basic',
        allowFeedback: false,
        processingTime: Date.now() - startTime
      };
    }
  }

  private async performKeywordAnalysis(message: string): Promise<Omit<ThreatAnalysisResult, 'processingTime'>> {
    // Basic analysis
    const suspiciousKeywords = this.findSuspiciousKeywords(message);
    const urls = this.extractUrls(message);
    const phoneNumbers = this.extractPhoneNumbers(message);
    const { trusted: trustedPhones, suspicious: suspiciousPhones } = this.categorizePhonesNumbers(phoneNumbers);
    
    // Calculate risk score
    let riskScore = 0;
    const detectedPatterns: string[] = [];
    
    // Keyword scoring
    if (suspiciousKeywords.length > 0) {
      riskScore += suspiciousKeywords.length * 0.2;
      detectedPatterns.push('suspicious_keywords');
    }
    
    // URL scoring
    if (urls.length > 0) {
      riskScore += urls.length * 0.3;
      detectedPatterns.push('suspicious_urls');
    }
    
    // Phone number scoring - only count suspicious phones
    if (suspiciousPhones.length > 0) {
      riskScore += suspiciousPhones.length * 0.1;
      detectedPatterns.push('suspicious_phone');
    }
    
    // Trusted phone numbers actually reduce risk
    if (trustedPhones.length > 0 && suspiciousPhones.length === 0) {
      riskScore = Math.max(0, riskScore - 0.1);
      detectedPatterns.push('trusted_phone_detected');
    }
    
    // Urgency patterns
    if (this.hasUrgencyPatterns(message)) {
      riskScore += 0.3;
      detectedPatterns.push('urgency_language');
    }
    
    // Bank impersonation
    if (this.hasBankKeywords(message)) {
      riskScore += 0.4;
      detectedPatterns.push('bank_impersonation');
    }
    
    riskScore = Math.min(riskScore, 1);
    
    // Determine risk level
    let riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (riskScore >= 0.8) riskLevel = 'CRITICAL';
    else if (riskScore >= 0.6) riskLevel = 'HIGH';
    else if (riskScore >= 0.3) riskLevel = 'MEDIUM';
    else if (riskScore >= 0.1) riskLevel = 'LOW';
    else riskLevel = 'SAFE';
    
    // Determine threat type
    let threatType: 'PHISHING' | 'SCAM' | 'SPAM' | 'ROMANCE_SCAM' | 'INVESTMENT_FRAUD' | 'SAFE';
    if (detectedPatterns.includes('suspicious_urls') && detectedPatterns.includes('bank_impersonation')) {
      threatType = 'PHISHING';
    } else if (detectedPatterns.includes('bank_impersonation')) {
      threatType = 'SCAM';
    } else if (suspiciousKeywords.some(k => ['รัก', 'หวาน', 'คิดถึง'].includes(k))) {
      threatType = 'ROMANCE_SCAM';
    } else if (suspiciousKeywords.some(k => ['ลงทุน', 'กำไร', 'ทำเงิน'].includes(k))) {
      threatType = 'INVESTMENT_FRAUD';
    } else if (suspiciousKeywords.some(k => ['ให้ฟรี', 'เครดิตฟรี', 'รับฟรี', 'แจกฟรี', 'เว็บใหม่', 'แตกง่าย', 'ถอนได้เลย', 'scatter', 'free spin', 'ฟรีสปิน', 'เฮงเกินต้าน', 'โปรแน่น', 'แจกจริง', 'ฝาก 100 รับ 200'].includes(k))) {
      threatType = 'SCAM'; // Gambling scam
    } else if (suspiciousKeywords.some(k => ['พัสดุ', 'จัดส่งไม่ได้', 'รถเกิดอุบัติเหตุ', 'ขนส่ง', 'เจ้าหน้าที่ขนส่ง'].includes(k))) {
      threatType = 'PHISHING'; // Fake delivery scam
    } else if (riskScore > 0.3) {
      threatType = 'SPAM';
    } else {
      threatType = 'SAFE';
    }
    
    return {
      riskScore,
      riskLevel,
      threatType,
      confidence: Math.min(riskScore + (detectedPatterns.length * 0.1), 1),
      detectedPatterns,
      suspiciousKeywords,
      urls,
      phoneNumbers,
      trustedPhoneNumbers: trustedPhones,
      suspiciousPhoneNumbers: suspiciousPhones,
      recommendations: this.generateRecommendations(riskLevel, threatType, undefined, [], trustedPhones, suspiciousPhones),
      analysisMethod: 'basic' as const,
      allowFeedback: false
    };
  }

  /**
   * วิเคราะห์ URLs ในข้อความ
   */
  private async analyzeURLsInMessage(urls: string[]): Promise<URLAnalysisResult[]> {
    try {
      console.log(`🔗 Analyzing ${urls.length} URLs with AI content analysis...`);
      
      // วิเคราะห์ URLs แบบ parallel แต่จำกัดจำนวนเพื่อไม่ให้โหลดเซิร์ฟเวอร์มาก
      const maxConcurrentAnalysis = 3;
      const results: URLAnalysisResult[] = [];
      
      for (let i = 0; i < urls.length; i += maxConcurrentAnalysis) {
        const batch = urls.slice(i, i + maxConcurrentAnalysis);
        const batchResults = await this.urlContentAnalyzer.analyzeMultipleURLs(batch, {
          timeout: 8000, // ลดเวลา timeout เพื่อไม่ให้ user รอนาน
          maxRedirects: 2,
          enableScreenshot: false // ปิดการถ่ายภาพหน้าจอเพื่อความเร็ว
        });
        
        results.push(...batchResults);
      }
      
      console.log(`✅ URL analysis completed for ${results.length} URLs`);
      return results;
      
    } catch (error) {
      console.error('❌ URL analysis failed:', error);
      
      // Return fallback results for all URLs
      return urls.map(url => ({
        url,
        isAccessible: false,
        riskScore: 0.5,
        riskLevel: 'MEDIUM' as const,
        threatType: 'SUSPICIOUS' as const,
        confidence: 0.3,
        detectedPatterns: ['url_analysis_failed'],
        suspiciousElements: [],
        hasLoginForm: false,
        requestsPersonalInfo: false,
        hasSuspiciousKeywords: false,
        hasRedirects: false,
        responseTime: 0,
        isTrustedWebsite: false,
        trustedWebsiteInfo: null,
        aiModelsUsed: ['fallback'],
        recommendations: ['ไม่สามารถตรวจสอบลิงค์ได้ ควรระวัง'],
        warnings: ['เกิดข้อผิดพลาดในการตรวจสอบลิงค์'],
        analyzedAt: new Date(),
        processingTime: 0
      }));
    }
  }

  private combineAllAnalysisResults(
    aiAnalysis: AIAnalysisResult, 
    keywordAnalysis: Omit<ThreatAnalysisResult, 'processingTime'>,
    thaiAnalysis: ThaiThreatAnalysis,
    urlAnalysisResults: URLAnalysisResult[] = []
  ): Omit<ThreatAnalysisResult, 'processingTime'> {
    
    // First get the traditional combined result
    const baseResult = this.combineAnalysisResults(aiAnalysis, keywordAnalysis);
    
    // Start with base risk score
    let finalRiskScore = Math.max(baseResult.riskScore, thaiAnalysis.riskScore);
    
    // Enhance with URL analysis if available
    if (urlAnalysisResults.length > 0) {
      console.log('🔗 Integrating URL analysis results...');
      
      // หาคะแนนความเสี่ยงสูงสุดจาก URL analysis
      const maxUrlRiskScore = Math.max(...urlAnalysisResults.map(result => result.riskScore));
      
      // ถ้า URL มีความเสี่ยงสูงกว่า ให้เพิ่มคะแนน
      if (maxUrlRiskScore > finalRiskScore) {
        finalRiskScore = Math.max(finalRiskScore, maxUrlRiskScore);
        console.log(`📈 Risk score updated based on URL analysis: ${finalRiskScore}`);
      }
      
      // เพิ่มคะแนนเพิ่มเติมถ้ามี URL ที่เสี่ยง
      const highRiskUrls = urlAnalysisResults.filter(result => 
        result.riskLevel === 'HIGH' || result.riskLevel === 'CRITICAL'
      );
      
      if (highRiskUrls.length > 0) {
        finalRiskScore += 0.2; // เพิ่มคะแนนสำหรับ URL ที่เสี่ยง
        console.log(`⚠️ Found ${highRiskUrls.length} high-risk URLs, increasing risk score`);
      }
    }
    
    // Thai intelligence can upgrade risk level
    let finalRiskLevel = baseResult.riskLevel;
    if (thaiAnalysis.threatCategory?.severity === 'CRITICAL' && finalRiskScore >= 0.7) {
      finalRiskLevel = 'CRITICAL';
      finalRiskScore = Math.max(finalRiskScore, 0.8);
    } else if (thaiAnalysis.threatCategory?.severity === 'HIGH' && finalRiskScore >= 0.5) {
      finalRiskLevel = 'HIGH';
      finalRiskScore = Math.max(finalRiskScore, 0.7);
    }
    
    // Use Thai threat type if it's more specific
    let finalThreatType = baseResult.threatType;
    if (thaiAnalysis.threatCategory) {
      // Map Thai categories to threat types
      const categoryToThreatType: { [key: number]: typeof finalThreatType } = {
        1: 'PHISHING',     // Financial/Banking Fraud
        2: 'ROMANCE_SCAM', // Romance Scam
        3: 'INVESTMENT_FRAUD', // Investment Fraud
        4: 'SCAM',         // Online Gambling
        5: 'SCAM',         // E-commerce Fraud
        6: 'PHISHING',     // Fake Delivery
        7: 'PHISHING',     // Government Impersonation
        8: 'INVESTMENT_FRAUD', // Crypto Fraud
        9: 'PHISHING',     // Social Engineering
        10: 'SPAM'         // Malware
      };
      
      const mappedType = categoryToThreatType[thaiAnalysis.threatCategory.id];
      if (mappedType && thaiAnalysis.riskScore > baseResult.riskScore) {
        finalThreatType = mappedType;
      }
    }
    
    // Combine detected patterns including URL patterns
    const finalDetectedPatterns = [
      ...baseResult.detectedPatterns,
      ...(thaiAnalysis.threatCategory ? [`thai_category_${thaiAnalysis.threatCategory.id}`] : []),
      ...(thaiAnalysis.iocMatches.length > 0 ? ['thai_ioc_match'] : [])
    ];
    
    // Add URL-specific patterns
    if (urlAnalysisResults.length > 0) {
      const urlPatterns = urlAnalysisResults.flatMap(result => result.detectedPatterns);
      finalDetectedPatterns.push(...urlPatterns);
      
      // เพิ่ม pattern เฉพาะ
      if (urlAnalysisResults.some(result => result.hasLoginForm)) {
        finalDetectedPatterns.push('url_has_login_form');
      }
      if (urlAnalysisResults.some(result => result.requestsPersonalInfo)) {
        finalDetectedPatterns.push('url_requests_personal_info');
      }
      if (urlAnalysisResults.some(result => !result.isAccessible)) {
        finalDetectedPatterns.push('url_not_accessible');
      }
    }
    
    // Enhanced recommendations including URL recommendations
    const finalRecommendations = [
      ...baseResult.recommendations,
      ...thaiAnalysis.educationalTips
    ];
    
    // Add URL-specific recommendations
    if (urlAnalysisResults.length > 0) {
      const urlRecommendations = urlAnalysisResults.flatMap(result => result.recommendations);
      finalRecommendations.push(...urlRecommendations);
      
      // เพิ่มคำแนะนำเฉพาะสำหรับ URL ที่เสี่ยง
      const criticalUrls = urlAnalysisResults.filter(result => result.riskLevel === 'CRITICAL');
      if (criticalUrls.length > 0) {
        finalRecommendations.unshift('🚨 พบลิงค์อันตราย! ห้ามคลิกหรือเข้าเว็บไซต์นี้');
      }
      
      const phishingUrls = urlAnalysisResults.filter(result => result.threatType === 'PHISHING');
      if (phishingUrls.length > 0) {
        finalRecommendations.unshift('🎣 ระวังเว็บไซต์ฟิชชิ่ง! อย่ากรอกข้อมูลส่วนตัว');
      }
    }
    
    return {
      ...baseResult,
      riskScore: finalRiskScore,
      riskLevel: finalRiskLevel,
      threatType: finalThreatType,
      confidence: Math.max(baseResult.confidence, thaiAnalysis.riskScore),
      detectedPatterns: finalDetectedPatterns,
      recommendations: [...new Set(finalRecommendations)], // Remove duplicates
      thaiThreatCategory: thaiAnalysis.threatCategory || undefined,
      elderlyWarnings: thaiAnalysis.elderlyWarnings,
      educationalTips: thaiAnalysis.educationalTips,
      trustedPhoneNumbers: baseResult.trustedPhoneNumbers || [],
      suspiciousPhoneNumbers: baseResult.suspiciousPhoneNumbers || []
    };
  }

  private combineAnalysisResults(
    aiAnalysis: AIAnalysisResult, 
    keywordAnalysis: Omit<ThreatAnalysisResult, 'processingTime'>
  ): Omit<ThreatAnalysisResult, 'processingTime'> {
    
    if (!aiAnalysis.isAnalyzed) {
      // AI failed, use keyword analysis only
      console.log('📝 Using keyword analysis only (AI unavailable)');
      return keywordAnalysis;
    }
    
    // AI succeeded, combine results
    console.log('🤖 Combining AI and keyword analysis');
    
    // Take the higher risk score between AI and keyword analysis
    const finalRiskScore = Math.max(aiAnalysis.riskScore, keywordAnalysis.riskScore);
    
    // Determine final risk level based on combined score
    let finalRiskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (finalRiskScore >= 0.8) finalRiskLevel = 'CRITICAL';
    else if (finalRiskScore >= 0.6) finalRiskLevel = 'HIGH';
    else if (finalRiskScore >= 0.4) finalRiskLevel = 'MEDIUM';
    else if (finalRiskScore >= 0.2) finalRiskLevel = 'LOW';
    else finalRiskLevel = 'SAFE';
    
    // Prefer AI threat type if confidence is high, otherwise use keyword analysis
    const finalThreatType = aiAnalysis.confidence > 0.6 ? aiAnalysis.threatType : keywordAnalysis.threatType;
    
    // Combine detected patterns
    const combinedPatterns = [
      ...keywordAnalysis.detectedPatterns,
      ...aiAnalysis.detectedPatterns,
      ...(aiAnalysis.isAnalyzed ? ['ai_analyzed'] : [])
    ];
    
    // Use higher confidence
    const finalConfidence = Math.max(aiAnalysis.confidence, keywordAnalysis.confidence);
    
    return {
      riskScore: finalRiskScore,
      riskLevel: finalRiskLevel,
      threatType: finalThreatType,
      confidence: finalConfidence,
      detectedPatterns: combinedPatterns,
      suspiciousKeywords: keywordAnalysis.suspiciousKeywords,
      urls: keywordAnalysis.urls,
      phoneNumbers: keywordAnalysis.phoneNumbers,
      trustedPhoneNumbers: keywordAnalysis.trustedPhoneNumbers,
      suspiciousPhoneNumbers: keywordAnalysis.suspiciousPhoneNumbers,
      recommendations: this.generateRecommendations(finalRiskLevel, finalThreatType, aiAnalysis.reasoning, [], keywordAnalysis.trustedPhoneNumbers, keywordAnalysis.suspiciousPhoneNumbers),
      analysisMethod: 'basic' as const,
      allowFeedback: false
    };
  }

  private findSuspiciousKeywords(message: string): string[] {
    const found: string[] = [];
    for (const keyword of this.SUSPICIOUS_KEYWORDS) {
      if (message.toLowerCase().includes(keyword.toLowerCase())) {
        found.push(keyword);
      }
    }
    return found;
  }

  private extractUrls(message: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.[a-z]{2,}[^\s]*)/gi;
    return message.match(urlRegex) || [];
  }

  private extractPhoneNumbers(message: string): string[] {
    // Use the improved phone number detector
    return ThaiPhoneNumberDetector.extractPhoneNumbers(message);
  }

  private categorizePhonesNumbers(phoneNumbers: string[]): { trusted: string[], suspicious: string[] } {
    const trusted: string[] = [];
    const suspicious: string[] = [];
    
    phoneNumbers.forEach(phone => {
      if (TrustedPhoneChecker.isTrustedNumber(phone)) {
        trusted.push(phone);
      } else {
        suspicious.push(phone);
      }
    });
    
    return { trusted, suspicious };
  }

  private hasUrgencyPatterns(message: string): boolean {
    const urgencyPatterns = [
      /กรุณา.{0,10}ทันที/i,
      /ด่วน/i,
      /รีบ/i,
      /ทันที/i,
      /หมดเขต/i
    ];
    
    return urgencyPatterns.some(pattern => pattern.test(message));
  }

  private hasBankKeywords(message: string): boolean {
    const bankKeywords = [
      'กสิกรไทย', 'กรุงเทพ', 'กรุงไทย', 'ทหารไทย', 'ไทยพาณิชย์',
      'กรุงศรี', 'ออมสิน', 'เกียรตินาคิน', 'ธนชาต', 'ซีไอเอ็มบี'
    ];
    
    return bankKeywords.some(bank => 
      message.toLowerCase().includes(bank.toLowerCase())
    );
  }

  private generateRecommendations(riskLevel: string, threatType: string, aiReasoning?: string, urlResults: URLAnalysisResult[] = [], trustedPhones: string[] = [], suspiciousPhones: string[] = []): string[] {
    const recommendations: string[] = [];

    switch (riskLevel) {
      case 'CRITICAL':
        recommendations.push('🛑 อันตรายสูงสุด! ห้ามคลิกลิงก์หรือให้ข้อมูลใดๆ');
        recommendations.push('📞 โทรแจ้งครอบครัวทันที');
        recommendations.push('🚨 รายงานต่อตำรวจไซเบอร์ที่ 1441');
        break;
        
      case 'HIGH':
        recommendations.push('⚠️ เสี่ยงสูง! ตรวจสอบให้แน่ใจก่อนดำเนินการใดๆ');
        recommendations.push('📞 โทรสอบถามหน่วยงานโดยตรง');
        recommendations.push('👨‍👩‍👧‍👦 ปรึกษาลูกหลานก่อน');
        break;
        
      case 'MEDIUM':
        recommendations.push('🔍 ควรระวัง ตรวจสอบข้อมูลให้ดี');
        recommendations.push('❓ ถามคนที่เชื่อถือได้');
        recommendations.push('⏱️ อย่าตัดสินใจรีบร้อน');
        break;
        
      default:
        recommendations.push('✅ ข้อความนี้ดูปลอดภัย');
        break;
    }

    // Add specific recommendations based on threat type
    switch (threatType) {
      case 'PHISHING':
        recommendations.push('🔗 ห้ามกรอกข้อมูลในเว็บไซต์ที่ไม่แน่ใจ');
        break;
      case 'SCAM':
        recommendations.push('💳 ธนาคารจริงไม่เรียกเก็บค่าธรรมเนียมผ่าน SMS');
        break;
      case 'INVESTMENT_FRAUD':
        recommendations.push('💰 การลงทุนที่แปลกใหม่มักมีความเสี่ยงสูง');
        break;
      case 'ROMANCE_SCAM':
        recommendations.push('💕 ระวังคนแปลกหน้าที่แสดงความรักเร็วเกินไป');
        break;
    }

    // Add URL-specific recommendations
    if (urlResults && urlResults.length > 0) {
      const highRiskUrls = urlResults.filter(result => 
        result.riskLevel === 'HIGH' || result.riskLevel === 'CRITICAL'
      );
      
      if (highRiskUrls.length > 0) {
        recommendations.push('🌐 ตรวจพบเว็บไซต์เสี่ยง ไม่ควรเข้าเว็บไซต์ดังกล่าว');
      }
      
      const phishingUrls = urlResults.filter(result => result.threatType === 'PHISHING');
      if (phishingUrls.length > 0) {
        recommendations.push('🎣 ระวังเว็บไซต์ปลอม อย่ากรอกข้อมูลส่วนตัว');
      }
      
      const urlsWithLoginForms = urlResults.filter(result => result.hasLoginForm);
      if (urlsWithLoginForms.length > 0) {
        recommendations.push('🔐 เว็บไซต์มีฟอร์มล็อกอิน ตรวจสอบ URL ให้แน่ใจก่อนกรอกข้อมูล');
      }
    }

    // Add phone number specific recommendations
    if (trustedPhones.length > 0) {
      recommendations.push(`✅ ตรวจพบเบอร์โทรของหน่วยงานที่เชื่อถือได้: ${trustedPhones.join(', ')}`);
      
      // Add specific information about trusted numbers
      trustedPhones.forEach(phone => {
        const phoneInfo = TrustedPhoneChecker.getTrustedNumberInfo(phone);
        if (phoneInfo) {
          recommendations.push(`📞 ${phone} - ${phoneInfo.organization} (${phoneInfo.description})`);
        }
      });
    }
    
    if (suspiciousPhones.length > 0) {
      recommendations.push(`⚠️ ระวังเบอร์โทรที่ไม่เชื่อถือได้: ${suspiciousPhones.join(', ')}`);
      recommendations.push('🔍 ตรวจสอบเบอร์โทรผ่านหน่วยงานที่เกี่ยวข้องโดยตรง');
    }

    // Add AI reasoning if available
    if (aiReasoning && aiReasoning !== 'No reasoning provided') {
      recommendations.push(`🤖 AI วิเคราะห์: ${aiReasoning}`);
    }

    return recommendations;
  }
  
  /**
   * Record user feedback for learning
   */
  public async recordUserFeedback(
    messageId: string,
    originalMessage: string,
    originalResult: ThreatAnalysisResult,
    feedback: {
      feedbackType: 'correct' | 'false_positive' | 'false_negative' | 'partially_correct';
      userComment?: string;
      correctedThreatType?: string;
      correctedRiskLevel?: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      confidence: number;
    },
    userId?: string
  ): Promise<string> {
    if (!this.ENABLE_FEEDBACK_LEARNING || !this.feedbackLearning) {
      console.log('📝 Feedback learning is disabled');
      return 'feedback_disabled';
    }
    
    try {
      const feedbackId = await this.feedbackLearning.recordFeedback({
        userId: userId || 'anonymous',
        messageId,
        originalMessage,
        originalResult,
        ...feedback
      });
      
      console.log(`✅ User feedback recorded: ${feedback.feedbackType} (ID: ${feedbackId})`);
      return feedbackId;
      
    } catch (error) {
      console.error('❌ Failed to record feedback:', error);
      throw error;
    }
  }
  
  /**
   * Get learning metrics and statistics
   */
  public getLearningMetrics(): LearningMetrics | null {
    if (!this.ENABLE_FEEDBACK_LEARNING || !this.feedbackLearning) {
      return null;
    }
    
    return this.feedbackLearning.getLearningMetrics();
  }
  
  /**
   * Get improvement recommendations
   */
  public getImprovementRecommendations(): string[] {
    if (!this.ENABLE_FEEDBACK_LEARNING || !this.feedbackLearning) {
      return ['Feedback learning system is disabled'];
    }
    
    return this.feedbackLearning.generateImprovementRecommendations();
  }
  
  /**
   * Export learning data for analysis
   */
  public exportLearningData() {
    if (!this.ENABLE_FEEDBACK_LEARNING || !this.feedbackLearning) {
      return null;
    }
    
    return this.feedbackLearning.exportLearningData();
  }
  
  /**
   * Process improvements from accumulated feedback
   */
  public async processImprovements(): Promise<{
    patternsUpdated: number;
    modelUpdated: boolean;
    accuracyGain: number;
  } | null> {
    if (!this.ENABLE_FEEDBACK_LEARNING || !this.feedbackLearning) {
      return null;
    }
    
    try {
      const improvements = await this.feedbackLearning.processImprovements();
      
      console.log('🎓 System improvements processed:', improvements);
      return improvements;
      
    } catch (error) {
      console.error('❌ Failed to process improvements:', error);
      throw error;
    }
  }
  
  /**
   * Check system health and accuracy
   */
  public getSystemHealth(): {
    enhancedDetectionEnabled: boolean;
    machineLearningEnabled: boolean;
    feedbackLearningEnabled: boolean;
    learningMetrics?: LearningMetrics;
    improvementRecommendations: string[];
  } {
    return {
      enhancedDetectionEnabled: this.ENABLE_ENHANCED_DETECTION,
      machineLearningEnabled: this.ENABLE_ML_DETECTION,
      feedbackLearningEnabled: this.ENABLE_FEEDBACK_LEARNING,
      learningMetrics: this.getLearningMetrics() || undefined,
      improvementRecommendations: this.getImprovementRecommendations()
    };
  }
}