/**
 * SSL Certificate and Security Headers Checker
 * ตรวจสอบความปลอดภัยของเว็บไซต์ รวมถึง SSL Certificate และ Security Headers
 */

import * as tls from 'tls';
import * as crypto from 'crypto';
import axios from 'axios';
import { URL } from 'url';

export interface SSLCertificateInfo {
  isValid: boolean;
  issuer: string;
  subject: string;
  validFrom: Date;
  validTo: Date;
  daysUntilExpiry: number;
  fingerprint: string;
  serialNumber: string;
  algorithm: string;
  keySize: number;
  isSelfSigned: boolean;
  isExpired: boolean;
  isRevoked?: boolean;
  warnings: string[];
}

export interface SecurityHeaders {
  hasHSTS: boolean;
  hasCSP: boolean;
  hasXFrameOptions: boolean;
  hasXContentTypeOptions: boolean;
  hasXXSSProtection: boolean;
  hasReferrerPolicy: boolean;
  hstsMaxAge?: number;
  cspPolicy?: string;
  securityScore: number;
  warnings: string[];
}

export interface DomainSecurity {
  domainAge: number;
  isNewDomain: boolean;
  isDGA: boolean; // Domain Generation Algorithm
  hasValidWhois: boolean;
  reputation: 'TRUSTED' | 'SUSPICIOUS' | 'MALICIOUS' | 'UNKNOWN';
  riskFactors: string[];
}

export interface SecurityAnalysisResult {
  url: string;
  isSecure: boolean;
  httpsSupported: boolean;
  sslInfo: SSLCertificateInfo | null;
  securityHeaders: SecurityHeaders;
  domainSecurity: DomainSecurity;
  overallRiskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendations: string[];
  processingTime: number;
}

export class SSLSecurityChecker {
  private static readonly TRUSTED_CAS = [
    'Let\'s Encrypt',
    'DigiCert',
    'GeoTrust',
    'Comodo',
    'Symantec',
    'GlobalSign',
    'Thawte',
    'VeriSign',
    'Entrust',
    'Sectigo'
  ];

  private static readonly SUSPICIOUS_DOMAINS = [
    'tk', 'ml', 'ga', 'cf', // Free TLDs
    'bit.ly', 'tinyurl.com', 'goo.gl', // URL shorteners
    'ngrok.io', 'ngrok.app', // Tunneling services
    'herokuapp.com', 'netlify.app' // Free hosting (context-dependent)
  ];

