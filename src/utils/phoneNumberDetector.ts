/**
 * Optimized Thai Phone Number Detection Utility
 * แก้ไขปัญหาการตรวจจับตัวเลขธรรมดาเป็นเบอร์โทร
 */

export class ThaiPhoneNumberDetector {
  /**
   * ตรวจจับเบอร์โทรไทยจากข้อความโดยใช้ context-aware validation
   */
  static extractPhoneNumbers(text: string): string[] {
    const phoneNumbers: string[] = [];
    
    // Thai phone number patterns with proper validation
    const patterns = [
      // Mobile phones with separators (08x-xxx-xxxx, 09x-xxx-xxxx, 06x-xxx-xxxx)
      {
        regex: /(?:\+66[\s-]?|0)([689][0-9])[\s-]?([0-9]{3})[\s-]?([0-9]{4})/g,
        validator: (match: string) => {
          const digits = match.replace(/[\s-]/g, '').replace(/^\+66/, '').replace(/^0/, '');
          return digits.length === 9 && /^[689][0-9]{8}$/.test(digits);
        }
      },
      
      // Landline phones with separators (02-xxx-xxxx, 03x-xxx-xxxx, etc.)
      {
        regex: /(?:\+66[\s-]?|0)([2-7][0-9]?)[\s-]?([0-9]{3})[\s-]?([0-9]{4})/g,
        validator: (match: string) => {
          const digits = match.replace(/[\s-]/g, '').replace(/^\+66/, '').replace(/^0/, '');
          return (digits.length === 8 || digits.length === 9) && /^[2-7][0-9]{7,8}$/.test(digits);
        }
      },
      
      // Mobile phones without separators (strict format)
      {
        regex: /\b(?:\+66|0)([689][0-9]{8})\b/g,
        validator: (match: string) => {
          const digits = match.replace(/^\+66/, '').replace(/^0/, '');
          return digits.length === 9 && /^[689][0-9]{8}$/.test(digits);
        }
      },
      
      // Landline phones without separators (strict format)
      {
        regex: /\b(?:\+66|0)([2-7][0-9]{7,8})\b/g,
        validator: (match: string) => {
          const digits = match.replace(/^\+66/, '').replace(/^0/, '');
          return (digits.length === 8 || digits.length === 9) && /^[2-7][0-9]{7,8}$/.test(digits);
        }
      },
      
      // Special service numbers (1xxx, 19x)
      {
        regex: /\b(1[0-9]{3,4}|19[0-9])\b/g,
        validator: (match: string) => {
          return /^(1[0-9]{3,4}|19[0-9])$/.test(match);
        }
      }
    ];
    
    patterns.forEach(pattern => {
      // Reset lastIndex to prevent infinite loops with global regexes
      pattern.regex.lastIndex = 0;
      
      let match;
      let matchCount = 0;
      const maxMatches = 100; // Prevent excessive processing
      
      while ((match = pattern.regex.exec(text)) !== null && matchCount < maxMatches) {
        matchCount++;
        const fullMatch = match[0];
        
        // Context-based filtering
        const beforeMatch = text.substring(0, match.index);
        const afterMatch = text.substring(match.index + fullMatch.length);
        
        // Skip if it's clearly not a phone number based on context
        if (this.shouldSkipBasedOnContext(beforeMatch, afterMatch)) {
          continue;
        }
        
        // Skip if it's part of an IP address
        if (/[0-9]+\.[0-9]+\.[0-9]+/.test(beforeMatch + fullMatch + afterMatch)) {
          continue;
        }
        
        // Apply pattern-specific validation
        if (pattern.validator(fullMatch)) {
          phoneNumbers.push(fullMatch);
        }
        
        // Break if regex doesn't have global flag to prevent infinite loop
        if (!pattern.regex.global) {
          break;
        }
      }
      
      // Reset lastIndex after processing
      pattern.regex.lastIndex = 0;
    });
    
    // Additional validation for phone context
    const validPhones = phoneNumbers.filter(phone => {
      return this.hasPhoneContext(text, phone);
    });
    
    return [...new Set(validPhones)]; // Remove duplicates
  }

