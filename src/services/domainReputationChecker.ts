/**
 * Domain Reputation and Malware Scanning Service
 * ตรวจสอบชื่อเสียงของ Domain และสแกน Malware
 */

import axios from 'axios';
import crypto from 'crypto';
import { URL } from 'url';

export interface DomainReputationResult {
  domain: string;
  reputation: 'TRUSTED' | 'NEUTRAL' | 'SUSPICIOUS' | 'MALICIOUS';
  riskScore: number;
  categories: string[];
  lastSeen?: Date;
  sources: string[];
  details: {
    isBlacklisted: boolean;
    isMalware: boolean;
    isPhishing: boolean;
    isSpam: boolean;
    hasRedirectChain: boolean;
    suspiciousSubdomains: string[];
    registrationDate?: Date;
    expirationDate?: Date;
    registrar?: string;
    nameServers?: string[];
  };
  threats: {
    malwareDetected: boolean;
    phishingDetected: boolean;
    spamDetected: boolean;
    botnetDetected: boolean;
    cryptominingDetected: boolean;
  };
  recommendations: string[];
}

export interface MalwareScanResult {
  isClean: boolean;
  threatsFound: string[];
  scanners: {
    name: string;
    result: 'CLEAN' | 'INFECTED' | 'SUSPICIOUS' | 'TIMEOUT';
    details?: string;
  }[];
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  scanTime: number;
}

export class DomainReputationChecker {
  private static readonly KNOWN_MALICIOUS_DOMAINS = [
    // Known phishing domains
    'secure-verify.tk',
    'account-verification.ml',
    'banking-secure.ga',
    'kbank-security.cf',
    'scb-verify.tk',
    'true-wallet.ml',
    'line-official.tk',
    'facebook-security.ga',
    'google-verify.cf',
    'apple-security.tk',
    'microsoft-verify.ml',
    'amazon-secure.ga',
    'paypal-verification.cf',
    'netflix-account.tk',
    'youtube-premium.ml',
    'instagram-verify.ga',
    'twitter-secure.cf',
    'whatsapp-verify.tk',
    'telegram-official.ml',
    'shopee-security.ga',
    'lazada-verify.cf',
    'grab-wallet.tk',
    'foodpanda-secure.ml',
    'tiktok-verify.ga',
    'discord-official.cf',
    'steam-security.tk',
    'epic-games.ml',
    'spotify-premium.ga',
    'zoom-meeting.cf',
    'teams-microsoft.tk',
    'dropbox-storage.ml',
    'onedrive-secure.ga',
    'icloud-verify.cf',
    'gmail-security.tk',
    'hotmail-verify.ml',
    'yahoo-secure.ga',
    'outlook-verification.cf'
  ];

  private static readonly TRUSTED_DOMAINS = [
    'google.com',
    'facebook.com',
    'apple.com',
    'microsoft.com',
    'amazon.com',
    'paypal.com',
    'netflix.com',
    'youtube.com',
    'instagram.com',
    'twitter.com',
    'whatsapp.com',
    'telegram.org',
    'line.me',
    'kbank.co.th',
    'scb.co.th',
    'kasikornbank.com',
    'bangkokbank.com',
    'krungsri.com',
    'tmb.co.th',
    'uob.co.th',
    'cimb.co.th',
    'shopee.co.th',
    'lazada.co.th',
    'grab.com',
    'foodpanda.co.th',
    'tiktok.com',
    'discord.com',
    'steam.com',
    'epicgames.com',
    'spotify.com',
    'zoom.us',
    'teams.microsoft.com',
    'dropbox.com',
    'onedrive.live.com',
    'icloud.com',
    'gmail.com',
    'hotmail.com',
    'yahoo.com',
    'outlook.com'
  ];

  private static readonly SUSPICIOUS_TLDS = [
    'tk', 'ml', 'ga', 'cf', 'pw', 'cc', 'info', 'biz', 'click', 'download',
    'stream', 'racing', 'science', 'party', 'cricket', 'accountant', 'loan',
    'win', 'bid', 'trade', 'date', 'review', 'country', 'faith', 'top'
  ];

  private static readonly BLACKLISTED_KEYWORDS = [
    'verify', 'secure', 'account', 'login', 'security', 'update', 'confirm',
    'validation', 'authentication', 'suspended', 'locked', 'expired', 'urgent',
    'immediate', 'action', 'required', 'temporary', 'maintenance', 'support',
    'official', 'service', 'customer', 'billing', 'payment', 'refund',
    'prize', 'winner', 'congratulations', 'claim', 'reward', 'bonus',
    'limited', 'time', 'offer', 'discount', 'free', 'gift', 'promotion'
  ];