  /**
   * ตรวจสอบความปลอดภัยโดยรวมของเว็บไซต์
   */
  static async analyzeWebsiteSecurity(url: string): Promise<SecurityAnalysisResult> {
    const startTime = Date.now();
    
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;
      const isHttps = parsedUrl.protocol === 'https:';
      
      // ตรวจสอบ SSL Certificate
      const sslInfo = isHttps ? await this.checkSSLCertificate(hostname) : null;
      
      // ตรวจสอบ Security Headers
      const securityHeaders = await this.checkSecurityHeaders(url);
      
      // ตรวจสอบ Domain Security
      const domainSecurity = await this.checkDomainSecurity(hostname);
      
      // คำนวณ Risk Score
      const overallRiskScore = this.calculateOverallRiskScore(
        isHttps,
        sslInfo,
        securityHeaders,
        domainSecurity
      );
      
      // กำหนด Risk Level
      const riskLevel = this.determineRiskLevel(overallRiskScore);
      
      // สร้างคำแนะนำ
      const recommendations = this.generateRecommendations(
        isHttps,
        sslInfo,
        securityHeaders,
        domainSecurity
      );
      
      return {
        url,
        isSecure: isHttps && (sslInfo?.isValid || false),
        httpsSupported: isHttps,
        sslInfo,
        securityHeaders,
        domainSecurity,
        overallRiskScore,
        riskLevel,
        recommendations,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error('SSL Security analysis error:', error);
      return {
        url,
        isSecure: false,
        httpsSupported: false,
        sslInfo: null,
        securityHeaders: {
          hasHSTS: false,
          hasCSP: false,
          hasXFrameOptions: false,
          hasXContentTypeOptions: false,
          hasXXSSProtection: false,
          hasReferrerPolicy: false,
          securityScore: 0,
          warnings: ['Failed to analyze security headers']
        },
        domainSecurity: {
          domainAge: 0,
          isNewDomain: true,
          isDGA: false,
          hasValidWhois: false,
          reputation: 'UNKNOWN',
          riskFactors: ['Analysis failed']
        },
        overallRiskScore: 80,
        riskLevel: 'HIGH',
        recommendations: ['Unable to verify website security'],
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * ตรวจสอบ SSL Certificate
   */
  private static async checkSSLCertificate(hostname: string): Promise<SSLCertificateInfo> {
    return new Promise((resolve, reject) => {
      const options = {
        host: hostname,
        port: 443,
        servername: hostname,
        rejectUnauthorized: process.env.NODE_ENV === 'development' ? false : true
      };

      const socket = tls.connect(options, () => {
        const cert = socket.getPeerCertificate(true);
        
        if (!cert || Object.keys(cert).length === 0) {
          socket.destroy();
          return reject(new Error('No certificate found'));
        }

        const now = new Date();
        const validFrom = new Date(cert.valid_from);
        const validTo = new Date(cert.valid_to);
        const daysUntilExpiry = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        const warnings: string[] = [];
        
        // ตรวจสอบการหมดอายุ
        if (daysUntilExpiry < 30) {
          warnings.push(`Certificate expires in ${daysUntilExpiry} days`);
        }
        
        // ตรวจสอบ Self-signed
        const isSelfSigned = cert.issuer.CN === cert.subject.CN;
        if (isSelfSigned) {
          warnings.push('Self-signed certificate detected');
        }
        
        // ตรวจสอบ Trusted CA
        const isTrustedCA = this.TRUSTED_CAS.some(ca => 
          cert.issuer.O && cert.issuer.O.includes(ca)
        );
        if (!isTrustedCA) {
          warnings.push('Certificate not issued by trusted CA');
        }

        socket.destroy();
        
        resolve({
          isValid: now >= validFrom && now <= validTo && !isSelfSigned,
          issuer: cert.issuer.CN || 'Unknown',
          subject: cert.subject.CN || 'Unknown',
          validFrom,
          validTo,
          daysUntilExpiry,
          fingerprint: cert.fingerprint,
          serialNumber: cert.serialNumber,
          algorithm: (cert as any).signatureAlgorithm || 'Unknown',
          keySize: cert.bits || 0,
          isSelfSigned,
          isExpired: now > validTo,
          warnings
        });
      });

      socket.on('error', (error) => {
        reject(error);
      });
      
      socket.setTimeout(10000, () => {
        socket.destroy();
        reject(new Error('SSL connection timeout'));
      });
    });
  }

  /**
   * ตรวจสอบ Security Headers
   */
  private static async checkSecurityHeaders(url: string): Promise<SecurityHeaders> {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: () => true, // Accept all status codes
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SecurityChecker/1.0)'
        }
      });

      const headers = response.headers;
      const warnings: string[] = [];
      
      // ตรวจสอบ HSTS
      const hasHSTS = !!headers['strict-transport-security'];
      const hstsMaxAge = hasHSTS ? 
        parseInt(headers['strict-transport-security'].match(/max-age=(\d+)/)?.[1] || '0') : 0;
      
      if (hasHSTS && hstsMaxAge < 31536000) { // 1 year
        warnings.push('HSTS max-age is too short');
      }
      
      // ตรวจสอบ CSP
      const hasCSP = !!(headers['content-security-policy'] || headers['content-security-policy-report-only']);
      const cspPolicy = headers['content-security-policy'] || headers['content-security-policy-report-only'];
      
