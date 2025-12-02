/**
 * ฐานข้อมูลเบอร์โทรที่เชื่อถือได้ของหน่วยงานรัฐ สายด่วน และบริษัทใหญ่
 * อัปเดตล่าสุด: 2024
 */

export interface TrustedPhoneNumber {
  number: string;
  organization: string;
  type: 'government' | 'emergency' | 'bank' | 'corporate' | 'utility' | 'transport';
  category: string;
  description: string;
  isActive: boolean;
  source: string;
}

export const TRUSTED_PHONE_NUMBERS: TrustedPhoneNumber[] = [
  // === หน่วยงานราชการและรัฐวิสาหกิจ ===
  {
    number: '0-283-4000',
    organization: 'สำนักนายกรัฐมนตรี',
    type: 'government',
    category: 'กฎหมาย',
    description: 'สำนักนายกรัฐมนตรี',
    isActive: true,
    source: 'https://www.opm.go.th'
  },
  {
    number: '0-2221-2847',
    organization: 'กระทรวงกลาโหม',
    type: 'government',
    category: 'กฎหมาย',
    description: 'กระทรวงกลาโหม',
    isActive: true,
    source: 'ข้อมูลราชการ'
  },
  {
    number: '0-2273-9021',
    organization: 'กระทรวงการคลัง',
    type: 'government',
    category: 'กฎหมาย',
    description: 'กระทรวงการคลัง',
    isActive: true,
    source: 'ข้อมูลราชการ'
  },
  {
    number: '0-2203-5000',
    organization: 'กระทรวงการต่างประเทศ',
    type: 'government',
    category: 'กฎหมาย',
    description: 'กระทรวงการต่างประเทศ',
    isActive: true,
    source: 'ข้อมูลราชการ'
  },
  {
    number: '0-2283-3000',
    organization: 'กระทรวงคมนาคม',
    type: 'government',
    category: 'กฎหมาย',
    description: 'กระทรวงคมนาคม',
    isActive: true,
    source: 'ข้อมูลราชการ'
  },
  {
    number: '0-2278-8500',
    organization: 'กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม',
    type: 'government',
    category: 'กฎหมาย',
    description: 'กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม',
    isActive: true,
    source: 'ข้อมูลราชการ'
  },
  {
    number: '0-2140-6000',
    organization: 'กระทรวงพลังงาน',
    type: 'government',
    category: 'กฎหมาย',
    description: 'กระทรวงพลังงาน',
    isActive: true,
    source: 'ข้อมูลราชการ'
  },
  {
    number: '1765',
    organization: 'กระทรวงวัฒนธรรม',
    type: 'government',
    category: 'กฎหมาย',
    description: 'กระทรวงวัฒนธรรม',
    isActive: true,
    source: 'ข้อมูลราชการ'
  },
  {
    number: '0-2221-2847',
    organization: 'กระทรวงศึกษาธิการ',
    type: 'government',
    category: 'กฎหมาย',
    description: 'กระทรวงศึกษาธิการ',
    isActive: true,
    source: 'ข้อมูลราชการ'
  },
  {
    number: '0-2141-5100',
    organization: 'กระทรวงยุติธรรม',
    type: 'government',
    category: 'กฎหมาย',
    description: 'กระทรวงยุติธรรม',
    isActive: true,
    source: 'ข้อมูลราชการ'
  },
  {
    number: '0-2222-1141',
    organization: 'กระทรวงมหาดไทย',
    type: 'government',
    category: 'กฎหมาย',
    description: 'กระทรวงมหาดไทย',
    isActive: true,
    source: 'ข้อมูลราชการ'
  },

  // === รัฐวิสาหกิจ ===
  {
    number: '0-2579-5380',
    organization: 'การทางพิเศษแห่งประเทศไทย',
    type: 'government',
    category: 'รัฐวิสาหกิจ',
    description: 'การทางพิเศษแห่งประเทศไทย',
    isActive: true,
    source: 'ข้อมูลราชการ'
  },
  {
    number: '0-2250-5500',
    organization: 'การท่องเที่ยวแห่งประเทศไทย',
    type: 'government',
    category: 'รัฐวิสาหกิจ',
    description: 'การท่องเที่ยวแห่งประเทศไทย',
    isActive: true,
    source: 'ข้อมูลราชการ'
  },
  {
    number: '1545',
    organization: 'ไปรษณีย์ไทย',
    type: 'government',
    category: 'รัฐวิสาหกิจ',
    description: 'ไปรษณีย์ไทย',
    isActive: true,
    source: 'ข้อมูลราชการ'
  },
  {
    number: '1348',
    organization: 'ขสมก.',
    type: 'transport',
    category: 'รัฐวิสาหกิจ',
    description: 'ขสมก.',
    isActive: true,
    source: 'ข้อมูลราชการ'
  },
  {
    number: '1690',
    organization: 'รถไฟแห่งประเทศไทย',
    type: 'transport',
    category: 'รัฐวิสาหกิจ',
    description: 'รถไฟแห่งประเทศไทย',
    isActive: true,
    source: 'ข้อมูลราชการ'
  },
  {
    number: '02-617-6000',
    organization: 'รถไฟฟ้าบีทีเอส',
    type: 'transport',
    category: 'รัฐวิสาหกิจ',
    description: 'รถไฟฟ้าบีทีเอส',
    isActive: true,
    source: 'ข้อมูลราชการ'
  },
  {
    number: '02-716-4044',
    organization: 'รถไฟฟ้า MRT',
    type: 'transport',
    category: 'รัฐวิสาหกิจ',
    description: 'รถไฟฟ้า MRT',
    isActive: true,
    source: 'ข้อมูลราชการ'
  },
  {
    number: '1506',
    organization: 'สำนักงานประกันสังคม',
    type: 'government',
    category: 'สายด่วน',
    description: 'สำนักงานประกันสังคม สายด่วน',
    isActive: true,
    source: 'ข้อมูลราชการ'
  },

  // === สาธารณูปโภค ===
  {
    number: '1130',
    organization: 'การไฟฟ้านครหลวง',
    type: 'utility',
    category: 'สาธารณูปโภค',
    description: 'การไฟฟ้านครหลวง',
    isActive: true,
    source: 'ข้อมูลราชการ'
  },
  {
    number: '1129',
    organization: 'การไฟฟ้าส่วนภูมิภาค',
    type: 'utility',
    category: 'สาธารณูปโภค',
    description: 'การไฟฟ้าส่วนภูมิภาค',
    isActive: true,
    source: 'ข้อมูลราชการ'
  },
  {
    number: '1125',
    organization: 'การประปานครหลวง',
    type: 'utility',
    category: 'สาธารณูปโภค',
    description: 'การประปานครหลวง',
    isActive: true,
    source: 'ข้อมูลราชการ'
  },
  {
    number: '1662',
    organization: 'การประปาส่วนภูมิภาค',
    type: 'utility',
    category: 'สาธารณูปโภค',
    description: 'การประปาส่วนภูมิภาค',
    isActive: true,
    source: 'ข้อมูลราชการ'
  },

  // === เบอร์สายด่วนและฉุกเฉิน ===
  {
    number: '191',
    organization: 'ศูนย์รับแจ้งเหตุด่วน',
    type: 'emergency',
    category: 'ฉุกเฉิน',
    description: 'แจ้งเหตุด่วน-เหตุร้าย',
    isActive: true,
    source: 'หน่วยงานราชการ'
  },
  {
    number: '199',
    organization: 'ศูนย์รับแจ้งเหตุไฟไหม้',
    type: 'emergency',
    category: 'ฉุกเฉิน',
    description: 'แจ้งเหตุไฟไหม้/ดับเพลิง',
    isActive: true,
    source: 'หน่วยงานราชการ'
  },
  {
    number: '1300',
    organization: 'ศูนย์รับแจ้งคนหาย',
    type: 'emergency',
    category: 'ฉุกเฉิน',
    description: 'แจ้งคนหาย',
    isActive: true,
    source: 'หน่วยงานราชการ'
  },
  {
    number: '1155',
    organization: 'ตำรวจท่องเที่ยว',
    type: 'emergency',
    category: 'ฉุกเฉิน',
    description: 'ตำรวจท่องเที่ยว',
    isActive: true,
    source: 'หน่วยงานราชการ'
  },
  {
    number: '1669',
    organization: 'แพทย์ฉุกเฉิน',
    type: 'emergency',
    category: 'ฉุกเฉิน',
    description: 'แพทย์ฉุกเฉิน (ทั่วประเทศ)',
    isActive: true,
    source: 'หน่วยงานราชการ'
  },
  {
    number: '1646',
    organization: 'แพทย์ฉุกเฉิน กทม.',
    type: 'emergency',
    category: 'ฉุกเฉิน',
    description: 'แพทย์ฉุกเฉิน (กทม.)',
    isActive: true,
    source: 'หน่วยงานราชการ'
  },
  {
    number: '1192',
    organization: 'ศูนย์รับแจ้งรถหาย',
    type: 'emergency',
    category: 'ฉุกเฉิน',
    description: 'แจ้งรถหาย',
    isActive: true,
    source: 'หน่วยงานราชการ'
  },
  {
    number: '1193',
    organization: 'ตำรวจทางหลวง',
    type: 'emergency',
    category: 'ฉุกเฉิน',
    description: 'ตำรวจทางหลวง',
    isActive: true,
    source: 'หน่วยงานราชการ'
  },
  {
    number: '1195',
    organization: 'กองปราบปราม',
    type: 'emergency',
    category: 'ฉุกเฉิน',
    description: 'กองปราบปราม',
    isActive: true,
    source: 'หน่วยงานราชการ'
  },
  {
    number: '1554',
    organization: 'หน่วยแพทย์กู้ชีวิต วชิรพยาบาล',
    type: 'emergency',
    category: 'ฉุกเฉิน',
    description: 'หน่วยแพทย์กู้ชีวิต วชิรพยาบาล',
    isActive: true,
    source: 'หน่วยงานราชการ'
  },
  {
    number: '1586',
    organization: 'กรมทางหลวง',
    type: 'government',
    category: 'สายด่วน',
    description: 'กรมทางหลวง',
    isActive: true,
    source: 'หน่วยงานราชการ'
  },
  {
    number: '1543',
    organization: 'กรมทางพิเศษ',
    type: 'government',
    category: 'สายด่วน',
    description: 'กรมทางพิเศษ',
    isActive: true,
    source: 'หน่วยงานราชการ'
  },
  {
    number: '1323',
    organization: 'กรมสุขภาพจิต',
    type: 'government',
    category: 'สายด่วน',
    description: 'สายด่วนกรมสุขภาพจิต',
    isActive: true,
    source: 'หน่วยงานราชการ'
  },
  {
    number: '1196',
    organization: 'ศูนย์แจ้งเหตุอุบัติเหตุทางน้ำ',
    type: 'emergency',
    category: 'ฉุกเฉิน',
    description: 'ศูนย์แจ้งเหตุอุบัติเหตุทางน้ำ',
    isActive: true,
    source: 'หน่วยงานราชการ'
  },
  {
    number: '192',
    organization: 'ศูนย์เตือนภัยพิบัติแห่งชาติ',
    type: 'emergency',
    category: 'ฉุกเฉิน',
    description: 'ศูนย์เตือนภัยพิบัติแห่งชาติ',
    isActive: true,
    source: 'หน่วยงานราชการ'
  },
  {
    number: '1860',
    organization: 'ศูนย์เตือนภัยพิบัติแห่งชาติ',
    type: 'emergency',
    category: 'ฉุกเฉิน',
    description: 'ศูนย์เตือนภัยพิบัติแห่งชาติ',
    isActive: true,
    source: 'หน่วยงานราชการ'
  },
  {
    number: '1165',
    organization: 'สายด่วนยาเสพติด',
    type: 'emergency',
    category: 'สายด่วน',
    description: 'สายด่วนยาเสพติด',
    isActive: true,
    source: 'หน่วยงานราชการ'
  },
  {
    number: '1677',
    organization: 'แจ้งอุบัติเหตุบนถนน',
    type: 'emergency',
    category: 'ฉุกเฉิน',
    description: 'แจ้งอุบัติเหตุบนถนน (ร่วมด้วยช่วยกัน)',
    isActive: true,
    source: 'หน่วยงานราชการ'
  },
  {
    number: '1137',
    organization: 'จส.100',
    type: 'government',
    category: 'สายด่วน',
    description: 'สอบถามเส้นทาง',
    isActive: true,
    source: 'หน่วยงานราชการ'
  },
  {
    number: '181',
    organization: 'สอบถามเวลา',
    type: 'government',
    category: 'สายด่วน',
    description: 'สอบถามเวลา',
    isActive: true,
    source: 'หน่วยงานราชการ'
  },
  {
    number: '1717',
    organization: 'เมาไม่ขับ',
    type: 'government',
    category: 'สายด่วน',
    description: 'เมาไม่ขับ',
    isActive: true,
    source: 'หน่วยงานราชการ'
  },

  // === ธนาคาร ===
  {
    number: '1333',
    organization: 'ธนาคารกรุงเทพ',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารกรุงเทพ',
    isActive: true,
    source: 'เว็บไซต์ธนาคาร'
  },
  {
    number: '1115',
    organization: 'ธนาคารออมสิน',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารออมสิน',
    isActive: true,
    source: 'เว็บไซต์ธนาคาร'
  },
  {
    number: '1302',
    organization: 'ธนาคารอิสลามแห่งประเทศไทย',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารอิสลามแห่งประเทศไทย',
    isActive: true,
    source: 'เว็บไซต์ธนาคาร'
  },
  {
    number: '1770',
    organization: 'ธนาคารธนชาต',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารธนชาต',
    isActive: true,
    source: 'เว็บไซต์ธนาคาร'
  },
  {
    number: '1572',
    organization: 'ธนาคารกรุงศรีอยุธยา',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารกรุงศรีอยุธยา',
    isActive: true,
    source: 'เว็บไซต์ธนาคาร'
  },
  {
    number: '1558',
    organization: 'ธนาคารทหารไทย',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารทหารไทย',
    isActive: true,
    source: 'เว็บไซต์ธนาคาร'
  },
  {
    number: '1588',
    organization: 'ธนาคารซิตี้แบงก์',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารซิตี้แบงก์',
    isActive: true,
    source: 'เว็บไซต์ธนาคาร'
  },
  {
    number: '02-777-7777',
    organization: 'ธนาคารไทยพาณิชย์',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารไทยพาณิชย์',
    isActive: true,
    source: 'เว็บไซต์ธนาคาร'
  },
  {
    number: '02-888-8888',
    organization: 'ธนาคารกสิกรไทย',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารกสิกรไทย',
    isActive: true,
    source: 'เว็บไซต์ธนาคาร'
  },
  {
    number: '02-633-6000',
    organization: 'ธนาคารทิสโก้',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารทิสโก้',
    isActive: true,
    source: 'เว็บไซต์ธนาคาร'
  },
  {
    number: '02-359-0000',
    organization: 'ธนาคารแลนด์ แอนด์ เฮ้าส์',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารแลนด์ แอนด์ เฮ้าส์',
    isActive: true,
    source: 'เว็บไซต์ธนาคาร'
  },
  {
    number: '02-285-1555',
    organization: 'ธนาคารยูโอบี',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารยูโอบี',
    isActive: true,
    source: 'เว็บไซต์ธนาคาร'
  },
  {
    number: '02-629-5588',
    organization: 'ธนาคารไอซีบีซี',
    type: 'bank',
    category: 'ธนาคาร',
    description: 'ธนาคารไอซีบีซี (ICBC Thai)',
    isActive: true,
    source: 'เว็บไซต์ธนาคาร'
  },

  // === บริษัทใหญ่ ===
  {
    number: '02-826-7744',
    organization: 'CP ALL',
    type: 'corporate',
    category: 'บริษัท',
    description: 'CP ALL (7-Eleven)',
    isActive: true,
    source: 'เว็บไซต์บริษัท'
  },
  {
    number: '02-616-5555',
    organization: 'ไทยน้ำทิพย์ โคคา-โคล่า',
    type: 'corporate',
    category: 'บริษัท',
    description: 'ไทยน้ำทิพย์ โคคา-โคล่า',
    isActive: true,
    source: 'เว็บไซต์บริษัท'
  },
  {
    number: '02-262-6000',
    organization: 'Shell Thailand',
    type: 'corporate',
    category: 'บริษัท',
    description: 'Shell Thailand',
    isActive: true,
    source: 'เว็บไซต์บริษัท'
  },
  {
    number: '02-263-2929',
    organization: 'คาร์กิลล์ ประเทศไทย',
    type: 'corporate',
    category: 'บริษัท',
    description: 'คาร์กิลล์ ประเทศไทย',
    isActive: true,
    source: 'เว็บไซต์บริษัท'
  },
  {
    number: '0-2658-9000',
    organization: 'กลุ่มโบรกเกอร์ชั้นนำ',
    type: 'corporate',
    category: 'บริษัท',
    description: 'กลุ่มโบรกเกอร์ชั้นนำ (BLS, KGI ฯลฯ)',
    isActive: true,
    source: 'เว็บไซต์บริษัท'
  }
];

