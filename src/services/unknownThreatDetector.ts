/**
 * Unknown Threat Detector Service
 * ตรวจจับเบอร์โทรทุกย่างและเว็บไซต์ที่ไม่รู้จัก
 */

import { ThaiPhoneNumberDetector } from '../utils/phoneNumberDetector';
import { TrustedPhoneChecker } from '../data/trustedPhoneNumbers';

export interface UnknownThreatResult {
  isUnknownThreat: boolean;
  threatType: 'unknown_phone' | 'unknown_website' | 'both' | 'none';
  riskLevel: 'HIGH'; // เป็นสีส้มหมด
  phoneNumbers: string[];
  websites: string[];
  warnings: string[];
  recommendations: string[];
}

export interface TrustedSource {
  phones: string[];
  websites: string[];
  domains: string[];
}

export class UnknownThreatDetectorService {
  
  // รายการเบอร์และเว็บที่เชื่อถือได้
  private trustedSources: TrustedSource = {
    phones: [
      // เบอร์ธนาคาร
      '1333', '1644', '1365', '1558', '1572', '1588', '1681', '1682', '1683', '1684', '1685', '1686', '1687', '1688', '1689',
      // เบอร์ฉุกเฉิน
      '191', '192', '193', '194', '195', '196', '197', '199', '1554', '1669', '1111', '1166', '1677', '1441', '1422',
      // เบอร์บริการรัฐ
      '1111', '1119', '1178', '1168', '1146', '1157', '1165', '1356', '1357', '1358', '1359', '1362', '1363', '1364',
      // เบอร์ค่าสาธารณูปโภค
      '1130', '1131', '1132', '1133', '1138', '1143', '1144', '1145', '1158', '1159', '1160', '1161', '1162', '1163',
      // เบอร์ที่อนุญาตให้ใช้งาน (ตัวอย่าง)
      '+66812345678', '0812345678', '02-123-4567'
    ],
    websites: [
      // เว็บธนาคาร
      'kbank.co.th', 'scb.co.th', 'bbl.co.th', 'kasikornbank.com', 'ktb.co.th', 'tmb.co.th', 'uob.co.th', 
      'cimbthai.com', 'lhbank.co.th', 'thanachartbank.co.th', 'tisco.co.th', 'icbc.co.th', 'standardchartered.co.th',
      // เว็บราชการ
      'go.th', 'mof.go.th', 'bot.or.th', 'sec.or.th', 'set.or.th', 'boi.go.th', 'customs.go.th', 'rd.go.th',
      'sso.go.th', 'dla.go.th', 'dlt.go.th', 'immigration.go.th', 'nbtc.go.th', 'etda.or.th', 'ncsa.or.th',
      // เว็บบริการสำคัญ
      'thailandpost.co.th', 'kerry.co.th', 'thaipbs.or.th', 'thairath.co.th', 'matichon.co.th', 'manager.co.th',
      'sanook.com', 'pantip.com', 'kapook.com', 'mthai.com', 'workpointtoday.com', 'tnn.co.th', 'thaipost.co.th',
      // เว็บอีคอมเมิร์ซ
      'shopee.co.th', 'lazada.co.th', 'jd.co.th', 'advice.co.th', 'powerbuy.co.th', 'central.co.th', 'bigc.co.th',
      // เว็บเทคโนโลยี
      'line.me', 'facebook.com', 'google.com', 'youtube.com', 'instagram.com', 'tiktok.com', 'twitter.com',
      'microsoft.com', 'apple.com', 'amazon.com', 'netflix.com', 'spotify.com', 'github.com', 'stackoverflow.com'
    ],
    domains: [
      // Top-level domains ที่เชื่อถือได้
      '.co.th', '.or.th', '.go.th', '.ac.th', '.in.th', '.mi.th', '.net.th',
      '.com', '.org', '.net', '.edu', '.gov', '.mil'
    ]
  };

  /**
   * ตรวจจับเบอร์โทรในข้อความ
   */
  private extractPhoneNumbers(text: string): string[] {
    // Use the improved phone number detector
    return ThaiPhoneNumberDetector.extractPhoneNumbers(text);
  }

