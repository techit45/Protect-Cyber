import axios from 'axios';
import crypto from 'crypto';
import { UnknownThreatDetectorService, UnknownThreatResult } from './unknownThreatDetector';
import { ThaiPhoneNumberDetector } from '../utils/phoneNumberDetector';
import { TrustedPhoneChecker } from '../data/trustedPhoneNumbers';

// Thai National Cyber Threat Classification (10 categories)
export interface ThaiThreatCategory {
  id: number;
  nameEn: string;
  nameTh: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  educationalContent: string[];
}

export interface ThreatIOC {
  type: 'ip' | 'domain' | 'url' | 'hash' | 'email' | 'phone';
  value: string;
  category: number; // Thai threat category ID
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: 'NCSA' | 'ThaiCERT' | 'LOCAL';
  lastSeen: Date;
  description?: string;
}

export interface ThaiThreatAnalysis {
  threatCategory: ThaiThreatCategory | null;
  iocMatches: ThreatIOC[];
  riskScore: number;
  educationalTips: string[];
  elderlyWarnings: string[];
  unknownThreatResult?: UnknownThreatResult;
}

export class ThaiThreatIntelligenceService {
  private readonly thaiThreatCategories: ThaiThreatCategory[] = [
    {
      id: 1,
      nameEn: "Financial/Banking Fraud",
      nameTh: "การฉ้อโกงทางการเงิน/ธนาคาร",
      description: "การแอบอ้างเป็นธนาคารหรือสถาบันการเงินเพื่อขโมยข้อมูลหรือเงิน",
      severity: "CRITICAL",
      educationalContent: [
        "ธนาคารจริงไม่เคยขอรหัสผ่านผ่าน SMS หรือ LINE",
        "ตรวจสอบเลขบัญชีผ่านแอปธนาคารหรือโทรสายด่วน",
        "ห้ามกรอกรหัสผ่านธนาคารในเว็บไซต์ที่ไม่แน่ใจ"
      ]
    },
    {
      id: 2,
      nameEn: "Romance/Relationship Scam",
      nameTh: "การหลอกลวงแบบหลอกรัก",
      description: "การสร้างความสัมพันธ์หลอกเพื่อขอเงินหรือข้อมูลส่วนตัว",
      severity: "HIGH",
      educationalContent: [
        "คนแปลกหน้าที่แสดงความรักเร็วเกินไปมักมีเจตนาไม่ดี",
        "อย่าส่งเงินให้คนที่ไม่เคยพบหน้า",
        "ระวังคนที่ขอเงินเพื่อ 'เหตุฉุกเฉิน' หรือ 'ค่าเดินทาง'"
      ]
    },
    {
      id: 3,
      nameEn: "Investment/Trading Fraud", 
      nameTh: "การหลอกลงทุน/เทรดดิ้ง",
      description: "การชักชวนลงทุนในผลิตภัณฑ์หรือแพลตฟอร์มปลอม",
      severity: "HIGH",
      educationalContent: [
        "การลงทุนที่รับประกันผลตอบแทนสูงแน่นอนมักเป็นการหลอกลวง",
        "ตรวจสอบใบอนุญาตของบริษัทลงทุนกับ ก.ล.ต.",
        "อย่าลงทุนเงินที่คุณไม่สามารถเสียได้"
      ]
    },
    {
      id: 4,
      nameEn: "Online Gambling/Casino",
      nameTh: "การพนันออนไลน์",
      description: "เว็บไซต์การพนันที่ผิดกฎหมายในประเทศไทย",
      severity: "MEDIUM",
      educationalContent: [
        "การพนันออนไลน์ผิดกฎหมายในประเทศไทย",
        "เว็บพนันมักจะโกงเงินเดิมพันของผู้เล่น",
        "ระวังการให้เครดิตฟรีเพื่อล่อใจ"
      ]
    },
    {
      id: 5,
      nameEn: "E-commerce/Shopping Fraud",
      nameTh: "การฉ้อโกงการซื้อขายออนไลน์",
      description: "ร้านค้าออนไลน์ปลอมหรือสินค้าไม่ตรงตามคำโฆษณา",
      severity: "MEDIUM",
      educationalContent: [
        "ตรวจสอบรีวิวและประวัติของร้านค้าก่อนซื้อ",
        "ใช้ระบบชำระเงินที่มีการคุ้มครองผู้ซื้อ",
        "ระวังสินค้าราคาถูกผิดปกติ"
      ]
    },
    {
      id: 6,
      nameEn: "Fake Delivery/Shipping",
      nameTh: "การแจ้งจัดส่งสินค้าปลอม",
      description: "การแอบอ้างเป็นบริษัทขนส่งเพื่อขอข้อมูลหรือเงิน",
      severity: "MEDIUM",
      educationalContent: [
        "บริษัทขนส่งจริงไม่เรียกเก็บค่าธรรมเนียมเพิ่มผ่าน SMS",
        "ตรวจสอบสถานะพัสดุผ่านเว็บไซต์หรือแอปอย่างเป็นทางการ",
        "ระวังลิงก์ในข้อความ SMS ที่อ้างว่าเป็นบริษัทขนส่ง"
      ]
    },
    {
      id: 7,
      nameEn: "Government Impersonation",
      nameTh: "การแอบอ้างหน่วยงานราชการ",
      description: "การแอบอ้างเป็นเจ้าหน้าที่รัฐเพื่อขู่เข็ญหรือขอข้อมูล",
      severity: "HIGH",
      educationalContent: [
        "หน่วยงานราชการไม่ติดต่อขอข้อมูลผ่าน LINE หรือ SMS",
        "ตำรวจหรือเจ้าหน้าที่จริงจะแจ้งผ่านหนังสือราชการ",
        "โทรสอบถามหน่วยงานโดยตรงเมื่อมีข้อสงสัย"
      ]
    },
    {
      id: 8,
      nameEn: "Crypto/Digital Asset Fraud",
      nameTh: "การหลอกลวงเกี่ยวกับสกุลเงินดิจิทัล",
      description: "การหลอกลงทุนในเหรียญคริปโตหรือแพลตฟอร์มแลกเปลี่ยนปลอม",
      severity: "HIGH",
      educationalContent: [
        "ตรวจสอบใบอนุญาตของแพลตฟอร์มคริปโตกับ ก.ล.ต.",
        "ระวังการเสนอผลตอบแทนสูงจากเหรียญคริปโตใหม่",
        "อย่าส่ง Private Key หรือ Seed Phrase ให้ใคร"
      ]
    },
    {
      id: 9,
      nameEn: "Social Engineering/Phishing",
      nameTh: "การหลอกล่อทางจิตวิทยา",
      description: "การใช้เทคนิคทางจิตวิทยาเพื่อหลอกให้เผยข้อมูลสำคัญ",
      severity: "HIGH",
      educationalContent: [
        "ระวังการสร้างความเร่งด่วนหรือความกลัว",
        "ตรวจสอบตัวตนของผู้ติดต่อก่อนให้ข้อมูล",
        "อย่าดาวน์โหลดไฟล์หรือคลิกลิงก์จากคนแปลกหน้า"
      ]
    },
    {
      id: 10,
      nameEn: "Malware/Ransomware",
      nameTh: "ไวรัส/แรนซัมแวร์",
      description: "ซอฟต์แวร์ประสงค์ร้ายที่เข้ารหัสไฟล์หรือขโมยข้อมูล",
      severity: "CRITICAL",
      educationalContent: [
        "สำรองข้อมูลสำคัญเป็นประจำ",
        "อย่าดาวน์โหลดซอฟต์แวร์จากแหล่งที่ไม่น่าเชื่อถือ",
        "ใช้โปรแกรมป้องกันไวรัสที่ได้มาตรฐาน"
      ]
    }
  ];

