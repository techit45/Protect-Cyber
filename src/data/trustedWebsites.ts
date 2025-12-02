/**
 * ฐานข้อมูลเว็บไซต์ที่เชื่อถือได้
 * รายการเว็บไซต์ที่ปลอดภัยและเชื่อถือได้ในประเทศไทย
 */

export interface TrustedWebsite {
  domain: string;
  organization: string;
  type: 'government' | 'bank' | 'e-commerce' | 'news' | 'education' | 'healthcare' | 'utility' | 'social' | 'technology';
  category: string;
  description: string;
  isActive: boolean;
  alternativeDomains?: string[];
  lastVerified: string;
}

export const TRUSTED_WEBSITES: TrustedWebsite[] = [
  // === Government Websites ===
  {
    domain: 'go.th',
    organization: 'รัฐบาลไทย',
    type: 'government',
    category: 'ราชการ',
    description: 'เว็บไซต์ราชการไทย',
    isActive: true,
    alternativeDomains: ['*.go.th'],
    lastVerified: '2024-01-01'
  },
  {
    domain: 'mof.go.th',
    organization: 'กระทรวงการคลัง',
    type: 'government',
    category: 'ราชการ',
    description: 'กระทรวงการคลัง',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'bot.or.th',
    organization: 'ธนาคารแห่งประเทศไทย',
    type: 'government',
    category: 'ราชการ',
    description: 'ธนาคารแห่งประเทศไทย',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'sec.or.th',
    organization: 'สำนักงาน กลต.',
    type: 'government',
    category: 'ราชการ',
    description: 'สำนักงานคณะกรรมการกำกับหลักทรัพย์และตลาดหลักทรัพย์',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'set.or.th',
    organization: 'ตลาดหลักทรัพย์แห่งประเทศไทย',
    type: 'government',
    category: 'ราชการ',
    description: 'ตลาดหลักทรัพย์แห่งประเทศไทย',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'sso.go.th',
    organization: 'สำนักงานประกันสังคม',
    type: 'government',
    category: 'ราชการ',
    description: 'สำนักงานประกันสังคม',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'rd.go.th',
    organization: 'กรมสรรพากร',
    type: 'government',
    category: 'ราชการ',
    description: 'กรมสรรพากร',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'dlt.go.th',
    organization: 'กรมขนส่งทางบก',
    type: 'government',
    category: 'ราชการ',
    description: 'กรมขนส่งทางบก',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'immigration.go.th',
    organization: 'สำนักงานตรวจคนเข้าเมือง',
    type: 'government',
    category: 'ราชการ',
    description: 'สำนักงานตรวจคนเข้าเมือง',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'ncsa.or.th',
    organization: 'สำนักงานความมั่นคงปลอดภัยไサเบอร์แห่งชาติ',
    type: 'government',
    category: 'ราชการ',
    description: 'สำนักงานความมั่นคงปลอดภัยไสเบอร์แห่งชาติ',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'etda.or.th',
    organization: 'หน่วยงานพัฒนาธุรกรรมทางอิเล็กทรอนิกส์',
    type: 'government',
    category: 'ราชการ',
    description: 'หน่วยงานพัฒนาธุรกรรมทางอิเล็กทรอนิกส์',
    isActive: true,
    lastVerified: '2024-01-01'
  },

  // === Banks ===
  {
    domain: 'kbank.co.th',
    organization: 'ธนาคารกสิกรไทย',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารกสิกรไทย',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'scb.co.th',
    organization: 'ธนาคารไทยพาณิชย์',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารไทยพาณิชย์',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'bbl.co.th',
    organization: 'ธนาคารกรุงเทพ',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารกรุงเทพ',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'ktb.co.th',
    organization: 'ธนาคารกรุงไทย',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารกรุงไทย',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'tmb.co.th',
    organization: 'ธนาคารทหารไทย',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารทหารไทย',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'bay.co.th',
    organization: 'ธนาคารกรุงศรีอยุธยา',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารกรุงศรีอยุธยา',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'gsb.or.th',
    organization: 'ธนาคารออมสิน',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารออมสิน',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'tisco.co.th',
    organization: 'ธนาคารทิสโก้',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารทิสโก้',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'lhbank.co.th',
    organization: 'ธนาคารแลนด์ แอนด์ เฮ้าส์',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารแลนด์ แอนด์ เฮ้าส์',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'uob.co.th',
    organization: 'ธนาคารยูโอบี',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารยูโอบี',
    isActive: true,
    lastVerified: '2024-01-01'
  },

  // === E-commerce ===
  {
    domain: 'shopee.co.th',
    organization: 'Shopee Thailand',
    type: 'e-commerce',
    category: 'อีคอมเมิร์ซ',
    description: 'Shopee Thailand',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'lazada.co.th',
    organization: 'Lazada Thailand',
    type: 'e-commerce',
    category: 'อีคอมเมิร์ซ',
    description: 'Lazada Thailand',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'jd.co.th',
    organization: 'JD Central',
    type: 'e-commerce',
    category: 'อีคอมเมิร์ซ',
    description: 'JD Central Thailand',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'central.co.th',
    organization: 'Central Department Store',
    type: 'e-commerce',
    category: 'อีคอมเมิร์ซ',
    description: 'Central Department Store',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'powerbuy.co.th',
    organization: 'Power Buy',
    type: 'e-commerce',
    category: 'อีคอมเมิร์ซ',
    description: 'Power Buy',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'advice.co.th',
    organization: 'Advice',
    type: 'e-commerce',
    category: 'อีคอมเมิร์ซ',
    description: 'Advice Online Shopping',
    isActive: true,
    lastVerified: '2024-01-01'
  },

  // === News Media ===
  {
    domain: 'thairath.co.th',
    organization: 'ไทยรัฐ',
    type: 'news',
    category: 'ข่าวสาร',
    description: 'ไทยรัฐออนไลน์',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'matichon.co.th',
    organization: 'มติชน',
    type: 'news',
    category: 'ข่าวสาร',
    description: 'มติชนออนไลน์',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'manager.co.th',
    organization: 'ผู้จัดการ',
    type: 'news',
    category: 'ข่าวสาร',
    description: 'ผู้จัดการออนไลน์',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'thaipbs.or.th',
    organization: 'ไทยพีบีเอส',
    type: 'news',
    category: 'ข่าวสาร',
    description: 'ไทยพีบีเอส',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'tnn.co.th',
    organization: 'TNN',
    type: 'news',
    category: 'ข่าวสาร',
    description: 'TNN ข่าวไทย',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'workpointtoday.com',
    organization: 'Workpoint Today',
    type: 'news',
    category: 'ข่าวสาร',
    description: 'Workpoint Today',
    isActive: true,
    lastVerified: '2024-01-01'
  },

  // === Education ===
  {
    domain: 'chula.ac.th',
    organization: 'จุฬาลงกรณ์มหาวิทยาลัย',
    type: 'education',
    category: 'การศึกษา',
    description: 'จุฬาลงกรณ์มหาวิทยาลัย',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'ku.ac.th',
    organization: 'มหาวิทยาลัยเกษตรศาสตร์',
    type: 'education',
    category: 'การศึกษา',
    description: 'มหาวิทยาลัยเกษตรศาสตร์',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'mahidol.ac.th',
    organization: 'มหาวิทยาลัยมหิดล',
    type: 'education',
    category: 'การศึกษา',
    description: 'มหาวิทยาลัยมหิดล',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'tu.ac.th',
    organization: 'มหาวิทยาลัยธรรมศาสตร์',
    type: 'education',
    category: 'การศึกษา',
    description: 'มหาวิทยาลัยธรรมศาสตร์',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'kmitl.ac.th',
    organization: 'สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง',
    type: 'education',
    category: 'การศึกษา',
    description: 'สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง',
    isActive: true,
    lastVerified: '2024-01-01'
  },

  // === Utilities ===
  {
    domain: 'mea.or.th',
    organization: 'การไฟฟ้านครหลวง',
    type: 'utility',
    category: 'สาธารณูปโภค',
    description: 'การไฟฟ้านครหลวง',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'pea.co.th',
    organization: 'การไฟฟ้าส่วนภูมิภาค',
    type: 'utility',
    category: 'สาธารณูปโภค',
    description: 'การไฟฟ้าส่วนภูมิภาค',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'mwa.co.th',
    organization: 'การประปานครหลวง',
    type: 'utility',
    category: 'สาธารณูปโภค',
    description: 'การประปานครหลวง',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'pwa.co.th',
    organization: 'การประปาส่วนภูมิภาค',
    type: 'utility',
    category: 'สาธารณูปโภค',
    description: 'การประปาส่วนภูมิภาค',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'thailandpost.co.th',
    organization: 'ไปรษณีย์ไทย',
    type: 'utility',
    category: 'สาธารณูปโภค',
    description: 'ไปรษณีย์ไทย',
    isActive: true,
    lastVerified: '2024-01-01'
  },

  // === Social Media & Technology ===
  {
    domain: 'line.me',
    organization: 'LINE',
    type: 'social',
    category: 'โซเชียล',
    description: 'LINE',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'facebook.com',
    organization: 'Facebook',
    type: 'social',
    category: 'โซเชียล',
    description: 'Facebook',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'google.com',
    organization: 'Google',
    type: 'technology',
    category: 'เทคโนโลยี',
    description: 'Google',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'microsoft.com',
    organization: 'Microsoft',
    type: 'technology',
    category: 'เทคโนโลยี',
    description: 'Microsoft',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'apple.com',
    organization: 'Apple',
    type: 'technology',
    category: 'เทคโนโลยี',
    description: 'Apple',
    isActive: true,
    lastVerified: '2024-01-01'
  },

  // === Thai Community Sites ===
  {
    domain: 'pantip.com',
    organization: 'Pantip',
    type: 'social',
    category: 'โซเชียล',
    description: 'Pantip.com',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'sanook.com',
    organization: 'Sanook',
    type: 'social',
    category: 'โซเชียล',
    description: 'Sanook.com',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'kapook.com',
    organization: 'Kapook',
    type: 'social',
    category: 'โซเชียล',
    description: 'Kapook.com',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'mthai.com',
    organization: 'MThai',
    type: 'social',
    category: 'โซเชียล',
    description: 'MThai.com',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  
  // === Official LINE Services ===
  {
    domain: 'line.me',
    organization: 'LINE Corporation',
    type: 'social',
    category: 'โซเชียล',
    description: 'LINE Official',
    isActive: true,
    alternativeDomains: ['lin.ee', 'line.me', 'liff.line.me'],
    lastVerified: '2024-01-01'
  },
  {
    domain: 'lin.ee',
    organization: 'LINE Corporation',
    type: 'social',
    category: 'โซเชียล',
    description: 'LINE URL Shortener',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'liff.line.me',
    organization: 'LINE Corporation',
    type: 'social',
    category: 'โซเชียล',
    description: 'LINE Front-end Framework',
    isActive: true,
    lastVerified: '2024-01-01'
  },
  {
    domain: 'admanager.line.biz',
    organization: 'LINE Corporation',
    type: 'technology',
    category: 'เทคโนโลยี',
    description: 'LINE Ads Manager',
    isActive: true,
    lastVerified: '2024-01-01'
  }
];

/**
 * ฟังก์ชันสำหรับตรวจสอบว่าเว็บไซต์เป็นเว็บไซต์ที่เชื่อถือได้หรือไม่
 */
export class TrustedWebsiteChecker {
  /**
   * ตรวจสอบว่าเว็บไซต์เป็นเว็บไซต์ที่เชื่อถือได้หรือไม่
   */
  static isTrustedWebsite(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      
      return TRUSTED_WEBSITES.some(trusted => {
        if (!trusted.isActive) return false;
        
        // ตรวจสอบ domain หลัก
        if (domain === trusted.domain || domain.endsWith('.' + trusted.domain)) {
          return true;
        }
        
        // ตรวจสอบ alternative domains
        if (trusted.alternativeDomains) {
          return trusted.alternativeDomains.some(altDomain => {
            if (altDomain.startsWith('*.')) {
              const baseDomain = altDomain.substring(2);
              return domain.endsWith('.' + baseDomain) || domain === baseDomain;
            }
            return domain === altDomain || domain.endsWith('.' + altDomain);
          });
        }
        
        return false;
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * ค้นหาข้อมูลของเว็บไซต์ที่เชื่อถือได้
   */
  static getTrustedWebsiteInfo(url: string): TrustedWebsite | null {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      
      const found = TRUSTED_WEBSITES.find(trusted => {
        if (!trusted.isActive) return false;
        
        // ตรวจสอบ domain หลัก
        if (domain === trusted.domain || domain.endsWith('.' + trusted.domain)) {
          return true;
        }
        
        // ตรวจสอบ alternative domains
        if (trusted.alternativeDomains) {
          return trusted.alternativeDomains.some(altDomain => {
            if (altDomain.startsWith('*.')) {
              const baseDomain = altDomain.substring(2);
              return domain.endsWith('.' + baseDomain) || domain === baseDomain;
            }
            return domain === altDomain || domain.endsWith('.' + altDomain);
          });
        }
        
        return false;
      });
      
      return found || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * ดึงรายการเว็บไซต์ที่เชื่อถือได้ตามประเภท
   */
  static getTrustedWebsitesByType(type: 'government' | 'bank' | 'e-commerce' | 'news' | 'education' | 'healthcare' | 'utility' | 'social' | 'technology'): TrustedWebsite[] {
    return TRUSTED_WEBSITES.filter(website => website.type === type && website.isActive);
  }

  /**
   * ดึงรายการเว็บไซต์ที่เชื่อถือได้ตามหมวดหมู่
   */
  static getTrustedWebsitesByCategory(category: string): TrustedWebsite[] {
    return TRUSTED_WEBSITES.filter(website => website.category === category && website.isActive);
  }

  /**
   * ตรวจสอบว่าเว็บไซต์เป็นเว็บไซต์ธนาคารหรือไม่
   */
  static isBankWebsite(url: string): boolean {
    const websiteInfo = this.getTrustedWebsiteInfo(url);
    return websiteInfo ? websiteInfo.type === 'bank' : false;
  }

  /**
   * ตรวจสอบว่าเว็บไซต์เป็นเว็บไซต์ราชการหรือไม่
   */
  static isGovernmentWebsite(url: string): boolean {
    const websiteInfo = this.getTrustedWebsiteInfo(url);
    return websiteInfo ? websiteInfo.type === 'government' : false;
  }

  /**
   * ตรวจสอบว่าเว็บไซต์เป็นเว็บไซต์อีคอมเมิร์ซที่เชื่อถือได้หรือไม่
   */
  static isTrustedECommerceWebsite(url: string): boolean {
    const websiteInfo = this.getTrustedWebsiteInfo(url);
    return websiteInfo ? websiteInfo.type === 'e-commerce' : false;
  }

  /**
   * ดึงรายการ TLD ที่น่าสงสัย
   */
  static getSuspiciousTLDs(): string[] {
    return [
      // ฟรี TLD ที่มักใช้ในการหลอกลวง
      'tk', 'ml', 'ga', 'cf', 'gq', 'pw', 'tk', 'ml', 'tk',
      
      // URL shortener TLD
      'bit', 'ly', 'click', 'download', 'link', 'short',
      
      // TLD ที่น่าสงสัยทั่วไป
      'info', 'biz', 'xyz', 'online', 'website', 'site',
      'top', 'win', 'review', 'party', 'loan', 'date',
      'stream', 'trade', 'racing', 'bid', 'cricket',
      'science', 'faith', 'accountant', 'party', 'download',
      
      // TLD ที่มักใช้ในการ phishing
      'secure', 'bank', 'finance', 'pay', 'cash', 'money'
    ];
  }

  /**
   * ตรวจสอบว่า URL มี TLD ที่น่าสงสัยหรือไม่
   */
  static hasSuspiciousTLD(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      const tld = hostname.split('.').pop();
      
      return this.getSuspiciousTLDs().includes(tld || '');
    } catch (error) {
      return false;
    }
  }

  /**
   * ตรวจสอบว่า URL เป็น IP address หรือไม่
   */
  static isIPAddress(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      // ตรวจสอบ IPv4
      const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      
      return ipv4Pattern.test(hostname);
    } catch (error) {
      return false;
    }
  }
}