/**
 * ฟังก์ชันสำหรับตรวจสอบว่าเบอร์โทรนั้นเป็นเบอร์ที่เชื่อถือได้หรือไม่
 */
export class TrustedPhoneChecker {
  /**
   * ตรวจสอบว่าเบอร์โทรเป็นเบอร์ที่เชื่อถือได้หรือไม่
   */
  static isTrustedNumber(phoneNumber: string): boolean {
    // ทำความสะอาดเบอร์โทร
    const cleanedNumber = this.cleanPhoneNumber(phoneNumber);
    
    return TRUSTED_PHONE_NUMBERS.some(trusted => {
      const cleanedTrustedNumber = this.cleanPhoneNumber(trusted.number);
      return cleanedTrustedNumber === cleanedNumber && trusted.isActive;
    });
  }

  /**
   * ค้นหาข้อมูลของเบอร์โทรที่เชื่อถือได้
   */
  static getTrustedNumberInfo(phoneNumber: string): TrustedPhoneNumber | null {
    const cleanedNumber = this.cleanPhoneNumber(phoneNumber);
    
    const found = TRUSTED_PHONE_NUMBERS.find(trusted => {
      const cleanedTrustedNumber = this.cleanPhoneNumber(trusted.number);
      return cleanedTrustedNumber === cleanedNumber && trusted.isActive;
    });
    
    return found || null;
  }