  private readonly ncsaApiUrl = process.env.NCSA_API_URL || 'https://api.ncsa.or.th';
  private readonly thaicertApiUrl = process.env.THAICERT_API_URL || 'https://api.thaicert.or.th';
  private readonly apiKey = process.env.THAI_THREAT_API_KEY || '';
  private readonly unknownThreatDetector = new UnknownThreatDetectorService();

  // Local IOC database simulation (in production, this would be from MISP/database)
  private localIOCs: ThreatIOC[] = [
    {
      type: 'domain',
      value: 'fake-bank-thailand.com',
      category: 1,
      severity: 'CRITICAL',
      source: 'LOCAL',
      lastSeen: new Date(),
      description: 'Fake banking website impersonating Thai banks'
    },
    {
      type: 'phone',
      value: '+66812345678',
      category: 2,
      severity: 'HIGH',
      source: 'LOCAL',
      lastSeen: new Date(),
      description: 'Phone number used in romance scams'
    }
  ];

  async analyzeForThaiThreats(message: string): Promise<ThaiThreatAnalysis> {
    try {
      console.log('🇹🇭 Starting Thai Threat Intelligence analysis...');
      
      // ตรวจจับเบอร์และเว็บที่ไม่รู้จักก่อน
      const unknownThreatResult = await this.unknownThreatDetector.detectUnknownThreats(message);
      
      // Extract potential IOCs from message
      const extractedIOCs = this.extractIOCs(message);
      
      // Check against threat databases
      const [localMatches, remoteMatches] = await Promise.all([
        this.checkLocalIOCs(extractedIOCs),
        this.checkRemoteIOCs(extractedIOCs)
      ]);
      
      const allMatches = [...localMatches, ...remoteMatches];
      
      // Determine threat category based on content analysis
      const threatCategory = this.categorizeThreat(message, allMatches);
      
      // Calculate risk score
      // คำนวณ risk score (เพิ่มคะแนนสำหรับ unknown threats)
      let riskScore = this.calculateRiskScore(message, allMatches, threatCategory);
      
      // เพิ่มคะแนนสำหรับ unknown threats (เป็นสีส้ม HIGH)
      if (unknownThreatResult.isUnknownThreat) {
        riskScore += 30; // เพิ่มคะแนนให้เป็นระดับ HIGH
        console.log('🟠 Unknown threat detected, risk score increased to:', riskScore);
      }
      
      // Generate educational content
      const educationalTips = this.generateEducationalTips(threatCategory, allMatches);
      const elderlyWarnings = this.generateElderlyWarnings(threatCategory);
      
      console.log('🇹🇭 Thai threat analysis completed', {
        category: threatCategory?.nameTh,
        matches: allMatches.length,
        riskScore
      });
      
      return {
        threatCategory,
        iocMatches: allMatches,
        riskScore,
        educationalTips,
        elderlyWarnings,
        unknownThreatResult
      };
      
    } catch (error) {
      console.error('❌ Thai threat analysis failed:', error);
      
      // Fallback analysis
      return {
        threatCategory: null,
        iocMatches: [],
        riskScore: 0.3,
        educationalTips: ['ระวังข้อความที่ขอข้อมูลส่วนตัวหรือเงิน'],
        elderlyWarnings: ['ปรึกษาลูกหลานก่อนดำเนินการใดๆ'],
        unknownThreatResult: {
          isUnknownThreat: false,
          threatType: 'none',
          riskLevel: 'HIGH',
          phoneNumbers: [],
          websites: [],
          warnings: [],
          recommendations: []
        }
      };
    }
  }

