/**
 * Elderly Threat Text Generator
 * สร้างข้อความภัยคุกคามที่เหมาะสมกับผู้สูงอายุ
 */

import { ThreatAnalysisResult } from './threatDetector';

export class ElderlyThreatTextGenerator {
  
  /**
   * สร้างข้อความสำหรับภัยคุกคามระดับวิกฤต
   */
  static getCriticalThreatText(analysis: ThreatAnalysisResult): string {
    const { threatType, thaiThreatCategory } = analysis;
    
    if (thaiThreatCategory) {
      switch (thaiThreatCategory.id) {
        case 1: // Financial/Banking Fraud
          return "อย่าให้ข้อมูลธนาคาร! นี่เป็นการหลอกลวง";
        case 2: // Romance Scam
          return "คนนี้หลอกรัก! อย่าส่งเงินให้";
        case 3: // Investment Fraud
          return "การลงทุนนี้เป็นการหลอกลวง! อย่าเสียเงิน";
        case 7: // Government Impersonation
          return "นี่ไม่ใช่เจ้าหน้าที่จริง! อย่าให้ข้อมูล";
        case 10: // Malware/Ransomware
          return "อย่าดาวน์โหลดไฟล์นี้! เป็นไวรัส";
        default:
          return "อันตราย! อย่าทำตามที่ข้อความนี้บอก";
      }
    }
    
    switch (threatType) {
      case 'PHISHING':
        return "นี่เป็นการหลอกลวง! อย่าคลิกลิงก์";
      case 'SCAM':
        return "นี่เป็นการโกง! อย่าส่งเงิน";
      case 'ROMANCE_SCAM':
        return "คนนี้หลอกรัก! อย่าให้เงิน";
      case 'INVESTMENT_FRAUD':
        return "การลงทุนนี้เป็นการหลอกลวง!";
      default:
        return "อันตราย! อย่าทำตามที่ข้อความนี้บอก";
    }
  }
  
  /**
   * สร้างข้อความสำหรับภัยคุกคามระดับสูง
   */
  static getHighThreatText(analysis: ThreatAnalysisResult): string {
    const { threatType, thaiThreatCategory } = analysis;
    
    if (thaiThreatCategory) {
      switch (thaiThreatCategory.id) {
        case 1: // Financial/Banking Fraud
          return "ข้อความนี้อาจเป็นการหลอกธนาคาร";
        case 2: // Romance Scam
          return "ระวังคนหลอกรัก";
        case 3: // Investment Fraud
          return "ระวังการลงทุนนี้";
        case 4: // Online Gambling
          return "ระวังการพนันออนไลน์";
        case 5: // E-commerce Fraud
          return "ระวังการซื้อขายออนไลน์";
        case 6: // Fake Delivery
          return "ระวังการแจ้งจัดส่งปลอม";
        case 7: // Government Impersonation
          return "ระวังการแอบอ้างเจ้าหน้าที่";
        case 8: // Crypto Fraud
          return "ระวังการลงทุนคริปโต";
        case 9: // Social Engineering
          return "ระวังการหลอกล่อ";
        default:
          return "ข้อความนี้มีความเสี่ยง";
      }
    }
    
    switch (threatType) {
      case 'PHISHING':
        return "ข้อความนี้อาจเป็นการหลอกลวง";
      case 'SCAM':
        return "ข้อความนี้อาจเป็นการโกง";
      case 'ROMANCE_SCAM':
        return "ระวังคนหลอกรัก";
      case 'INVESTMENT_FRAUD':
        return "ระวังการลงทุนนี้";
      default:
        return "ข้อความนี้มีความเสี่ยง";
    }
  }
  
  /**
   * สร้างข้อความสำหรับภัยคุกคามระดับกลาง
   */
  static getMediumThreatText(analysis: ThreatAnalysisResult): string {
    const { threatType, thaiThreatCategory } = analysis;
    
    if (thaiThreatCategory) {
      switch (thaiThreatCategory.id) {
        case 4: // Online Gambling
          return "ระวังการพนันออนไลน์";
        case 5: // E-commerce Fraud
          return "ระวังการซื้อขายออนไลน์";
        case 6: // Fake Delivery
          return "ระวังการแจ้งจัดส่งปลอม";
        default:
          return "ข้อความนี้มีบางอย่างที่ต้องระวัง";
      }
    }
    
    switch (threatType) {
      case 'SPAM':
        return "ข้อความนี้เป็นสแปม";
      case 'PHISHING':
        return "ข้อความนี้อาจเป็นการหลอกลวง";
      case 'SCAM':
        return "ข้อความนี้อาจเป็นการโกง";
      default:
        return "ข้อความนี้มีบางอย่างที่ต้องระวัง";
    }
  }
  
  /**
   * สร้างข้อความสำหรับข้อความปลอดภัย
   */
  static getSafetyMessageText(analysis: ThreatAnalysisResult): string {
    const { threatType, thaiThreatCategory } = analysis;
    
    if (thaiThreatCategory) {
      return `ข้อความนี้ดูปลอดภัย แต่ยังไงก็ระวังเสมอ`;
    }
    
    return "ข้อความนี้ดูปลอดภัย";
  }
  
  /**
   * สร้างการดำเนินการฉุกเฉินสำหรับภัยคุกคามระดับวิกฤต
   */
  static getCriticalUrgentActions(analysis: ThreatAnalysisResult): string[] {
    const { threatType, thaiThreatCategory } = analysis;
    
    if (thaiThreatCategory) {
      switch (thaiThreatCategory.id) {
        case 1: // Financial/Banking Fraud
          return [
            "อย่าให้ข้อมูลธนาคาร",
            "อย่าใส่รหัสผ่าน",
            "โทรธนาคารเช็คทันที"
          ];
        case 2: // Romance Scam
          return [
            "อย่าส่งเงิน",
            "อย่าให้ข้อมูลส่วนตัว",
            "บอกลูกหลานทันที"
          ];
        case 3: // Investment Fraud
          return [
            "อย่าลงทุน",
            "อย่าโอนเงิน",
            "ตรวจสอบกับ ก.ล.ต."
          ];
        case 7: // Government Impersonation
          return [
            "อย่าให้ข้อมูลส่วนตัว",
            "โทรสอบหน่วยงานจริง",
            "บอกลูกหลานทันที"
          ];
        case 10: // Malware/Ransomware
          return [
            "อย่าดาวน์โหลดไฟล์",
            "อย่าคลิกลิงก์",
            "ปิดข้อความทันที"
          ];
        default:
          return [
            "อย่าทำตามที่ข้อความบอก",
            "บอกลูกหลานทันที",
            "ขอความช่วยเหลือ"
          ];
      }
    }
    
    switch (threatType) {
      case 'PHISHING':
        return [
          "อย่าคลิกลิงก์",
          "อย่าให้ข้อมูลส่วนตัว",
          "บอกลูกหลานทันที"
        ];
      case 'SCAM':
        return [
          "อย่าส่งเงิน",
          "อย่าให้ข้อมูลส่วนตัว",
          "บอกลูกหลานทันที"
        ];
      case 'ROMANCE_SCAM':
        return [
          "อย่าส่งเงิน",
          "อย่าให้ข้อมูลส่วนตัว",
          "บอกลูกหลานทันที"
        ];
      case 'INVESTMENT_FRAUD':
        return [
          "อย่าลงทุน",
          "อย่าโอนเงิน",
          "ปรึกษาลูกหลาน"
        ];
      default:
        return [
          "อย่าทำตามที่ข้อความบอก",
          "บอกลูกหลานทันที",
          "ขอความช่วยเหลือ"
        ];
    }
  }
}