      // ตรวจสอบ Headers อื่นๆ
      const hasXFrameOptions = !!headers['x-frame-options'];
      const hasXContentTypeOptions = !!headers['x-content-type-options'];
      const hasXXSSProtection = !!headers['x-xss-protection'];
      const hasReferrerPolicy = !!headers['referrer-policy'];
      
      // คำนวณ Security Score
      let securityScore = 0;
      if (hasHSTS) securityScore += 20;
      if (hasCSP) securityScore += 25;
      if (hasXFrameOptions) securityScore += 15;
      if (hasXContentTypeOptions) securityScore += 15;
      if (hasXXSSProtection) securityScore += 10;
      if (hasReferrerPolicy) securityScore += 15;
      
      // เพิ่มคะแนนสำหรับ strong policies
      if (hstsMaxAge >= 31536000) securityScore += 5;
      if (cspPolicy && !cspPolicy.includes('unsafe-inline')) securityScore += 5;
      
      if (securityScore < 50) {
        warnings.push('Poor security headers configuration');
      }

      return {
        hasHSTS,
        hasCSP,
        hasXFrameOptions,
        hasXContentTypeOptions,
        hasXXSSProtection,
        hasReferrerPolicy,
        hstsMaxAge: hasHSTS ? hstsMaxAge : undefined,
        cspPolicy,
        securityScore,
        warnings
      };
      
    } catch (error) {
      return {
        hasHSTS: false,
        hasCSP: false,
        hasXFrameOptions: false,
        hasXContentTypeOptions: false,
        hasXXSSProtection: false,
        hasReferrerPolicy: false,
        securityScore: 0,
        warnings: ['Failed to analyze security headers']
      };
    }
  }

  /**
   * ตรวจสอบ Domain Security
   */
  private static async checkDomainSecurity(hostname: string): Promise<DomainSecurity> {
    const riskFactors: string[] = [];
    
    // ตรวจสอบ suspicious TLDs
    const tld = hostname.split('.').pop()?.toLowerCase();
    if (tld && this.SUSPICIOUS_DOMAINS.some(suspicious => hostname.includes(suspicious))) {
      riskFactors.push('Suspicious domain or TLD');
    }
    
    // ตรวจสอบ DGA (Domain Generation Algorithm)
    const isDGA = this.isDGADomain(hostname);
    if (isDGA) {
      riskFactors.push('Possible algorithmically generated domain');
    }
    
    // ตรวจสอบ domain length และ character patterns
    if (hostname.length > 50) {
      riskFactors.push('Unusually long domain name');
    }
    
    // ตรวจสอบ homograph attacks
    if (this.hasHomographAttack(hostname)) {
      riskFactors.push('Possible homograph attack');
    }
    
    // ตรวจสอบ subdomain abuse
    const subdomainCount = (hostname.match(/\./g) || []).length;
    if (subdomainCount > 3) {
      riskFactors.push('Deep subdomain structure');
    }
    
    // กำหนด reputation
    let reputation: 'TRUSTED' | 'SUSPICIOUS' | 'MALICIOUS' | 'UNKNOWN' = 'UNKNOWN';
    if (riskFactors.length === 0) {
      reputation = 'TRUSTED';
    } else if (riskFactors.length <= 2) {
      reputation = 'SUSPICIOUS';
    } else {
      reputation = 'MALICIOUS';
    }
    
    return {
      domainAge: 0, // Would require WHOIS lookup
      isNewDomain: false, // Would require WHOIS lookup
      isDGA,
      hasValidWhois: false, // Would require WHOIS lookup
      reputation,
      riskFactors
    };
  }

  /**
   * ตรวจสอบ Domain Generation Algorithm patterns
   */
  private static isDGADomain(hostname: string): boolean {
    const domain = hostname.split('.')[0];
    
    // ตรวจสอบ entropy
    const entropy = this.calculateEntropy(domain);
    if (entropy > 4.5) return true;
    
    // ตรวจสอบ consonant/vowel ratio
    const consonants = domain.match(/[bcdfghjklmnpqrstvwxyz]/gi) || [];
    const vowels = domain.match(/[aeiou]/gi) || [];
    const ratio = consonants.length / Math.max(vowels.length, 1);
    
    if (ratio > 5 || ratio < 0.5) return true;
    
    // ตรวจสอบ numeric characters
    const numericRatio = (domain.match(/[0-9]/g) || []).length / domain.length;
    if (numericRatio > 0.3) return true;
    
    return false;
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
   * ตรวจสอบ homograph attacks
   */
  private static hasHomographAttack(hostname: string): boolean {
    // ตรวจสอบ mixed scripts
    const hasLatin = /[a-zA-Z]/.test(hostname);
    const hasCyrillic = /[а-яё]/i.test(hostname);
    const hasGreek = /[α-ωΑ-Ω]/.test(hostname);
    
    const scriptCount = [hasLatin, hasCyrillic, hasGreek].filter(Boolean).length;
    return scriptCount > 1;
  }

  /**
   * คำนวณ Risk Score โดยรวม
   */
  private static calculateOverallRiskScore(
    isHttps: boolean,
    sslInfo: SSLCertificateInfo | null,
    securityHeaders: SecurityHeaders,
    domainSecurity: DomainSecurity
  ): number {
    let riskScore = 0;
    
    // HTTPS and SSL
    if (!isHttps) riskScore += 30;
    if (sslInfo && !sslInfo.isValid) riskScore += 25;
    if (sslInfo && sslInfo.isSelfSigned) riskScore += 20;
    if (sslInfo && sslInfo.isExpired) riskScore += 30;
    
    // Security Headers
    const headerScore = 100 - securityHeaders.securityScore;
    riskScore += headerScore * 0.2;
    
    // Domain Security
    switch (domainSecurity.reputation) {
      case 'MALICIOUS': riskScore += 40; break;
      case 'SUSPICIOUS': riskScore += 20; break;
      case 'UNKNOWN': riskScore += 10; break;
      default: break;
    }
    
    if (domainSecurity.isDGA) riskScore += 15;
    riskScore += domainSecurity.riskFactors.length * 5;
    
    return Math.min(100, Math.max(0, riskScore));
  }

  /**
   * กำหนด Risk Level
   */
  private static determineRiskLevel(riskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (riskScore >= 80) return 'CRITICAL';
    if (riskScore >= 60) return 'HIGH';
    if (riskScore >= 40) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * สร้างคำแนะนำ
   */
  private static generateRecommendations(
    isHttps: boolean,
    sslInfo: SSLCertificateInfo | null,
    securityHeaders: SecurityHeaders,
    domainSecurity: DomainSecurity
  ): string[] {
    const recommendations: string[] = [];
    
    if (!isHttps) {
      recommendations.push('⚠️ เว็บไซต์ไม่ใช้ HTTPS - ข้อมูลอาจถูกขโมยได้');
    }
    
    if (sslInfo && !sslInfo.isValid) {
      recommendations.push('🔒 SSL Certificate ไม่ถูกต้อง - อาจเป็นเว็บปลอม');
    }
    
    if (sslInfo && sslInfo.isSelfSigned) {
      recommendations.push('⚠️ ใช้ Self-signed certificate - ไม่ได้รับการยืนยันจากหน่วยงานที่เชื่อถือ');
    }
    
    if (securityHeaders.securityScore < 50) {
      recommendations.push('🛡️ การตั้งค่าความปลอดภัยไม่เพียงพอ');
    }
    
    if (domainSecurity.isDGA) {
      recommendations.push('🚨 Domain อาจถูกสร้างด้วยโปรแกรม - สงสัยเป็นมัลแวร์');
    }
    
    if (domainSecurity.reputation === 'MALICIOUS') {
      recommendations.push('🔴 Domain มีชื่อเสียงไม่ดี - แนะนำให้หลีกเลี่ยง');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ เว็บไซต์มีความปลอดภัยในระดับที่ยอมรับได้');
    }
    
    return recommendations;
  }
}