  /**
   * ตรวจสอบว่าควรข้ามการตรวจจับหรือไม่ตาม context
   */
  private static shouldSkipBasedOnContext(beforeMatch: string, afterMatch: string): boolean {
    const skipPatterns = [
      // Price/quantity indicators
      /(?:ราคา|บาท|เงิน|ค่า|ตัว|ชิ้น|อัน|กิโลกรัม|กิโล|กก\.|กรัม|ลิตร|เมตร|ซม\.|มม\.)\s*$/,
      // Date/time patterns
      /(?:วันที่|เวลา|[0-9]+\/[0-9]+\/|[0-9]+:)/,
      // Address patterns
      /(?:ที่อยู่|บ้านเลขที่|ห้อง|ชั้น|อาคาร|ซอย|ถนน|ตรอก|หมู่|ตำบล|อำเภอ|จังหวัด)\s*$/,
      // Code/ID patterns
      /(?:รหัส|โค้ด|ID|เลข|หมายเลข|เลขที่)\s*$/
    ];
    
    return skipPatterns.some(skipPattern => skipPattern.test(beforeMatch)) ||
           /^\s*(?:บาท|ชิ้น|อัน|กิโลกรัม|กิโล|กก\.|กรัม|ลิตร|เมตร|ซม\.|มม\.)/.test(afterMatch);
  }

  /**
   * ตรวจสอบว่ามี context ที่เกี่ยวข้องกับเบอร์โทรหรือไม่
   */
  private static hasPhoneContext(text: string, phone: string): boolean {
    const phoneIndex = text.indexOf(phone);
    const beforeContext = text.substring(Math.max(0, phoneIndex - 50), phoneIndex);
    const afterContext = text.substring(phoneIndex + phone.length, phoneIndex + phone.length + 50);
    
    // Look for phone-related keywords
    const phoneKeywords = [
      'โทร', 'เบอร์', 'ติดต่อ', 'โทรศัพท์', 'phone', 'tel', 'call', 'mobile',
      'หมายเลข', 'สาย', 'โทรมา', 'โทรไป', 'โทรหา', 'รับสาย'
    ];
    
    const hasPhoneContext = phoneKeywords.some(keyword => 
      beforeContext.toLowerCase().includes(keyword.toLowerCase()) ||
      afterContext.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // For shorter numbers, require stronger context
    if (phone.length <= 4) {
      return hasPhoneContext;
    }
    
    // For longer numbers, be more lenient but still check for obvious non-phone contexts
    return true;
  }

  /**
   * ตรวจสอบว่าเป็นเบอร์โทรไทยที่ถูกต้องหรือไม่
   */
  static isValidThaiPhoneNumber(phoneStr: string): boolean {
    // Clean the phone number
    const cleaned = phoneStr.replace(/[\s-]/g, '');
    
    // Check if it starts with +66 or 0
    let digits = cleaned;
    if (cleaned.startsWith('+66')) {
      digits = cleaned.substring(3);
    } else if (cleaned.startsWith('0')) {
      digits = cleaned.substring(1);
    }
    
    // Validate length and format
    if (digits.length < 3 || digits.length > 9) return false;
    
    // Check if all are digits
    if (!/^[0-9]+$/.test(digits)) return false;
    
    // Check emergency/service numbers
    if (digits.length === 3 && digits.startsWith('19')) return true;
    if (digits.length === 4 && digits.startsWith('1')) return true;
    
    // Check valid Thai mobile prefixes
    const mobileStart = digits.substring(0, 2);
    const validMobile = [
      '81', '82', '83', '84', '85', '86', '87', '88', '89',
      '90', '91', '92', '93', '94', '95', '96', '97', '98', '99',
      '60', '61', '62', '63', '64', '65', '66', '67', '68', '69'
    ];
    
    // Check valid landline prefixes
    const landlineStart = digits.substring(0, 1);
    const validLandline = ['2', '3', '4', '5', '7'];
    
    // Mobile phone validation
    if (digits.length === 9 && validMobile.includes(mobileStart)) return true;
    
    // Landline validation
    if ((digits.length === 8 || digits.length === 9) && validLandline.includes(landlineStart)) return true;
    
    return false;
  }
}