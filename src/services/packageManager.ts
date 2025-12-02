/**
 * Package Management System
 * จัดการระบบแพคเกจ 3 ระดับสำหรับ ProtectCyber
 */

export interface PackageFeatures {
  // Core Features
  basicThreatDetection: boolean;
  aiAnalysis: boolean;
  elderlySupport: boolean;
  
  // Advanced Features
  realTimeMonitoring: boolean;
  familyLink: boolean;
  sosButton: boolean;
  weeklyReport: boolean;
  
  // Enterprise Features
  adminDashboard: boolean;
  whiteLabel: boolean;
  enterpriseAPI: boolean;
  technicalSupport: boolean;
  
  // Limits
  monthlyChecks: number;
  familyMembers: number;
  apiCalls: number;
  
  // Additional Services
  customTraining: boolean;
  dedicatedSupport: boolean;
  onPremise: boolean;
}

export interface PackageConfig {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  priceUnit: string;
  target: string;
  features: PackageFeatures;
  description: string[];
  limitations: string[];
  benefits: string[];
}

export enum PackageType {
  FREE = 'free',
  FAMILY = 'family', 
  ENTERPRISE = 'enterprise'
}

export class PackageManager {
  private packages: Record<PackageType, PackageConfig> = {
    [PackageType.FREE]: {
      id: 'free',
      name: 'เกราะพื้นฐาน',
      nameEn: 'Basic Plan',
      price: 0,
      priceUnit: 'ฟรี',
      target: 'สร้างงานผู้ใช้รวมรวมข้อมูล',
      features: {
        basicThreatDetection: true,
        aiAnalysis: true,
        elderlySupport: true,
        realTimeMonitoring: false,
        familyLink: false,
        sosButton: false,
        weeklyReport: false,
        adminDashboard: false,
        whiteLabel: false,
        enterpriseAPI: false,
        technicalSupport: false,
        monthlyChecks: 50,
        familyMembers: 1,
        apiCalls: 100,
        customTraining: false,
        dedicatedSupport: false,
        onPremise: false
      },
      description: [
        'ส่งข้อความให้ LINE OA ตรวจสอบด้วยตนเอง',
        'รับบริการและเกร็ดความรู้ความปลอดภัยทั่วไป'
      ],
      limitations: [
        'ตรวจสอบได้ 50 ข้อความ/เดือน',
        'ไม่มีระบบแจ้งเตือนอัตโนมัติ',
        'ไม่มีการเชื่อมต่อครอบครัว'
      ],
      benefits: [
        'ใช้งานฟรีตลอดไป',
        'เหมาะกับผู้ใช้ทั่วไป',
        'ตรวจสอบพื้นฐาน'
      ]
    },
    
    [PackageType.FAMILY]: {
      id: 'family',
      name: 'เกราะอุ่นใจ',
      nameEn: 'Family Plan',
      price: 79,
      priceUnit: 'บ./เดือน หรือ 799 บ./ปี (ประหยัด 15%)',
      target: 'ครอบครัว Sandwich Generation',
      features: {
        basicThreatDetection: true,
        aiAnalysis: true,
        elderlySupport: true,
        realTimeMonitoring: true,
        familyLink: true,
        sosButton: true,
        weeklyReport: true,
        adminDashboard: false,
        whiteLabel: false,
        enterpriseAPI: false,
        technicalSupport: false,
        monthlyChecks: 500,
        familyMembers: 5,
        apiCalls: 1000,
        customTraining: false,
        dedicatedSupport: false,
        onPremise: false
      },
      description: [
        'AI เรียนใหม่ แจ้งเตือนอัตโนมัติ 24/7',
        'AI Tutor หลักสูตรส่วนบุคคล + Tips ทันสมัย',
        'Family Link เชื่อมลูกหลาน 3-5 คน',
        'SOS Button ขอความช่วยเหลือด่วน',
        'Weekly Risk Digest รายงานสรุป'
      ],
      limitations: [
        'ตรวจสอบได้ 500 ข้อความ/เดือน',
        'เชื่อมต่อได้ 5 คนในครอบครัว',
        'รายงานสรุปรายสัปดาห์'
      ],
      benefits: [
        'ป้องกันครอบครัวทั้งหมด',
        'แจ้งเตือนอัตโนมัติ',
        'ระบบ SOS ฉุกเฉิน',
        'รายงานความเสี่ยง'
      ]
    },
    
    [PackageType.ENTERPRISE]: {
      id: 'enterprise',
      name: 'เกราะองค์กร',
      nameEn: 'Enterprise Plan',
      price: 0,
      priceUnit: 'Custom Licensing (ตามจำนวน Users)',
      target: 'ธนาคาร/ประกัน/Telcos',
      features: {
        basicThreatDetection: true,
        aiAnalysis: true,
        elderlySupport: true,
        realTimeMonitoring: true,
        familyLink: true,
        sosButton: true,
        weeklyReport: true,
        adminDashboard: true,
        whiteLabel: true,
        enterpriseAPI: true,
        technicalSupport: true,
        monthlyChecks: -1, // Unlimited
        familyMembers: -1, // Unlimited
        apiCalls: -1, // Unlimited
        customTraining: true,
        dedicatedSupport: true,
        onPremise: true
      },
      description: [
        'White-label Integration ได้แบรนด์ตัวเอง',
        'Admin Dashboard สถิติภาพรวม (ไม่ระบุตัวตน)',
        'Enterprise API เชื่อมแอปองค์กร',
        '24/7 Technical Support'
      ],
      limitations: [
        'ต้องมีจำนวนผู้ใช้ขั้นต่ำ',
        'ราคาตามการใช้งาน',
        'ต้องทำสัญญาปี'
      ],
      benefits: [
        'ปรับแต่งตามองค์กร',
        'ไม่จำกัดการใช้งาน',
        'สนับสนุนเทคนิค 24/7',
        'API เชื่อมต่อระบบ'
      ]
    }
  };

