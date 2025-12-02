/**
 * Multilingual Support Service
 * ระบบรองรับหลายภาษาสำหรับ ProtectCyber
 */

import { logger } from '../utils/logger';

export type SupportedLanguage = 'th' | 'en' | 'zh' | 'my' | 'km' | 'lo' | 'vi';

export interface TranslationKeys {
  // Rich Menu Labels
  'menu.main.title': string;
  'menu.elderly.title': string;
  'menu.emergency.title': string;
  'menu.check_message': string;
  'menu.view_history': string;
  'menu.get_help': string;
  'menu.report_problem': string;
  'menu.learn_more': string;
  'menu.emergency': string;
  'menu.call_police': string;
  'menu.call_thaicert': string;
  'menu.confirm_safe': string;

  // Threat Analysis Messages
  'analysis.safe': string;
  'analysis.low_risk': string;
  'analysis.medium_risk': string;
  'analysis.high_risk': string;
  'analysis.critical_risk': string;
  'analysis.processing': string;
  'analysis.error': string;

  // Recommendations
  'recommendation.safe': string;
  'recommendation.caution': string;
  'recommendation.warning': string;
  'recommendation.danger': string;
  'recommendation.emergency': string;

  // Educational Content
  'education.phishing_tips': string;
  'education.scam_warning': string;
  'education.safe_practices': string;
  'education.emergency_contacts': string;

  // User Interface
  'ui.welcome': string;
  'ui.goodbye': string;
  'ui.help': string;
  'ui.error': string;
  'ui.loading': string;
  'ui.retry': string;
  'ui.cancel': string;
  'ui.confirm': string;

  // Elderly-specific messages
  'elderly.simple_warning': string;
  'elderly.family_contact': string;
  'elderly.slow_response': string;
  'elderly.large_text': string;

  // Emergency messages
  'emergency.immediate_threat': string;
  'emergency.call_police': string;
  'emergency.call_family': string;
  'emergency.stay_calm': string;
}

class MultilingualSupportService {
  private translations: Map<SupportedLanguage, Partial<TranslationKeys>> = new Map();
  private defaultLanguage: SupportedLanguage = 'th';
  private userLanguages: Map<string, SupportedLanguage> = new Map();
  private readonly serviceLogger = logger;

  constructor() {
    this.initializeTranslations();
    this.serviceLogger.info('MultilingualSupport', 'Multilingual support initialized', {
      supportedLanguages: Array.from(this.translations.keys())
    });
  }

  /**
   * รับข้อความที่แปลแล้วสำหรับผู้ใช้
   */
  public translate(key: keyof TranslationKeys, userId?: string, fallbackLanguage?: SupportedLanguage): string {
    try {
      const userLanguage = userId ? this.getUserLanguage(userId) : this.defaultLanguage;
      const targetLanguage = fallbackLanguage || userLanguage;

      // Get translation for target language
      const translations = this.translations.get(targetLanguage);
      if (translations && translations[key]) {
        return translations[key]!;
      }

      // Fallback to default language
      if (targetLanguage !== this.defaultLanguage) {
        const defaultTranslations = this.translations.get(this.defaultLanguage);
        if (defaultTranslations && defaultTranslations[key]) {
          this.serviceLogger.warn('MultilingualSupport', 'Fallback to default language', {
            key,
            requestedLanguage: targetLanguage,
            fallbackLanguage: this.defaultLanguage
          });
          return defaultTranslations[key]!;
        }
      }

      // Last resort: return the key itself
      this.serviceLogger.warn('MultilingualSupport', 'Translation not found', {
        key,
        language: targetLanguage
      });
      return key;

    } catch (error) {
      this.serviceLogger.error('MultilingualSupport', 'Translation failed', error as Error, {
        key,
        userId
      });
      return key;
    }
  }

  /**
   * รับข้อความหลายภาษาในครั้งเดียว
   */
  public translateMultiple(keys: Array<keyof TranslationKeys>, userId?: string): Record<string, string> {
    const result: Record<string, string> = {};
    
    keys.forEach(key => {
      result[key] = this.translate(key, userId);
    });

    return result;
  }

  /**
   * ตั้งค่าภาษาสำหรับผู้ใช้
   */
  public setUserLanguage(userId: string, language: SupportedLanguage): void {
    try {
      if (!this.translations.has(language)) {
        throw new Error(`Unsupported language: ${language}`);
      }

      this.userLanguages.set(userId, language);

      this.serviceLogger.info('MultilingualSupport', 'User language set', {
        userId,
        language
      });

    } catch (error) {
      this.serviceLogger.error('MultilingualSupport', 'Failed to set user language', error as Error, {
        userId,
        language
      });
    }
  }