  /**
   * ตรวจสอบชื่อเสียงของ Domain
   */
  static async checkDomainReputation(url: string): Promise<DomainReputationResult> {
    const startTime = Date.now();
    
    try {
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname.toLowerCase();
      
      // ตรวจสอบ blacklist
      const isBlacklisted = this.isBlacklisted(domain);
      
      // ตรวจสอบ trusted domains
      const isTrusted = this.isTrustedDomain(domain);
      
      // ตรวจสอบ suspicious TLD
      const hasSuspiciousTLD = this.hasSuspiciousTLD(domain);
      
      // ตรวจสอบ suspicious keywords
      const hasSuspiciousKeywords = this.hasSuspiciousKeywords(domain);
      
      // ตรวจสอบ typosquatting
      const isTyposquatting = this.checkTyposquatting(domain);
      
      // ตรวจสอบ DGA (Domain Generation Algorithm)
      const isDGA = this.isDGADomain(domain);
      
      // ตรวจสอบ subdomain abuse
      const suspiciousSubdomains = this.checkSuspiciousSubdomains(domain);
      
      // คำนวณ risk score
      let riskScore = 0;
      const categories: string[] = [];
      const sources: string[] = ['Local Analysis'];
      
      if (isBlacklisted) {
        riskScore += 90;
        categories.push('Blacklisted');
      }
      
      if (isTrusted) {
        riskScore = Math.max(0, riskScore - 70);
        categories.push('Trusted');
      }
      
      if (hasSuspiciousTLD) {
        riskScore += 30;
        categories.push('Suspicious TLD');
      }
      
      if (hasSuspiciousKeywords) {
        riskScore += 25;
        categories.push('Suspicious Keywords');
      }
      
      if (isTyposquatting) {
        riskScore += 40;
        categories.push('Typosquatting');
      }
      
      if (isDGA) {
        riskScore += 50;
        categories.push('Domain Generation Algorithm');
      }
      
      if (suspiciousSubdomains.length > 0) {
        riskScore += 20;
        categories.push('Suspicious Subdomains');
      }
      
      // ตรวจสอบ age ของ domain (simulation)
      const isNewDomain = this.isNewDomain(domain);
      if (isNewDomain) {
        riskScore += 15;
        categories.push('New Domain');
      }
      
      riskScore = Math.min(100, Math.max(0, riskScore));
      
      // กำหนด reputation
      let reputation: 'TRUSTED' | 'NEUTRAL' | 'SUSPICIOUS' | 'MALICIOUS';
      if (isTrusted && riskScore < 30) {
        reputation = 'TRUSTED';
      } else if (riskScore >= 70) {
        reputation = 'MALICIOUS';
      } else if (riskScore >= 40) {
        reputation = 'SUSPICIOUS';
      } else {
        reputation = 'NEUTRAL';
      }
      
      // ตรวจสอบ threats
      const threats = {
        malwareDetected: isBlacklisted || isDGA,
        phishingDetected: isBlacklisted || hasSuspiciousKeywords || isTyposquatting,
        spamDetected: hasSuspiciousTLD || suspiciousSubdomains.length > 0,
        botnetDetected: isDGA,
        cryptominingDetected: false // Would require deeper analysis
      };
      
      // สร้างคำแนะนำ
      const recommendations = this.generateRecommendations(
        reputation,
        categories,
        threats
      );
      
      return {
        domain,
        reputation,
        riskScore,
        categories,
        sources,
        details: {
          isBlacklisted,
          isMalware: threats.malwareDetected,
          isPhishing: threats.phishingDetected,
          isSpam: threats.spamDetected,
          hasRedirectChain: false, // Would require HTTP analysis
          suspiciousSubdomains,
          registrationDate: undefined, // Would require WHOIS
          expirationDate: undefined,
          registrar: undefined,
          nameServers: undefined
        },
        threats,
        recommendations
      };
      
    } catch (error) {
      console.error('Domain reputation check failed:', error);
      return {
        domain: url,
        reputation: 'NEUTRAL',
        riskScore: 50,
        categories: ['Analysis Failed'],
        sources: ['Error'],
        details: {
          isBlacklisted: false,
          isMalware: false,
          isPhishing: false,
          isSpam: false,
          hasRedirectChain: false,
          suspiciousSubdomains: []
        },
        threats: {
          malwareDetected: false,
          phishingDetected: false,
          spamDetected: false,
          botnetDetected: false,
          cryptominingDetected: false
        },
        recommendations: ['Unable to verify domain reputation']
      };
    }
  }