  /**
   * ดึงรายการเบอร์โทรที่เชื่อถือได้ตามประเภท
   */
  static getTrustedNumbersByType(type: 'government' | 'emergency' | 'bank' | 'corporate' | 'utility' | 'transport'): TrustedPhoneNumber[] {
    return TRUSTED_PHONE_NUMBERS.filter(phone => phone.type === type && phone.isActive);
  }

  /**
   * ดึงรายการเบอร์โทรที่เชื่อถือได้ตามหมวดหมู่
   */
  static getTrustedNumbersByCategory(category: string): TrustedPhoneNumber[] {
    return TRUSTED_PHONE_NUMBERS.filter(phone => phone.category === category && phone.isActive);
  }

  /**
   * ทำความสะอาดเบอร์โทรให้อยู่ในรูปแบบเดียวกัน
   */
  private static cleanPhoneNumber(phoneNumber: string): string {
    // ลบช่องว่าง, ขีด และตัวอักษรอื่นๆ
    let cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // แปลง +66 เป็น 0
    if (cleaned.startsWith('+66')) {
      cleaned = '0' + cleaned.substring(3);
    }
    
    return cleaned;
  }

  /**
   * ตรวจสอบว่าเบอร์โทรเป็นเบอร์ฉุกเฉินหรือไม่
   */
  static isEmergencyNumber(phoneNumber: string): boolean {
    const emergencyNumbers = this.getTrustedNumbersByType('emergency');
    const cleanedNumber = this.cleanPhoneNumber(phoneNumber);
    
    return emergencyNumbers.some(emergency => {
      const cleanedEmergencyNumber = this.cleanPhoneNumber(emergency.number);
      return cleanedEmergencyNumber === cleanedNumber;
    });
  }

  /**
   * ตรวจสอบว่าเบอร์โทรเป็นเบอร์ธนาคารหรือไม่
   */
  static isBankNumber(phoneNumber: string): boolean {
    const bankNumbers = this.getTrustedNumbersByType('bank');
    const cleanedNumber = this.cleanPhoneNumber(phoneNumber);
    
    return bankNumbers.some(bank => {
      const cleanedBankNumber = this.cleanPhoneNumber(bank.number);
      return cleanedBankNumber === cleanedNumber;
    });
  }

  /**
   * ตรวจสอบว่าเบอร์โทรเป็นเบอร์หน่วยงานรัฐหรือไม่
   */
  static isGovernmentNumber(phoneNumber: string): boolean {
    const governmentNumbers = this.getTrustedNumbersByType('government');
    const cleanedNumber = this.cleanPhoneNumber(phoneNumber);
    
    return governmentNumbers.some(govt => {
      const cleanedGovtNumber = this.cleanPhoneNumber(govt.number);
      return cleanedGovtNumber === cleanedNumber;
    });
  }
}