  /**
   * รับภาษาของผู้ใช้
   */
  public getUserLanguage(userId: string): SupportedLanguage {
    return this.userLanguages.get(userId) || this.defaultLanguage;
  }

  /**
   * ตรวจจับภาษาจากข้อความ
   */
  public detectLanguage(text: string): SupportedLanguage {
    try {
      // Simple language detection based on character patterns
      
      // Thai detection
      if (/[\u0E00-\u0E7F]/.test(text)) {
        return 'th';
      }

      // Chinese detection
      if (/[\u4E00-\u9FFF]/.test(text)) {
        return 'zh';
      }

      // Myanmar detection
      if (/[\u1000-\u109F]/.test(text)) {
        return 'my';
      }

      // Khmer detection
      if (/[\u1780-\u17FF]/.test(text)) {
        return 'km';
      }

      // Lao detection
      if (/[\u0E80-\u0EFF]/.test(text)) {
        return 'lo';
      }

      // Vietnamese detection (Latin with diacritics)
      if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/.test(text)) {
        return 'vi';
      }

      // Default to English for Latin script
      return 'en';

    } catch (error) {
      this.serviceLogger.error('MultilingualSupport', 'Language detection failed', error as Error, {
        textLength: text.length
      });
      return this.defaultLanguage;
    }
  }

  /**
   * รับรายการภาษาที่รองรับ
   */
  public getSupportedLanguages(): Array<{
    code: SupportedLanguage;
    name: string;
    nativeName: string;
  }> {
    return [
      { code: 'th', name: 'Thai', nativeName: 'ไทย' },
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'zh', name: 'Chinese', nativeName: '中文' },
      { code: 'my', name: 'Myanmar', nativeName: 'မြန်မာ' },
      { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ' },
      { code: 'lo', name: 'Lao', nativeName: 'ລາວ' },
      { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' }
    ];
  }

  /**
   * สร้างข้อความแจ้งเตือนหลายภาษา
   */
  public createMultilingualAlert(
    keys: Array<keyof TranslationKeys>,
    primaryLanguage: SupportedLanguage = 'th',
    includeEnglish: boolean = true
  ): string {
    const messages: string[] = [];

    // Primary language
    const primaryMessages = keys.map(key => this.translate(key, undefined, primaryLanguage));
    messages.push(`${this.getLanguageFlag(primaryLanguage)} ${primaryMessages.join(' ')}`);

    // English fallback if different from primary
    if (includeEnglish && primaryLanguage !== 'en') {
      const englishMessages = keys.map(key => this.translate(key, undefined, 'en'));
      messages.push(`🇺🇸 ${englishMessages.join(' ')}`);
    }

    return messages.join('\n\n');
  }

  /**
   * แปลข้อความสำหรับแต่ละกลุ่มผู้ใช้
   */
  public translateForAudience(
    key: keyof TranslationKeys,
    audience: 'general' | 'elderly' | 'emergency',
    language?: SupportedLanguage
  ): string {
    const targetLanguage = language || this.defaultLanguage;
    let translatedKey = key;

    // Modify key based on audience
    if (audience === 'elderly') {
      const elderlyKey = `elderly.${key}` as keyof TranslationKeys;
      const elderlyTranslation = this.translations.get(targetLanguage)?.[elderlyKey];
      if (elderlyTranslation) {
        return elderlyTranslation;
      }
    }

    if (audience === 'emergency') {
      const emergencyKey = `emergency.${key}` as keyof TranslationKeys;
      const emergencyTranslation = this.translations.get(targetLanguage)?.[emergencyKey];
      if (emergencyTranslation) {
        return emergencyTranslation;
      }
    }

    return this.translate(key, undefined, targetLanguage);
  }

  /**
   * ส่งออกการแปลทั้งหมดสำหรับภาษาหนึ่ง
   */
  public exportTranslations(language: SupportedLanguage): Record<string, string> {
    const translations = this.translations.get(language);
    return translations ? { ...translations } : {};
  }

  /**
   * นำเข้าการแปลจากไฟล์ภายนอก
   */
  public importTranslations(language: SupportedLanguage, translations: Partial<TranslationKeys>): void {
    try {
      const existingTranslations = this.translations.get(language) || {};
      const mergedTranslations = { ...existingTranslations, ...translations };
      
      this.translations.set(language, mergedTranslations);

      this.serviceLogger.info('MultilingualSupport', 'Translations imported', {
        language,
        importedKeys: Object.keys(translations).length,
        totalKeys: Object.keys(mergedTranslations).length
      });

    } catch (error) {
      this.serviceLogger.error('MultilingualSupport', 'Failed to import translations', error as Error, {
        language
      });
    }
  }

  // Private helper methods
  private getLanguageFlag(language: SupportedLanguage): string {
    const flags: Record<SupportedLanguage, string> = {
      'th': '🇹🇭',
      'en': '🇺🇸',
      'zh': '🇨🇳',
      'my': '🇲🇲',
      'km': '🇰🇭',
      'lo': '🇱🇦',
      'vi': '🇻🇳'
    };
    return flags[language] || '🌐';
  }

  private initializeTranslations(): void {
    // Thai translations (default)
    this.translations.set('th', {
      // Rich Menu Labels
      'menu.main.title': '🛡️ เมนูป้องกัน',
      'menu.elderly.title': '🛡️ เมนูง่าย',
      'menu.emergency.title': '🚨 ฉุกเฉิน',
      'menu.check_message': 'ตรวจสอบข้อความ',
      'menu.view_history': 'ข้อความเก่า',
      'menu.get_help': 'ช่วยเหลือ',
      'menu.report_problem': 'รายงานปัญหา',
      'menu.learn_more': 'เรียนรู้เพิ่มเติม',
      'menu.emergency': 'ฉุกเฉิน',
      'menu.call_police': 'โทร 191 ตำรวจ',
      'menu.call_thaicert': 'โทร 1441 ThaiCERT',
      'menu.confirm_safe': 'ยืนยันปลอดภัย',

      // Threat Analysis Messages
      'analysis.safe': '✅ ข้อความนี้ปลอดภัย',
      'analysis.low_risk': '🟡 ระวังเล็กน้อย',
      'analysis.medium_risk': '🟠 ระวังปานกลาง',
      'analysis.high_risk': '🔴 อันตรายสูง',
      'analysis.critical_risk': '🚨 อันตรายมาก',
      'analysis.processing': '⏳ กำลังวิเคราะห์...',
      'analysis.error': '❌ เกิดข้อผิดพลาด',

      // Recommendations
      'recommendation.safe': 'อย่าเผยข้อมูลส่วนตัวให้คนแปลกหน้า',
      'recommendation.caution': 'ตรวจสอบข้อมูลจากหลายแหล่งก่อนเชื่อ',
      'recommendation.warning': 'ห้ามคลิกลิงค์หรือดาวน์โหลดไฟล์',
      'recommendation.danger': 'ติดต่อธนาคารหรือหน่วยงานโดยตรง',
      'recommendation.emergency': 'โทรแจ้งตำรวจ 191 ทันที',

      // Educational Content
      'education.phishing_tips': 'คำแนะนำป้องกันฟิชชิ่ง',
      'education.scam_warning': 'เตือนภัยการหลอกลวง',
      'education.safe_practices': 'แนวทางปฏิบัติที่ปลอดภัย',
      'education.emergency_contacts': 'เบอร์ติดต่อฉุกเฉิน',

      // User Interface
      'ui.welcome': 'ยินดีต้อนรับสู่เกราะไซเบอร์',
      'ui.goodbye': 'ขอบคุณที่ใช้บริการ',
      'ui.help': 'ช่วยเหลือ',
      'ui.error': 'เกิดข้อผิดพลาด',
      'ui.loading': 'กำลังโหลด...',
      'ui.retry': 'ลองใหม่',
      'ui.cancel': 'ยกเลิก',
      'ui.confirm': 'ยืนยัน',

      // Elderly-specific messages
      'elderly.simple_warning': '⚠️ ข้อความนี้อาจเป็นอันตราย กรุณาระวัง',
      'elderly.family_contact': '👨‍👩‍👧‍👦 ปรึกษาลูกหลานก่อนทำตาม',
      'elderly.slow_response': '⏰ อย่าตัดสินใจรีบร้อน แม้จะบอกว่าด่วน',
      'elderly.large_text': '🔍 ขยายตัวอักษรให้ใหญ่ขึ้น',

      // Emergency messages
      'emergency.immediate_threat': '🚨 พบภัยคุกคามทันที',
      'emergency.call_police': '📞 โทรแจ้งตำรวจ 191',
      'emergency.call_family': '👨‍👩‍👧‍👦 โทรหาครอบครัว',
      'emergency.stay_calm': '😌 ใจเย็น อย่าตื่นตระหนก'
    });

    // English translations
    this.translations.set('en', {
      // Rich Menu Labels
      'menu.main.title': '🛡️ Protection Menu',
      'menu.elderly.title': '🛡️ Simple Menu',
      'menu.emergency.title': '🚨 Emergency',
      'menu.check_message': 'Check Message',
      'menu.view_history': 'Message History',
      'menu.get_help': 'Get Help',
      'menu.report_problem': 'Report Problem',
      'menu.learn_more': 'Learn More',
      'menu.emergency': 'Emergency',
      'menu.call_police': 'Call 191 Police',
      'menu.call_thaicert': 'Call 1441 ThaiCERT',
      'menu.confirm_safe': 'Confirm Safe',

      // Threat Analysis Messages
      'analysis.safe': '✅ This message is safe',
      'analysis.low_risk': '🟡 Low risk',
      'analysis.medium_risk': '🟠 Medium risk',
      'analysis.high_risk': '🔴 High risk',
      'analysis.critical_risk': '🚨 Critical threat',
      'analysis.processing': '⏳ Analyzing...',
      'analysis.error': '❌ Error occurred',

      // Recommendations
      'recommendation.safe': 'Never share personal information with strangers',
      'recommendation.caution': 'Verify information from multiple sources',
      'recommendation.warning': 'Do not click links or download files',
      'recommendation.danger': 'Contact your bank or organization directly',
      'recommendation.emergency': 'Call police 191 immediately',

      // Educational Content
      'education.phishing_tips': 'Phishing Protection Tips',
      'education.scam_warning': 'Scam Alert',
      'education.safe_practices': 'Safe Practices',
      'education.emergency_contacts': 'Emergency Contacts',

      // User Interface
      'ui.welcome': 'Welcome to ProtectCyber',
      'ui.goodbye': 'Thank you for using our service',
      'ui.help': 'Help',
      'ui.error': 'Error',
      'ui.loading': 'Loading...',
      'ui.retry': 'Retry',
      'ui.cancel': 'Cancel',
      'ui.confirm': 'Confirm',

      // Elderly-specific messages
      'elderly.simple_warning': '⚠️ This message may be dangerous. Please be careful',
      'elderly.family_contact': '👨‍👩‍👧‍👦 Consult family before following instructions',
      'elderly.slow_response': '⏰ Don\'t rush decisions, even if urgent',
      'elderly.large_text': '🔍 Increase text size',

      // Emergency messages
      'emergency.immediate_threat': '🚨 Immediate threat detected',
      'emergency.call_police': '📞 Call police 191',
      'emergency.call_family': '👨‍👩‍👧‍👦 Call family',
      'emergency.stay_calm': '😌 Stay calm'
    });

    // Add basic translations for other languages (simplified)
    this.translations.set('zh', {
      'menu.main.title': '🛡️ 保护菜单',
      'menu.check_message': '检查消息',
      'menu.get_help': '获取帮助',
      'menu.emergency': '紧急情况',
      'analysis.safe': '✅ 此消息安全',
      'analysis.critical_risk': '🚨 严重威胁',
      'ui.welcome': '欢迎使用网络保护',
      'emergency.call_police': '📞 拨打报警电话'
    });

    this.translations.set('my', {
      'menu.main.title': '🛡️ ကာကွယ်ရေးမီနူး',
      'menu.check_message': 'စာတိုကိုစစ်ဆေး',
      'menu.get_help': 'အကူအညီရယူ',
      'menu.emergency': 'အရေးပေါ်',
      'analysis.safe': '✅ ဤစာတိုသည်လုံခြုံပါသည်',
      'ui.welcome': 'ProtectCyber မှကြိုဆိုပါသည်'
    });

    this.translations.set('vi', {
      'menu.main.title': '🛡️ Menu Bảo vệ',
      'menu.check_message': 'Kiểm tra tin nhắn',
      'menu.get_help': 'Nhận trợ giúp',
      'menu.emergency': 'Khẩn cấp',
      'analysis.safe': '✅ Tin nhắn này an toàn',
      'ui.welcome': 'Chào mừng đến với ProtectCyber'
    });
  }
}

// Export singleton instance
export const multilingualSupport = new MultilingualSupportService();