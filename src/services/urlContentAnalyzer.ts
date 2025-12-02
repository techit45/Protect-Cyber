/**
 * URL Content Analyzer Service (Updated with Typhoon Integration)
 * ตรวจสอบเนื้อหาในลิงค์โดยใช้ AI เพื่อหาภัยคุกคาม
 */

import axios from 'axios';
import { AIAnalyzer } from './aiAnalyzer';
import { TrustedWebsiteChecker } from '../data/trustedWebsites';
import TyphoonCyberSecurityService, { TyphoonAnalysisResult } from '../scripts/typhoon_integration';
import { SSLSecurityChecker, SecurityAnalysisResult } from './sslSecurityChecker';
import { DomainReputationChecker, DomainReputationResult, MalwareScanResult } from './domainReputationChecker';

export interface URLAnalysisResult {
  url: string;
  isAccessible: boolean;
  title?: string;
  description?: string;
  content?: string;
  screenshots?: string[];
  
  // AI Analysis Results
  riskScore: number;
  riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  threatType: 'PHISHING' | 'SCAM' | 'MALWARE' | 'SUSPICIOUS' | 'SAFE';
  confidence: number;
  
  // Threat Indicators
  detectedPatterns: string[];
  suspiciousElements: string[];
  
  // Content Analysis
  hasLoginForm: boolean;
  requestsPersonalInfo: boolean;
  hasSuspiciousKeywords: boolean;
  hasRedirects: boolean;
  
  // Technical Details
  statusCode?: number;
  responseTime: number;
  certificateValid?: boolean;
  
  // Trust Assessment
  isTrustedWebsite: boolean;
  trustedWebsiteInfo?: any;
  
  // AI Models Used
  aiModelsUsed: string[];
  typhoonAnalysis?: TyphoonAnalysisResult;
  
  // SSL and Security Analysis
  securityAnalysis?: SecurityAnalysisResult;
  
  // Domain Reputation and Malware Analysis
  domainReputation?: DomainReputationResult;
  malwareScan?: MalwareScanResult;
  
  // Recommendations
  recommendations: string[];
  warnings: string[];
  
  // Metadata
  analyzedAt: Date;
  processingTime: number;
}

export interface URLScanConfig {
  timeout: number;
  maxRedirects: number;
  userAgent: string;
  enableScreenshot: boolean;
  maxContentLength: number;
  useTyphoon: boolean;
  useMultipleAI: boolean;
  enableSSLCheck: boolean;
  enableDomainReputation: boolean;
  enableMalwareScan: boolean;
}

export class URLContentAnalyzerService {
  private aiAnalyzer: AIAnalyzer;
  private typhoonService: TyphoonCyberSecurityService;
  
  private readonly defaultConfig: URLScanConfig = {
    timeout: 10000,
    maxRedirects: 3,
    userAgent: 'ProtectCyber-Bot/1.0 (Threat Detection Scanner)',
    enableScreenshot: false,
    maxContentLength: 500000,
    useTyphoon: true,
    useMultipleAI: false,
    enableSSLCheck: true,
    enableDomainReputation: true,
    enableMalwareScan: true
  };

  private readonly suspiciousKeywords = [
    // Thai suspicious keywords - Financial & Urgent
    'ยืนยันตัวตน', 'อัปเดตข้อมูล', 'บัญชีถูกอายัด', 'บัญชีถูกระงับ', 'ชำระค่าธรรมเนียม',
    'หมดอายุ', 'กรุณาดำเนินการ', 'ด่วน', 'รีบ', 'ทันที', 'จำกัดเวลา',
    'เปลี่ยนรหัสผ่าน', 'แจ้งพัสดุ', 'ยืนยันการสั่งซื้อ', 'ยืนยันการโอนเงิน',
    
    // Thai suspicious keywords - Rewards & Prizes
    'รางวัล', 'โชคดี', 'ได้รับเลือก', 'ผู้โชคดี', 'ลงทุน', 'กำไร',
    'เครดิตฟรี', 'ฟรีเครดิต', 'รับฟรี', 'แจกฟรี', 'ของรางวัล',
    'รับสิทธิพิเศษ', 'ผู้โชคดี', 'ถูกรางวัล', 'โบนัส',
    
    // English suspicious keywords
    'verify account', 'update information', 'account suspended', 'urgent action',
    'click here', 'act now', 'limited time', 'winner', 'congratulations',
    'free money', 'guaranteed profit', 'risk-free', 'get rich quick'
  ];