  /**
   * ตรวจสอบแพคเกจของผู้ใช้
   */
  getUserPackage(userId: string): PackageType {
    // TODO: ตรวจสอบจากฐานข้อมูล
    // ตอนนี้ให้ Default เป็น FREE
    return PackageType.FREE;
  }

  /**
   * ตรวจสอบว่าสามารถใช้ฟีเจอร์ได้หรือไม่
   */
  canUseFeature(userId: string, feature: keyof PackageFeatures): boolean {
    const userPackage = this.getUserPackage(userId);
    const packageConfig = this.packages[userPackage];
    
    if (typeof packageConfig.features[feature] === 'boolean') {
      return packageConfig.features[feature] as boolean;
    }
    
    // สำหรับ limits (numbers)
    if (typeof packageConfig.features[feature] === 'number') {
      const limit = packageConfig.features[feature] as number;
      return limit === -1 || limit > 0; // -1 = unlimited
    }
    
    return false;
  }

  /**
   * ตรวจสอบ usage limit
   */
  checkUsageLimit(userId: string, limitType: 'monthlyChecks' | 'familyMembers' | 'apiCalls'): {
    canUse: boolean;
    current: number;
    limit: number;
    remaining: number;
  } {
    const userPackage = this.getUserPackage(userId);
    const packageConfig = this.packages[userPackage];
    const limit = packageConfig.features[limitType] as number;
    
    // TODO: ตรวจสอบการใช้งานจริงจากฐานข้อมูล
    const currentUsage = 0; // Mock data
    
    return {
      canUse: limit === -1 || currentUsage < limit,
      current: currentUsage,
      limit: limit,
      remaining: limit === -1 ? -1 : Math.max(0, limit - currentUsage)
    };
  }

  /**
   * อัพเกรดแพคเกจ
   */
  upgradePackage(userId: string, newPackage: PackageType): boolean {
    // TODO: บันทึกการอัพเกรดในฐานข้อมูล
    console.log(`User ${userId} upgraded to ${newPackage}`);
    return true;
  }