  private extractIOCs(message: string): { type: string; value: string }[] {
    const iocs: { type: string; value: string }[] = [];
    
    // Extract URLs
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|\b[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}\b)/gi;
    const urls = message.match(urlRegex) || [];
    urls.forEach(url => iocs.push({ type: 'url', value: url }));
    
    // Extract Thai phone numbers using improved detector
    const phones = ThaiPhoneNumberDetector.extractPhoneNumbers(message);
    // Only add suspicious phone numbers to IOCs (not trusted ones)
    phones.forEach(phone => {
      if (!TrustedPhoneChecker.isTrustedNumber(phone)) {
        iocs.push({ type: 'phone', value: phone });
      }
    });
    
    // Extract email addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = message.match(emailRegex) || [];
    emails.forEach(email => iocs.push({ type: 'email', value: email }));
    
    return iocs;
  }

  private async checkLocalIOCs(extractedIOCs: { type: string; value: string }[]): Promise<ThreatIOC[]> {
    const matches: ThreatIOC[] = [];
    
    for (const extracted of extractedIOCs) {
      const match = this.localIOCs.find(ioc => 
        ioc.type === extracted.type && 
        ioc.value.toLowerCase() === extracted.value.toLowerCase()
      );
      
      if (match) {
        matches.push(match);
      }
    }
    
    return matches;
  }

  private async checkRemoteIOCs(extractedIOCs: { type: string; value: string }[]): Promise<ThreatIOC[]> {
    // In production, this would query NCSA MISP and ThaiCERT feeds
    // For now, return empty array as we don't have access to actual APIs
    console.log('📡 Would check NCSA/ThaiCERT APIs for:', extractedIOCs.length, 'IOCs');
    return [];
  }

  private categorizeThreat(message: string, matches: ThreatIOC[]): ThaiThreatCategory | null {
    const lowerMessage = message.toLowerCase();
    
    // Check IOC matches first
    if (matches.length > 0) {
      const highestSeverityMatch = matches.reduce((prev, current) => 
        this.getSeverityScore(current.severity) > this.getSeverityScore(prev.severity) ? current : prev
      );
      return this.thaiThreatCategories.find(cat => cat.id === highestSeverityMatch.category) || null;
    }
    
    // Content-based categorization using Thai keywords
    const bankKeywords = ['ธนาคาร', 'บัญชี', 'กสิกร', 'กรุงเทพ', 'กรุงไทย', 'ทหารไทย', 'ไทยพาณิชย์', 'กรุงศรี', 'ออมสิน'];
    const romanceKeywords = ['รัก', 'หวาน', 'คิดถึง', 'เหงา', 'โชคชะตา'];
    const investmentKeywords = ['ลงทุน', 'หุ้น', 'เทรด', 'กำไร', 'ผลตอบแทน', 'ได้เงินเร็ว'];
    const gamblingKeywords = ['เครดิตฟรี', 'ฟรีเครดิต', 'สล็อต', 'บาคาร่า', 'แตกง่าย', 'ถอนได้เลย'];
    const deliveryKeywords = ['พัสดุ', 'ขนส่ง', 'DHL', 'Kerry', 'Flash Express', 'จัดส่งไม่ได้'];
    const govKeywords = ['ตำรวจ', 'ไอบีเอ', 'ศาล', 'อัยการ', 'ราชการ', 'ปปง'];
    const cryptoKeywords = ['บิทคอยน์', 'คริปโต', 'เหรียญดิจิทัล', 'blockchain'];
    
    if (bankKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return this.thaiThreatCategories.find(cat => cat.id === 1)!; // Financial/Banking
    }
    
    if (romanceKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return this.thaiThreatCategories.find(cat => cat.id === 2)!; // Romance Scam
    }
    
    if (investmentKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return this.thaiThreatCategories.find(cat => cat.id === 3)!; // Investment Fraud
    }
    
    if (gamblingKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return this.thaiThreatCategories.find(cat => cat.id === 4)!; // Online Gambling
    }
    
    if (deliveryKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return this.thaiThreatCategories.find(cat => cat.id === 6)!; // Fake Delivery
    }
    
    if (govKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return this.thaiThreatCategories.find(cat => cat.id === 7)!; // Government Impersonation
    }
    
    if (cryptoKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return this.thaiThreatCategories.find(cat => cat.id === 8)!; // Crypto Fraud
    }
    
    return null;
  }

  private calculateRiskScore(message: string, matches: ThreatIOC[], category: ThaiThreatCategory | null): number {
    let score = 0;
    
    // IOC matches contribute to risk
    matches.forEach(match => {
      switch (match.severity) {
        case 'CRITICAL': score += 0.4; break;
        case 'HIGH': score += 0.3; break;
        case 'MEDIUM': score += 0.2; break;
        case 'LOW': score += 0.1; break;
      }
    });
    
    // Category severity contributes to risk
    if (category) {
      switch (category.severity) {
        case 'CRITICAL': score += 0.3; break;
        case 'HIGH': score += 0.2; break;
        case 'MEDIUM': score += 0.1; break;
        case 'LOW': score += 0.05; break;
      }
    }
    
    // Additional risk factors
    const urgencyWords = ['ด่วน', 'รีบ', 'ทันที', 'หมดเขต', 'จำกัดเวลา'];
    if (urgencyWords.some(word => message.toLowerCase().includes(word))) {
      score += 0.1;
    }
    
    return Math.min(score, 1);
  }

  private generateEducationalTips(category: ThaiThreatCategory | null, matches: ThreatIOC[]): string[] {
    const tips: string[] = [];
    
    if (category) {
      tips.push(...category.educationalContent);
    }
    
    // Add general tips based on matches
    if (matches.some(m => m.type === 'url')) {
      tips.push('ตรวจสอบความน่าเชื่อถือของเว็บไซต์ก่อนกรอกข้อมูล');
    }
    
    if (matches.some(m => m.type === 'phone')) {
      tips.push('ระวังการโทรหรือส่งข้อความจากเบอร์ที่ไม่รู้จัก');
    }
    
    // Add general cybersecurity tips
    tips.push('อย่าเผยข้อมูลส่วนตัวให้คนแปลกหน้า');
    tips.push('ตรวจสอบข้อมูลจากหลายแหล่งก่อนเชื่อ');
    
    return [...new Set(tips)]; // Remove duplicates
  }

  private generateElderlyWarnings(category: ThaiThreatCategory | null): string[] {
    const warnings: string[] = [
      '👨‍👩‍👧‍👦 ปรึกษาลูกหลานก่อนทำตามข้อความ',
      '📞 โทรหาคนในครอบครัวเมื่อไม่แน่ใจ',
      '⏰ อย่าตัดสินใจรีบร้อน แม้จะบอกว่าด่วน'
    ];
    
    if (category?.id === 1) { // Financial
      warnings.push('🏦 ไปธนาคารด้วยตัวเองแทนการทำผ่านออนไลน์');
    }
    
    if (category?.id === 2) { // Romance
      warnings.push('💕 คนที่ไม่เคยพบหน้าไม่ควรขอเงิน');
    }
    
    if (category?.id === 3) { // Investment
      warnings.push('💰 การลงทุนที่ดีไม่ต้องรีบตัดสินใจ');
    }
    
    return warnings;
  }

  private getSeverityScore(severity: string): number {
    switch (severity) {
      case 'CRITICAL': return 4;
      case 'HIGH': return 3;
      case 'MEDIUM': return 2;
      case 'LOW': return 1;
      default: return 0;
    }
  }

  // Public methods
  getThaiThreatCategories(): ThaiThreatCategory[] {
    return this.thaiThreatCategories;
  }

  getCategoryById(id: number): ThaiThreatCategory | undefined {
    return this.thaiThreatCategories.find(cat => cat.id === id);
  }

  async addLocalIOC(ioc: Omit<ThreatIOC, 'lastSeen'>): Promise<void> {
    this.localIOCs.push({
      ...ioc,
      lastSeen: new Date()
    });
    console.log('✅ Added new IOC to local database:', ioc.value);
  }

  async testConnection(): Promise<{ ncsa: boolean; thaicert: boolean }> {
    // In production, this would test actual NCSA and ThaiCERT API connections
    console.log('🧪 Testing Thai threat intelligence connections...');
    
    return {
      ncsa: false, // Would be true if NCSA API is accessible
      thaicert: false // Would be true if ThaiCERT API is accessible
    };
  }
}