  /**
   * ตรวจจับเว็บไซต์ในข้อความ
   */
  private extractWebsites(text: string): string[] {
    const urlPatterns = [
      // URL รูปแบบต่างๆ
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
      // Domain โดยไม่มี http
      /(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
      // IP Address
      /(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]{1,5})?/g
    ];

    const websites: string[] = [];
    
    urlPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        websites.push(...matches.map(match => {
          // Clean up URL
          let url = match.trim();
          if (!url.startsWith('http')) {
            url = 'https://' + url;
          }
          return url;
        }));
      }
    });

    return [...new Set(websites)]; // Remove duplicates
  }

  /**
   * ตรวจสอบว่าเบอร์โทรเป็นเบอร์ที่เชื่อถือได้หรือไม่
   */
  private isPhoneTrusted(phone: string): boolean {
    // Use the comprehensive trusted phone checker
    return TrustedPhoneChecker.isTrustedNumber(phone);
  }

  /**
   * ตรวจสอบว่าเว็บไซต์เป็นเว็บที่เชื่อถือได้หรือไม่
   */
  private isWebsiteTrusted(website: string): boolean {
    try {
      const url = new URL(website);
      const hostname = url.hostname.toLowerCase();
      
      // ตรวจสอบกับรายการเว็บที่เชื่อถือได้
      const isTrustedWebsite = this.trustedSources.websites.some(trustedSite => 
        hostname === trustedSite || hostname.endsWith('.' + trustedSite)
      );
      
      // ตรวจสอบกับ top-level domain ที่เชื่อถือได้
      const isTrustedDomain = this.trustedSources.domains.some(trustedDomain => 
        hostname.endsWith(trustedDomain)
      );
      
      return isTrustedWebsite || isTrustedDomain;
    } catch (error) {
      return false;
    }
  }

  /**
   * ตรวจจับภัยคุกคามที่ไม่รู้จัก
   */
  async detectUnknownThreats(text: string): Promise<UnknownThreatResult> {
    console.log('🔍 Detecting unknown threats in text:', text.substring(0, 100));
    
    const phoneNumbers = this.extractPhoneNumbers(text);
    const websites = this.extractWebsites(text);
    
    console.log('📱 Found phone numbers:', phoneNumbers);
    console.log('🌐 Found websites:', websites);
    
    // ตรวจสอบเบอร์โทรที่ไม่รู้จัก
    const unknownPhones = phoneNumbers.filter(phone => !this.isPhoneTrusted(phone));
    
    // ตรวจสอบเว็บไซต์ที่ไม่รู้จัก
    const unknownWebsites = websites.filter(website => !this.isWebsiteTrusted(website));
    
    console.log('⚠️ Unknown phones:', unknownPhones);
    console.log('⚠️ Unknown websites:', unknownWebsites);
    
    // กำหนดประเภทภัยคุกคาม
    let threatType: 'unknown_phone' | 'unknown_website' | 'both' | 'none' = 'none';
    
    if (unknownPhones.length > 0 && unknownWebsites.length > 0) {
      threatType = 'both';
    } else if (unknownPhones.length > 0) {
      threatType = 'unknown_phone';
    } else if (unknownWebsites.length > 0) {
      threatType = 'unknown_website';
    }
    
    const isUnknownThreat = unknownPhones.length > 0 || unknownWebsites.length > 0;
    
    // สร้างคำเตือนและคำแนะนำ
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    if (unknownPhones.length > 0) {
      warnings.push(`🚨 พบเบอร์โทรที่ไม่รู้จัก: ${unknownPhones.join(', ')}`);
      warnings.push('⚠️ ระวังเบอร์โทรที่ไม่คุ้นเคย อาจเป็นการหลอกลวง');
      
      recommendations.push('📞 ไม่ควรโทรกลับหรือรับสายจากเบอร์ที่ไม่รู้จัก');
      recommendations.push('🔍 ตรวจสอบเบอร์โทรกับผู้ให้บริการที่เกี่ยวข้อง');
      recommendations.push('📋 บันทึกเบอร์และรายงานหากพบการหลอกลวง');
    }
    
    if (unknownWebsites.length > 0) {
      warnings.push(`🚨 พบเว็บไซต์ที่ไม่รู้จัก: ${unknownWebsites.join(', ')}`);
      warnings.push('⚠️ ระวังเว็บไซต์ที่ไม่คุ้นเคย อาจเป็นการหลอกลวง');
      
      recommendations.push('🌐 ไม่ควรเข้าเว็บไซต์ที่ไม่รู้จักหรือไม่มีชื่อเสียง');
      recommendations.push('🔒 ตรวจสอบความปลอดภัยของเว็บไซต์ก่อนใช้งาน');
      recommendations.push('💳 ห้ามกรอกข้อมูลส่วนตัวหรือข้อมูลการเงิน');
    }
    
    return {
      isUnknownThreat,
      threatType,
      riskLevel: 'HIGH', // เป็นสีส้มหมด
      phoneNumbers: unknownPhones,
      websites: unknownWebsites,
      warnings,
      recommendations
    };
  }

  /**
   * เพิ่มเบอร์หรือเว็บที่เชื่อถือได้
   */
  addTrustedSource(type: 'phone' | 'website', value: string): void {
    if (type === 'phone') {
      this.trustedSources.phones.push(value);
    } else {
      this.trustedSources.websites.push(value);
    }
  }

  /**
   * ลบเบอร์หรือเว็บที่เชื่อถือได้
   */
  removeTrustedSource(type: 'phone' | 'website', value: string): void {
    if (type === 'phone') {
      this.trustedSources.phones = this.trustedSources.phones.filter(phone => phone !== value);
    } else {
      this.trustedSources.websites = this.trustedSources.websites.filter(website => website !== value);
    }
  }

  /**
   * ดูรายการเบอร์และเว็บที่เชื่อถือได้
   */
  getTrustedSources(): TrustedSource {
    return this.trustedSources;
  }
}