  constructor() {
    this.aiAnalyzer = new AIAnalyzer();
    this.typhoonService = new TyphoonCyberSecurityService({
      modelPath: './models/typhoon-cybersecurity-finetuned',
      useGradio: true,
      fallbackEnabled: true
    });
  }

  /**
   * เริ่มต้นใช้งาน service
   */
  async initialize(): Promise<void> {
    console.log('🔧 Initializing URL Content Analyzer...');
    
    // Initialize Typhoon service
    await this.typhoonService.initialize();
    
    console.log('✅ URL Content Analyzer initialized');
  }

  /**
   * วิเคราะห์ลิงค์แบบครบถ้วน
   */
  async analyzeURL(url: string, config: Partial<URLScanConfig> = {}): Promise<URLAnalysisResult> {
    const startTime = Date.now();
    const finalConfig = { ...this.defaultConfig, ...config };
    
    console.log('🔍 Starting comprehensive URL analysis:', url);
    
    try {
      // ตรวจสอบความถูกต้องของ URL
      const normalizedURL = this.normalizeURL(url);
      
      // ตรวจสอบว่าเป็นเว็บไซต์ที่เชื่อถือได้หรือไม่
      const isTrustedWebsite = TrustedWebsiteChecker.isTrustedWebsite(normalizedURL);
      const trustedWebsiteInfo = TrustedWebsiteChecker.getTrustedWebsiteInfo(normalizedURL);
      
      // ดึงข้อมูลจากเว็บไซต์
      const webContent = await this.fetchWebContent(normalizedURL, finalConfig);
      
      // วิเคราะห์ด้วย AI หลายตัว
      const aiModelsUsed: string[] = [];
      let aiAnalysis: any;
      let typhoonAnalysis: TyphoonAnalysisResult | undefined;
      
      if (finalConfig.useTyphoon) {
        try {
          console.log('🌪️ Running Typhoon analysis...');
          typhoonAnalysis = await this.typhoonService.analyzeURL(
            normalizedURL,
            webContent.title || '',
            webContent.content || ''
          );
          aiModelsUsed.push('typhoon-7b');
          
          // ใช้ Typhoon เป็นหลัก
          aiAnalysis = {
            riskScore: typhoonAnalysis.confidence,
            threatType: typhoonAnalysis.threatType,
            confidence: typhoonAnalysis.confidence,
            detectedPatterns: typhoonAnalysis.detectedPatterns,
            reasoning: typhoonAnalysis.reasoning
          };
          
        } catch (error) {
          console.error('❌ Typhoon analysis failed:', error);
          // Fallback to regular AI
          aiAnalysis = await this.analyzeContentWithAI(webContent);
          aiModelsUsed.push('fallback-ai');
        }
      } else {
        // ใช้ AI แบบเดิม
        aiAnalysis = await this.analyzeContentWithAI(webContent);
        aiModelsUsed.push('standard-ai');
      }
      
      // วิเคราะห์เพิ่มเติมด้วย AI หลายตัว (ถ้าเปิดใช้)
      if (finalConfig.useMultipleAI && typhoonAnalysis) {
        try {
          console.log('🤖 Running additional AI analysis...');
          const standardAnalysis = await this.analyzeContentWithAI(webContent);
          aiModelsUsed.push('standard-ai');
          
          // รวมผลลัพธ์จาก AI หลายตัว
          aiAnalysis = this.combineAIResults(aiAnalysis, standardAnalysis);
          
        } catch (error) {
          console.error('❌ Additional AI analysis failed:', error);
        }
      }
      
      // ตรวจสอบองค์ประกอบที่น่าสงสัย
      const suspiciousElements = this.detectSuspiciousElements(webContent);
      
      // ตรวจสอบ SSL และความปลอดภัย
      let securityAnalysis: SecurityAnalysisResult | undefined;
      if (finalConfig.enableSSLCheck) {
        try {
          console.log('🔒 Running SSL security analysis...');
          securityAnalysis = await SSLSecurityChecker.analyzeWebsiteSecurity(normalizedURL);
          
          // เพิ่มการแจ้งเตือนจาก SSL analysis
          if (securityAnalysis.riskLevel === 'CRITICAL' || securityAnalysis.riskLevel === 'HIGH') {
            suspiciousElements.elements.push(`SSL Security: ${securityAnalysis.riskLevel}`);
          }
          
        } catch (error) {
          console.error('❌ SSL security analysis failed:', error);
        }
      }
      
      // ตรวจสอบ Domain Reputation
      let domainReputation: DomainReputationResult | undefined;
      if (finalConfig.enableDomainReputation) {
        try {
          console.log('🔍 Running domain reputation check...');
          domainReputation = await DomainReputationChecker.checkDomainReputation(normalizedURL);
          
          // เพิ่มการแจ้งเตือนจาก domain reputation
          if (domainReputation.reputation === 'MALICIOUS') {
            suspiciousElements.elements.push('Malicious Domain');
          } else if (domainReputation.reputation === 'SUSPICIOUS') {
            suspiciousElements.elements.push('Suspicious Domain');
          }
          
        } catch (error) {
          console.error('❌ Domain reputation check failed:', error);
        }
      }
      
      // ตรวจสอบ Malware
      let malwareScan: MalwareScanResult | undefined;
      if (finalConfig.enableMalwareScan) {
        try {
          console.log('🦠 Running malware scan...');
          malwareScan = await DomainReputationChecker.scanForMalware(normalizedURL);
          
          // เพิ่มการแจ้งเตือนจาก malware scan
          if (!malwareScan.isClean) {
            suspiciousElements.elements.push(`Malware: ${malwareScan.overallRisk}`);
          }
          
        } catch (error) {
          console.error('❌ Malware scan failed:', error);
        }
      }
      
      // คำนวณคะแนนความเสี่ยง
      const riskAssessment = this.calculateRiskScore(
        webContent, 
        aiAnalysis, 
        suspiciousElements, 
        isTrustedWebsite,
        securityAnalysis,
        domainReputation,
        malwareScan
      );
      
      // ปรับปรุงคะแนนด้วยผลลัพธ์จาก Typhoon
      if (typhoonAnalysis) {
        riskAssessment.riskScore = this.combineRiskScores(
          riskAssessment.riskScore,
          typhoonAnalysis.confidence,
          typhoonAnalysis.riskLevel
        );
      }
      
      // สร้างคำแนะนำ
      const recommendations = this.generateRecommendations(
        riskAssessment.riskLevel, 
        suspiciousElements, 
        isTrustedWebsite, 
        trustedWebsiteInfo,
        typhoonAnalysis
      );
      
      const warnings = this.generateWarnings(
        riskAssessment.riskLevel, 
        suspiciousElements, 
        isTrustedWebsite,
        typhoonAnalysis
      );
      
      const result: URLAnalysisResult = {
        url: normalizedURL,
        isAccessible: webContent.isAccessible,
        title: webContent.title,
        description: webContent.description,
        content: webContent.content?.substring(0, 1000),
        
        // AI Analysis
        riskScore: riskAssessment.riskScore,
        riskLevel: riskAssessment.riskLevel as 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        threatType: riskAssessment.threatType as 'PHISHING' | 'SCAM' | 'MALWARE' | 'SUSPICIOUS' | 'SAFE',
        confidence: aiAnalysis.confidence,
        
        // Threat Indicators
        detectedPatterns: [...aiAnalysis.detectedPatterns, ...suspiciousElements.patterns],
        suspiciousElements: suspiciousElements.elements,
        
        // Content Analysis
        hasLoginForm: suspiciousElements.hasLoginForm,
        requestsPersonalInfo: suspiciousElements.requestsPersonalInfo,
        hasSuspiciousKeywords: suspiciousElements.hasSuspiciousKeywords,
        hasRedirects: webContent.redirectCount > 0,
        
        // Technical Details
        statusCode: webContent.statusCode,
        responseTime: webContent.responseTime,
        certificateValid: webContent.certificateValid,
        
        // Trust Assessment
        isTrustedWebsite,
        trustedWebsiteInfo,
        
        // AI Models Used
        aiModelsUsed,
        typhoonAnalysis,
        
        // SSL and Security Analysis
        securityAnalysis,
        
        // Domain Reputation and Malware Analysis
        domainReputation,
        malwareScan,
        
        // Recommendations
        recommendations,
        warnings,
        
        // Metadata
        analyzedAt: new Date(),
        processingTime: Date.now() - startTime
      };
      
      console.log('✅ URL analysis completed:', {
        url: normalizedURL,
        riskLevel: result.riskLevel,
        threatType: result.threatType,
        aiModelsUsed: result.aiModelsUsed,
        processingTime: result.processingTime
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ URL analysis failed:', error);
      
      return {
        url,
        isAccessible: false,
        riskScore: 0.5,
        riskLevel: 'MEDIUM',
        threatType: 'SUSPICIOUS',
        confidence: 0.3,
        detectedPatterns: ['analysis_failed'],
        suspiciousElements: [],
        hasLoginForm: false,
        requestsPersonalInfo: false,
        hasSuspiciousKeywords: false,
        hasRedirects: false,
        responseTime: Date.now() - startTime,
        isTrustedWebsite: false,
        trustedWebsiteInfo: null,
        aiModelsUsed: ['error'],
        recommendations: ['ไม่สามารถตรวจสอบเว็บไซต์ได้ ควรระวัง'],
        warnings: ['เว็บไซต์อาจมีปัญหาหรือไม่สามารถเข้าถึงได้'],
        analyzedAt: new Date(),
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * รวมผลลัพธ์จาก AI หลายตัว
   */
  private combineAIResults(typhoonResult: any, standardResult: any): any {
    return {
      riskScore: (typhoonResult.riskScore + standardResult.riskScore) / 2,
      threatType: typhoonResult.threatType, // ใช้ Typhoon เป็นหลัก
      confidence: Math.max(typhoonResult.confidence, standardResult.confidence),
      detectedPatterns: [...typhoonResult.detectedPatterns, ...standardResult.detectedPatterns],
      reasoning: `Typhoon: ${typhoonResult.reasoning}\nStandard AI: ${standardResult.reasoning}`
    };
  }

  /**
   * รวมคะแนนความเสี่ยงจากหลายแหล่ง
   */
  private combineRiskScores(
    standardScore: number, 
    typhoonConfidence: number, 
    typhoonRiskLevel: string
  ): number {
    // แปลง risk level เป็นคะแนน
    const riskLevelScores = {
      'SAFE': 0.1,
      'SUSPICIOUS': 0.5,
      'PHISHING': 0.9
    };
    
    const typhoonScore = riskLevelScores[typhoonRiskLevel as keyof typeof riskLevelScores] || 0.5;
    
    // ให้น้ำหนัก Typhoon มากกว่า (70:30)
    return (typhoonScore * 0.7) + (standardScore * 0.3);
  }

  /**
   * ปรับปรุง URL ให้อยู่ในรูปแบบที่ถูกต้อง
   */
  private normalizeURL(url: string): string {
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const urlObj = new URL(url);
      return urlObj.toString();
    } catch (error) {
      throw new Error(`Invalid URL format: ${url}`);
    }
  }

  /**
   * ดึงเนื้อหาจากเว็บไซต์
   */
  private async fetchWebContent(url: string, config: URLScanConfig) {
    const startTime = Date.now();
    
    try {
      console.log('📡 Fetching web content from:', url);
      
      const response = await axios.get(url, {
        timeout: config.timeout,
        maxRedirects: config.maxRedirects,
        headers: {
          'User-Agent': config.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        validateStatus: (status) => status < 500,
        maxContentLength: config.maxContentLength
      });
      
      const responseTime = Date.now() - startTime;
      const html = response.data;
      
      const title = this.extractTitle(html);
      const description = this.extractDescription(html);
      const content = this.extractTextContent(html);
      
      return {
        isAccessible: true,
        statusCode: response.status,
        responseTime,
        title,
        description,
        content,
        html,
        redirectCount: response.request._redirectCount || 0,
        certificateValid: url.startsWith('https://'),
        url
      };
      
    } catch (error: any) {
      console.error('❌ Failed to fetch web content:', error.message);
      
      return {
        isAccessible: false,
        statusCode: error.response?.status || 0,
        responseTime: Date.now() - startTime,
        title: '',
        description: '',
        content: '',
        html: '',
        redirectCount: 0,
        certificateValid: false,
        url
      };
    }
  }

  /**
   * วิเคราะห์เนื้อหาด้วย AI (Standard)
   */
  private async analyzeContentWithAI(webContent: any) {
    if (!webContent.isAccessible || !webContent.content) {
      return {
        riskScore: 0.5,
        threatType: 'SUSPICIOUS',
        confidence: 0.3,
        detectedPatterns: ['content_not_accessible'],
        reasoning: 'ไม่สามารถเข้าถึงเนื้อหาเว็บไซต์ได้'
      };
    }
    
    try {
      console.log('🤖 Analyzing web content with standard AI...');
      
      const analysisText = `
        กรุณาวิเคราะห์เว็บไซต์นี้ว่าเป็นเว็บไซต์มิจฉาชีพหรือไม่:
        
        URL: ${webContent.url || 'ไม่ทราบ'}
        หัวข้อเว็บไซต์: ${webContent.title || 'ไม่มีหัวข้อ'}
        คำอธิบาย: ${webContent.description || 'ไม่มีคำอธิบาย'}
        สถานะ HTTP: ${webContent.statusCode || 'ไม่ทราบ'}
        
        เนื้อหาเว็บไซต์:
        ${webContent.content.substring(0, 3000)}
        
        **สำคัญ: ถ้าเป็นเว็บไซต์ที่เชื่อถือได้หรือ Official Account ของบริษัทใหญ่ 
        (เช่น LINE, Google, Facebook, ธนาคาร, หน่วยงานรัฐ) ให้ลดคะแนนความเสี่ยง**
        
        **หมายเหตุ: ข้อความการตลาดปกติจาก Official Account ไม่ควรได้คะแนนเสี่ยงสูง**
      `;
      
      const aiResult = await this.aiAnalyzer.analyzeMessage(analysisText);
      
      return {
        riskScore: aiResult.riskScore,
        threatType: aiResult.threatType,
        confidence: aiResult.confidence,
        detectedPatterns: aiResult.detectedPatterns,
        reasoning: aiResult.reasoning
      };
      
    } catch (error) {
      console.error('❌ Standard AI analysis failed:', error);
      
      return {
        riskScore: 0.4,
        threatType: 'SUSPICIOUS',
        confidence: 0.2,
        detectedPatterns: ['ai_analysis_failed'],
        reasoning: 'การวิเคราะห์ด้วย AI ล้มเหลว'
      };
    }
  }

  /**
   * ดึงหัวข้อจาก HTML
   */
  private extractTitle(html: string): string {
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : '';
  }

  /**
   * ดึงคำอธิบายจาก HTML
   */
  private extractDescription(html: string): string {
    const descMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i) ||
                      html.match(/<meta[^>]*property=["\']og:description["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i);
    return descMatch ? descMatch[1].trim() : '';
  }

  /**
   * ดึงเนื้อหาข้อความจาก HTML
   */
  private extractTextContent(html: string): string {
    const cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    const text = cleanHtml.replace(/<[^>]*>/g, ' ')
                         .replace(/\s+/g, ' ')
                         .trim();
    
    return text;
  }

  /**
   * ตรวจสอบองค์ประกอบที่น่าสงสัย
   */
  private detectSuspiciousElements(webContent: any) {
    const elements: string[] = [];
    const patterns: string[] = [];
    
    if (!webContent.isAccessible || !webContent.html) {
      return {
        elements,
        patterns,
        hasLoginForm: false,
        requestsPersonalInfo: false,
        hasSuspiciousKeywords: false
      };
    }
    
    const html = webContent.html;
    const content = webContent.content;
    const url = webContent.url || '';
    
    // ตรวจสอบ login form
    const loginFormPatterns = [
      /<input[^>]*type=["\']password["\'][^>]*>/i,
      /<input[^>]*name=["\'][^"\']*password[^"\']*["\'][^>]*>/i,
    ];
    
    const hasLoginForm = loginFormPatterns.some(pattern => pattern.test(html));
    
    if (hasLoginForm) {
      elements.push('Login form detected');
      patterns.push('login_form');
    }
    
    // ตรวจสอบการขอข้อมูลส่วนตัว
    const personalInfoPatterns = [
      'หมายเลขบัตรประจำตัว', 'เลขบัตรเครดิต', 'รหัสบัตร ATM',
      'PIN', 'OTP', 'รหัส OTP'
    ];
    
    const requestsPersonalInfo = personalInfoPatterns.some(pattern => 
      content.includes(pattern)
    );
    
    if (requestsPersonalInfo) {
      elements.push('Requests personal information');
      patterns.push('personal_info_request');
    }
    
    // ตรวจสอบคำที่น่าสงสัย
    const foundSuspiciousKeywords = this.suspiciousKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const hasSuspiciousKeywords = foundSuspiciousKeywords.length > 0;
    
    if (hasSuspiciousKeywords) {
      elements.push(`Contains suspicious keywords: ${foundSuspiciousKeywords.slice(0, 3).join(', ')}`);
      patterns.push('suspicious_keywords');
    }
    
    return {
      elements,
      patterns,
      hasLoginForm,
      requestsPersonalInfo,
      hasSuspiciousKeywords
    };
  }

  /**
   * คำนวณคะแนนความเสี่ยง
   */
  private calculateRiskScore(webContent: any, aiAnalysis: any, suspiciousElements: any, isTrustedWebsite: boolean = false, securityAnalysis?: SecurityAnalysisResult, domainReputation?: DomainReputationResult, malwareScan?: MalwareScanResult) {
    let riskScore = 0;
    let threatType: 'PHISHING' | 'SCAM' | 'MALWARE' | 'SUSPICIOUS' | 'SAFE' = 'SAFE';
    
    // ถ้าเป็นเว็บไซต์ที่เชื่อถือได้ ให้ลดคะแนนความเสี่ยง
    if (isTrustedWebsite) {
      riskScore = Math.max(0, aiAnalysis.riskScore * 0.2);
      
      if (suspiciousElements.elements.length <= 2 && aiAnalysis.riskScore < 0.7) {
        return {
          riskScore: 0.15,
          riskLevel: 'SAFE',
          threatType: 'SAFE'
        };
      }
    } else {
      riskScore += aiAnalysis.riskScore * 0.6;
    }
    
    // เพิ่มคะแนนจาก suspicious elements
    const elementCount = suspiciousElements.elements.length;
    riskScore += Math.min(elementCount * 0.1, 0.4);
    
    // เพิ่มคะแนนถ้าไม่ใช่เว็บไซต์ที่เชื่อถือได้
    if (!isTrustedWebsite) {
      if (TrustedWebsiteChecker.hasSuspiciousTLD(webContent.url || '')) {
        riskScore += 0.3;
      }
      
      if (TrustedWebsiteChecker.isIPAddress(webContent.url || '')) {
        riskScore += 0.4;
      }
    }
    
    // ปรับคะแนนตามประเภทองค์ประกอบ
    if (suspiciousElements.hasLoginForm && suspiciousElements.requestsPersonalInfo) {
      riskScore += 0.3;
      threatType = 'PHISHING';
    } else if (suspiciousElements.hasSuspiciousKeywords) {
      riskScore += 0.2;
      threatType = 'SCAM';
    }
    
    // เพิ่มคะแนนจาก SSL Security Analysis
    if (securityAnalysis) {
      const sslRiskScore = securityAnalysis.overallRiskScore / 100;
      
      // ถ้าไม่ใช่เว็บไซต์ที่เชื่อถือได้ ให้น้ำหนักมากขึ้น
      const sslWeight = isTrustedWebsite ? 0.1 : 0.3;
      riskScore += sslRiskScore * sslWeight;
      
      // ถ้า SSL มีปัญหาร้ายแรง ให้เพิ่มคะแนนเสี่ยง
      if (securityAnalysis.riskLevel === 'CRITICAL') {
        riskScore += 0.4;
        threatType = 'PHISHING';
      } else if (securityAnalysis.riskLevel === 'HIGH') {
        riskScore += 0.2;
        if (threatType === 'SAFE') threatType = 'SUSPICIOUS';
      }
    }
    
    // เพิ่มคะแนนจาก Domain Reputation
    if (domainReputation) {
      const domainRiskScore = domainReputation.riskScore / 100;
      const domainWeight = isTrustedWebsite ? 0.2 : 0.4;
      riskScore += domainRiskScore * domainWeight;
      
      // ปรับ threat type ตาม domain reputation
      if (domainReputation.reputation === 'MALICIOUS') {
        riskScore += 0.5;
        threatType = 'MALWARE';
      } else if (domainReputation.reputation === 'SUSPICIOUS') {
        riskScore += 0.3;
        if (threatType === 'SAFE') threatType = 'SUSPICIOUS';
      }
    }
    
    // เพิ่มคะแนนจาก Malware Scan
    if (malwareScan && !malwareScan.isClean) {
      const malwareWeight = isTrustedWebsite ? 0.2 : 0.5;
      
      switch (malwareScan.overallRisk) {
        case 'CRITICAL':
          riskScore += 0.6 * malwareWeight;
          threatType = 'MALWARE';
          break;
        case 'HIGH':
          riskScore += 0.4 * malwareWeight;
          if (threatType === 'SAFE') threatType = 'MALWARE';
          break;
        case 'MEDIUM':
          riskScore += 0.2 * malwareWeight;
          if (threatType === 'SAFE') threatType = 'SUSPICIOUS';
          break;
        case 'LOW':
          riskScore += 0.1 * malwareWeight;
          break;
      }
    }
    
    riskScore = Math.min(riskScore, 1);
    
    // กำหนด risk level
    let riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    
    if (isTrustedWebsite) {
      if (riskScore >= 0.7) riskLevel = 'HIGH';
      else if (riskScore >= 0.5) riskLevel = 'MEDIUM';
      else if (riskScore >= 0.3) riskLevel = 'LOW';
      else riskLevel = 'SAFE';
    } else {
      if (riskScore >= 0.8) riskLevel = 'CRITICAL';
      else if (riskScore >= 0.6) riskLevel = 'HIGH';
      else if (riskScore >= 0.4) riskLevel = 'MEDIUM';
      else if (riskScore >= 0.2) riskLevel = 'LOW';
      else riskLevel = 'SAFE';
    }
    
    return {
      riskScore,
      riskLevel,
      threatType
    };
  }

  /**
   * สร้างคำแนะนำ (รวม Typhoon)
   */
  private generateRecommendations(
    riskLevel: string, 
    suspiciousElements: any, 
    isTrustedWebsite: boolean = false, 
    trustedWebsiteInfo: any = null,
    typhoonAnalysis?: TyphoonAnalysisResult
  ): string[] {
    const recommendations: string[] = [];
    
    // เพิ่มคำแนะนำจาก Typhoon
    if (typhoonAnalysis) {
      recommendations.push(`🌪️ Typhoon AI: ${typhoonAnalysis.recommendation}`);
    }
    
    // ถ้าเป็นเว็บไซต์ที่เชื่อถือได้
    if (isTrustedWebsite && trustedWebsiteInfo) {
      recommendations.push(`✅ เว็บไซต์ที่เชื่อถือได้: ${trustedWebsiteInfo.organization}`);
    }
    
    // คำแนะนำตาม risk level
    switch (riskLevel) {
      case 'CRITICAL':
        recommendations.push('🛑 อันตรายสูงสุด! ห้ามใช้งานเว็บไซต์นี้');
        break;
      case 'HIGH':
        recommendations.push('⚠️ เสี่ยงสูง! ไม่แนะนำให้ใช้งาน');
        break;
      case 'MEDIUM':
        recommendations.push('🔍 ควรระวัง ตรวจสอบให้ดีก่อนใช้งาน');
        break;
      case 'LOW':
        recommendations.push('✅ ค่อนข้างปลอดภัย แต่ควรระวัง');
        break;
      default:
        recommendations.push('✅ เว็บไซต์นี้ดูปลอดภัย');
    }
    
    return recommendations;
  }

  /**
   * สร้างคำเตือน (รวม Typhoon)
   */
  private generateWarnings(
    riskLevel: string, 
    suspiciousElements: any, 
    isTrustedWebsite: boolean = false,
    typhoonAnalysis?: TyphoonAnalysisResult
  ): string[] {
    const warnings: string[] = [];
    
    // เพิ่มการวิเคราะห์จาก Typhoon
    if (typhoonAnalysis && typhoonAnalysis.reasoning) {
      warnings.push(`🌪️ Typhoon Analysis: ${typhoonAnalysis.reasoning}`);
    }
    
    if (!isTrustedWebsite) {
      warnings.push('⚠️ เว็บไซต์นี้ไม่ได้อยู่ในรายการเว็บไซต์ที่เชื่อถือได้');
    }
    
    if (suspiciousElements.elements.length > 0) {
      warnings.push(`🚨 พบองค์ประกอบน่าสงสัย: ${suspiciousElements.elements.join(', ')}`);
    }
    
    return warnings;
  }

  /**
   * ตรวจสอบสถานะของ service
   */
  async checkHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: {
      standardAI: boolean;
      typhoon: any;
      trustedWebsites: boolean;
    };
    responseTime: number;
  }> {
    const startTime = Date.now();
    
    try {
      // ตรวจสอบ Typhoon service
      const typhoonHealth = await this.typhoonService.checkHealth();
      
      return {
        status: 'healthy',
        services: {
          standardAI: true,
          typhoon: typhoonHealth,
          trustedWebsites: true
        },
        responseTime: Date.now() - startTime
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        services: {
          standardAI: false,
          typhoon: { status: 'unhealthy', error: error },
          trustedWebsites: false
        },
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * วิเคราะห์ลิงค์หลายๆ ลิงค์พร้อมกัน
   */
  async analyzeMultipleURLs(urls: string[], config: Partial<URLScanConfig> = {}): Promise<URLAnalysisResult[]> {
    console.log(`🔍 Analyzing ${urls.length} URLs with enhanced AI...`);
    
    const promises = urls.map(url => this.analyzeURL(url, config));
    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`❌ Failed to analyze URL ${urls[index]}:`, result.reason);
        return {
          url: urls[index],
          isAccessible: false,
          riskScore: 0.5,
          riskLevel: 'MEDIUM' as const,
          threatType: 'SUSPICIOUS' as const,
          confidence: 0.3,
          detectedPatterns: ['analysis_failed'],
          suspiciousElements: [],
          hasLoginForm: false,
          requestsPersonalInfo: false,
          hasSuspiciousKeywords: false,
          hasRedirects: false,
          responseTime: 0,
          isTrustedWebsite: false,
          trustedWebsiteInfo: null,
          aiModelsUsed: ['error'],
          recommendations: ['ไม่สามารถตรวจสอบลิงค์ได้'],
          warnings: ['เกิดข้อผิดพลาดในการตรวจสอบ'],
          analyzedAt: new Date(),
          processingTime: 0
        };
      }
    });
  }
}