  /**
   * ดูข้อมูลแพคเกจ
   */
  getPackageInfo(packageType: PackageType): PackageConfig {
    return this.packages[packageType];
  }

  /**
   * ดูแพคเกจทั้งหมด
   */
  getAllPackages(): PackageConfig[] {
    return Object.values(this.packages);
  }

  /**
   * สร้างข้อความแสดงข้อมูลแพคเกจ
   */
  getPackageComparisonText(): string {
    const packages = this.getAllPackages();
    
    let text = '📦 เปรียบเทียบแพคเกจ ProtectCyber\n\n';
    
    packages.forEach((pkg, index) => {
      const icon = index === 0 ? '🆓' : index === 1 ? '👨‍👩‍👧‍👦' : '🏢';
      text += `${icon} **${pkg.name}** (${pkg.nameEn})\n`;
      text += `💰 ${pkg.priceUnit}\n`;
      text += `🎯 เป้าหมาย: ${pkg.target}\n\n`;
      
      text += '✨ ฟีเจอร์หลัก:\n';
      pkg.description.forEach(desc => {
        text += `• ${desc}\n`;
      });
      
      text += '\n📊 ข้อจำกัด:\n';
      pkg.limitations.forEach(limit => {
        text += `• ${limit}\n`;
      });
      
      text += '\n💡 ข้อดี:\n';
      pkg.benefits.forEach(benefit => {
        text += `• ${benefit}\n`;
      });
      
      text += '\n' + '─'.repeat(30) + '\n\n';
    });
    
    return text;
  }

  /**
   * ตรวจสอบว่าจำเป็นต้องอัพเกรดหรือไม่
   */
  needsUpgrade(userId: string, requiredFeature: keyof PackageFeatures): {
    needsUpgrade: boolean;
    currentPackage: PackageType;
    suggestedPackage: PackageType;
    reason: string;
  } {
    const currentPackage = this.getUserPackage(userId);
    const canUse = this.canUseFeature(userId, requiredFeature);
    
    if (canUse) {
      return {
        needsUpgrade: false,
        currentPackage,
        suggestedPackage: currentPackage,
        reason: 'ฟีเจอร์นี้ใช้งานได้ในแพคเกจปัจจุบัน'
      };
    }
    
    // หา package ที่เหมาะสม
    let suggestedPackage = PackageType.FAMILY;
    let reason = 'ต้องอัพเกรดเป็น Family Plan';
    
    if (requiredFeature === 'adminDashboard' || 
        requiredFeature === 'whiteLabel' || 
        requiredFeature === 'enterpriseAPI') {
      suggestedPackage = PackageType.ENTERPRISE;
      reason = 'ต้องอัพเกรดเป็น Enterprise Plan';
    }
    
    return {
      needsUpgrade: true,
      currentPackage,
      suggestedPackage,
      reason
    };
  }

  /**
   * สร้างข้อความแจ้งเตือนการอัพเกรด
   */
  createUpgradeMessage(userId: string, requiredFeature: keyof PackageFeatures): string {
    const upgradeInfo = this.needsUpgrade(userId, requiredFeature);
    
    if (!upgradeInfo.needsUpgrade) {
      return '';
    }
    
    const suggestedPackage = this.getPackageInfo(upgradeInfo.suggestedPackage);
    
    return `🔒 ฟีเจอร์นี้ต้องอัพเกรดแพคเกจ

📦 แพคเกจที่แนะนำ: ${suggestedPackage.name}
💰 ราคา: ${suggestedPackage.priceUnit}
🎯 เหมาะสำหรับ: ${suggestedPackage.target}

✨ ฟีเจอร์เพิ่มเติม:
${suggestedPackage.description.map(desc => `• ${desc}`).join('\n')}

💡 ข้อดี:
${suggestedPackage.benefits.map(benefit => `• ${benefit}`).join('\n')}

📞 ติดต่ออัพเกรด: โทร 02-XXX-XXXX`;
  }
}