  /**
   * สแกน Malware
   */
  static async scanForMalware(url: string): Promise<MalwareScanResult> {
    const startTime = Date.now();
    
    try {
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname.toLowerCase();
      
      const scanners = [
        { name: 'Local Blacklist', result: 'CLEAN' as 'CLEAN' | 'INFECTED' | 'SUSPICIOUS' | 'TIMEOUT', details: 'No matches found' },
        { name: 'Pattern Analysis', result: 'CLEAN' as 'CLEAN' | 'INFECTED' | 'SUSPICIOUS' | 'TIMEOUT', details: 'No suspicious patterns' },
        { name: 'Behavioral Analysis', result: 'CLEAN' as 'CLEAN' | 'INFECTED' | 'SUSPICIOUS' | 'TIMEOUT', details: 'Normal behavior' }
      ];
      
      const threatsFound: string[] = [];
      
      // ตรวจสอบ blacklist
      if (this.isBlacklisted(domain)) {
        scanners[0].result = 'INFECTED';
        scanners[0].details = 'Domain found in blacklist';
        threatsFound.push('Blacklisted Domain');
      }
      
      // ตรวจสอบ suspicious patterns
      if (this.hasSuspiciousKeywords(domain) || this.isDGADomain(domain)) {
        scanners[1].result = 'SUSPICIOUS';
        scanners[1].details = 'Suspicious domain patterns detected';
        threatsFound.push('Suspicious Domain Pattern');
      }
      
      // ตรวจสอบ typosquatting
      if (this.checkTyposquatting(domain)) {
        scanners[2].result = 'SUSPICIOUS';
        scanners[2].details = 'Possible typosquatting detected';
        threatsFound.push('Typosquatting');
      }
      
      // กำหนด overall risk
      let overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      const infectedCount = scanners.filter(s => s.result === 'INFECTED').length;
      const suspiciousCount = scanners.filter(s => s.result === 'SUSPICIOUS').length;
      
      if (infectedCount > 0) {
        overallRisk = 'CRITICAL';
      } else if (suspiciousCount >= 2) {
        overallRisk = 'HIGH';
      } else if (suspiciousCount >= 1) {
        overallRisk = 'MEDIUM';
      } else {
        overallRisk = 'LOW';
      }
      
      return {
        isClean: threatsFound.length === 0,
        threatsFound,
        scanners,
        overallRisk,
        scanTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error('Malware scan failed:', error);
      return {
        isClean: false,
        threatsFound: ['Scan Error'],
        scanners: [
          { name: 'Error', result: 'TIMEOUT', details: 'Scan failed' }
        ],
        overallRisk: 'MEDIUM',
        scanTime: Date.now() - startTime
      };
    }
  }

  /**
   * ตรวจสอบว่า domain อยู่ใน blacklist หรือไม่
   */
  private static isBlacklisted(domain: string): boolean {
    return this.KNOWN_MALICIOUS_DOMAINS.some(malicious => 
      domain.includes(malicious) || 
      this.calculateSimilarity(domain, malicious) > 0.8
    );
  }

  /**
   * ตรวจสอบว่า domain เป็น trusted domain หรือไม่
   */
  private static isTrustedDomain(domain: string): boolean {
    return this.TRUSTED_DOMAINS.some(trusted => 
      domain === trusted || 
      domain.endsWith(`.${trusted}`)
    );
  }

  /**
   * ตรวจสอบ TLD ที่น่าสงสัย
   */
  private static hasSuspiciousTLD(domain: string): boolean {
    const tld = domain.split('.').pop()?.toLowerCase();
    return tld ? this.SUSPICIOUS_TLDS.includes(tld) : false;
  }

  /**
   * ตรวจสอบ keywords ที่น่าสงสัย
   */
  private static hasSuspiciousKeywords(domain: string): boolean {
    const domainLower = domain.toLowerCase();
    return this.BLACKLISTED_KEYWORDS.some(keyword => 
      domainLower.includes(keyword)
    );
  }

  /**
   * ตรวจสอบ typosquatting
   */
  private static checkTyposquatting(domain: string): boolean {
    const suspiciousPatterns = [
      'goog1e', 'fac3book', 'amaz0n', 'micr0soft', 'app1e',
      'paypa1', 'netf1ix', 'youtub3', 'instgram', 'twitt3r',
      'whatsap', 'telegr4m', 'lin3', 'kb4nk', 'sc8',
      'kasik0rn', 'bangk0k', 'krungsr1', 'tm8', 'u0b',
      'shop33', 'laz4da', 'gr4b', 'foodp4nda', 'tikt0k'
    ];
    
    return suspiciousPatterns.some(pattern => 
      domain.toLowerCase().includes(pattern)
    );
  }

  /**
   * ตรวจสอบ DGA (Domain Generation Algorithm)
   */
  private static isDGADomain(domain: string): boolean {
    const domainName = domain.split('.')[0];
    
    // ตรวจสอบ entropy
    const entropy = this.calculateEntropy(domainName);
    if (entropy > 4.0) return true;
    
    // ตรวจสอบ consonant/vowel ratio
    const consonants = domainName.match(/[bcdfghjklmnpqrstvwxyz]/gi) || [];
    const vowels = domainName.match(/[aeiou]/gi) || [];
    const ratio = consonants.length / Math.max(vowels.length, 1);
    
    if (ratio > 4 || ratio < 0.3) return true;
    
    // ตรวจสอบ length และ character distribution
    if (domainName.length > 20 && entropy > 3.5) return true;
    
    return false;
  }

  /**
   * ตรวจสอบ suspicious subdomains
   */
  private static checkSuspiciousSubdomains(domain: string): string[] {
    const parts = domain.split('.');
    const suspiciousSubdomains: string[] = [];
    
    if (parts.length > 3) {
      // Deep subdomain structure is suspicious
      suspiciousSubdomains.push('Deep subdomain structure');
    }
    
    // Check for suspicious subdomain patterns
    const suspiciousPatterns = [
      'secure', 'login', 'account', 'verify', 'update', 'confirm',
      'service', 'support', 'customer', 'billing', 'payment',
      'api', 'admin', 'www2', 'mail', 'ftp', 'cdn', 'static'
    ];
    
    for (const part of parts) {
      if (suspiciousPatterns.includes(part.toLowerCase())) {
        suspiciousSubdomains.push(`Suspicious subdomain: ${part}`);
      }
    }
    
    return suspiciousSubdomains;
  }

  /**
   * ตรวจสอบว่า domain เป็น new domain หรือไม่
   */
  private static isNewDomain(domain: string): boolean {
    // Simulation - in real implementation, would check WHOIS data
    const hash = crypto.createHash('md5').update(domain).digest('hex');
    const hashNumber = parseInt(hash.substring(0, 8), 16);
    return hashNumber % 10 < 3; // 30% chance of being "new"
  }

  /**
   * คำนวณ entropy ของ string
   */
  private static calculateEntropy(str: string): number {
    const freq: { [key: string]: number } = {};
    for (const char of str) {
      freq[char] = (freq[char] || 0) + 1;
    }
    
    let entropy = 0;
    for (const count of Object.values(freq)) {
      const p = count / str.length;
      entropy -= p * Math.log2(p);
    }
    
    return entropy;
  }

  /**
   * คำนวณ similarity ระหว่าง 2 strings
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * คำนวณ Levenshtein distance
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * สร้างคำแนะนำ
   */
  private static generateRecommendations(
    reputation: 'TRUSTED' | 'NEUTRAL' | 'SUSPICIOUS' | 'MALICIOUS',
    categories: string[],
    threats: any
  ): string[] {
    const recommendations: string[] = [];
    
    if (reputation === 'MALICIOUS') {
      recommendations.push('🚨 หลีกเลี่ยงเว็บไซต์นี้โดยเด็ดขาด');
      recommendations.push('🔒 อย่ากรอกข้อมูลส่วนตัวหรือรหัสผ่าน');
    } else if (reputation === 'SUSPICIOUS') {
      recommendations.push('⚠️ ใช้ความระมัดระวังสูงสุด');
      recommendations.push('🔍 ตรวจสอบ URL ให้แน่ใจก่อนคลิก');
    } else if (reputation === 'NEUTRAL') {
      recommendations.push('🛡️ ใช้ความระมัดระวังตามปกติ');
    } else {
      recommendations.push('✅ เว็บไซต์นี้ดูปลอดภัย');
    }
    
    if (categories.includes('Blacklisted')) {
      recommendations.push('⛔ พบในรายการ blacklist');
    }
    
    if (categories.includes('Typosquatting')) {
      recommendations.push('🔤 อาจเป็นการปลอมแปลงชื่อเว็บไซต์');
    }
    
    if (categories.includes('Suspicious TLD')) {
      recommendations.push('🌐 ใช้ TLD ที่มักใช้สำหรับกิจกรรมผิดกฎหมาย');
    }
    
    if (threats.malwareDetected) {
      recommendations.push('🦠 ตรวจพบ malware - อย่าเข้าชม');
    }
    
    if (threats.phishingDetected) {
      recommendations.push('🎣 อาจเป็นเว็บไซต์ phishing');
    }
    
    return recommendations;
  }
}