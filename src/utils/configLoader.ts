/**
 * Configuration Loader for Trusted Phone Numbers
 * โหลดและจัดการการตั้งค่าระบบเบอร์โทรที่เชื่อถือได้
 */

import * as fs from 'fs';
import * as path from 'path';

export interface TrustedPhoneConfig {
  trustedPhoneNumbers: {
    enabled: boolean;
    strictMode: boolean;
    updateInterval: number;
    sources: Array<{
      name: string;
      type: 'government' | 'emergency' | 'bank' | 'corporate' | 'utility' | 'transport';
      active: boolean;
      description: string;
      lastUpdate: string;
    }>;
  };
  phoneValidation: {
    contextAware: boolean;
    requirePhoneKeywords: boolean;
    allowPartialMatches: boolean;
    skipContextPatterns: string[];
  };
  logging: {
    enabled: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    logTrustedMatches: boolean;
    logSuspiciousNumbers: boolean;
    logValidationResults: boolean;
  };
  security: {
    enableRateLimiting: boolean;
    maxRequestsPerMinute: number;
    enableIPWhitelisting: boolean;
    requireAuthentication: boolean;
  };
  monitoring: {
    enabled: boolean;
    metricsCollection: boolean;
    performanceTracking: boolean;
    alertOnHighRiskNumbers: boolean;
  };
}

export class ConfigLoader {
  private static config: TrustedPhoneConfig | null = null;
  private static configPath: string = path.join(__dirname, '../../config/trustedPhoneConfig.json');

  /**
   * โหลดการตั้งค่าจากไฟล์
   */
  static loadConfig(): TrustedPhoneConfig {
    if (this.config !== null) {
      return this.config;
    }

    try {
      const configData = fs.readFileSync(this.configPath, 'utf8');
      this.config = JSON.parse(configData);
      
      console.log('📄 Trusted phone config loaded successfully');
      return this.config!;
    } catch (error) {
      console.error('❌ Failed to load trusted phone config:', error);
      
      // Return default configuration
      return this.getDefaultConfig();
    }
  }

  /**
   * บันทึกการตั้งค่าลงไฟล์
   */
  static saveConfig(config: TrustedPhoneConfig): boolean {
    try {
      const configData = JSON.stringify(config, null, 2);
      fs.writeFileSync(this.configPath, configData, 'utf8');
      
      this.config = config;
      console.log('💾 Trusted phone config saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to save trusted phone config:', error);
      return false;
    }
  }

  /**
   * อัปเดตการตั้งค่าบางส่วน
   */
  static updateConfig(updates: Partial<TrustedPhoneConfig>): boolean {
    try {
      const currentConfig = this.loadConfig();
      const mergedConfig = { ...currentConfig, ...updates };
      
      return this.saveConfig(mergedConfig);
    } catch (error) {
      console.error('❌ Failed to update trusted phone config:', error);
      return false;
    }
  }

  /**
   * ดึงการตั้งค่าเริ่มต้น
   */
  static getDefaultConfig(): TrustedPhoneConfig {
    return {
      trustedPhoneNumbers: {
        enabled: true,
        strictMode: false,
        updateInterval: 86400000, // 24 hours
        sources: [
          {
            name: "Thai Government Agencies",
            type: "government",
            active: true,
            description: "Official phone numbers from Thai government agencies",
            lastUpdate: new Date().toISOString()
          },
          {
            name: "Emergency Services",
            type: "emergency",
            active: true,
            description: "Emergency hotlines and crisis services",
            lastUpdate: new Date().toISOString()
          },
          {
            name: "Thai Banks",
            type: "bank",
            active: true,
            description: "Official bank customer service numbers",
            lastUpdate: new Date().toISOString()
          },
          {
            name: "Major Corporations",
            type: "corporate",
            active: true,
            description: "Large corporations and service providers",
            lastUpdate: new Date().toISOString()
          },
          {
            name: "Public Utilities",
            type: "utility",
            active: true,
            description: "Electricity, water, and other utilities",
            lastUpdate: new Date().toISOString()
          },
          {
            name: "Transportation",
            type: "transport",
            active: true,
            description: "Public transportation services",
            lastUpdate: new Date().toISOString()
          }
        ]
      },
      phoneValidation: {
        contextAware: true,
        requirePhoneKeywords: false,
        allowPartialMatches: true,
        skipContextPatterns: [
          "ราคา", "บาท", "เงิน", "ค่า", "ตัว", "ชิ้น", "อัน",
          "กิโลกรัม", "กิโล", "กก.", "กรัม", "ลิตร", "เมตร", "ซม.", "มม.",
          "วันที่", "เวลา", "ที่อยู่", "บ้านเลขที่", "ห้อง", "ชั้น", "อาคาร",
          "ซอย", "ถนน", "ตรอก", "หมู่", "ตำบล", "อำเภอ", "จังหวัด",
          "รหัส", "โค้ด", "ID", "เลข", "หมายเลข", "เลขที่"
        ]
      },
      logging: {
        enabled: true,
        logLevel: "info",
        logTrustedMatches: true,
        logSuspiciousNumbers: true,
        logValidationResults: false
      },
      security: {
        enableRateLimiting: true,
        maxRequestsPerMinute: 100,
        enableIPWhitelisting: false,
        requireAuthentication: false
      },
      monitoring: {
        enabled: true,
        metricsCollection: true,
        performanceTracking: true,
        alertOnHighRiskNumbers: true
      }
    };
  }

  /**
   * ตรวจสอบว่าการตั้งค่าใช้งานได้หรือไม่
   */
  static validateConfig(config: TrustedPhoneConfig): boolean {
    try {
      // ตรวจสอบโครงสร้างพื้นฐาน
      if (!config.trustedPhoneNumbers || !config.phoneValidation || !config.logging) {
        return false;
      }

      // ตรวจสอบ sources
      if (!Array.isArray(config.trustedPhoneNumbers.sources)) {
        return false;
      }

      // ตรวจสอบ log level
      const validLogLevels = ['debug', 'info', 'warn', 'error'];
      if (!validLogLevels.includes(config.logging.logLevel)) {
        return false;
      }

      // ตรวจสอบ update interval
      if (config.trustedPhoneNumbers.updateInterval < 60000) { // ขั้นต่ำ 1 นาที
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Config validation failed:', error);
      return false;
    }
  }

  /**
   * ดึงการตั้งค่าสำหรับประเภทเบอร์โทรที่ระบุ
   */
  static getSourceConfig(type: 'government' | 'emergency' | 'bank' | 'corporate' | 'utility' | 'transport') {
    const config = this.loadConfig();
    return config.trustedPhoneNumbers.sources.find(source => source.type === type);
  }

  /**
   * เปิด/ปิดการใช้งานประเภทเบอร์โทร
   */
  static toggleSourceType(type: 'government' | 'emergency' | 'bank' | 'corporate' | 'utility' | 'transport', active: boolean): boolean {
    try {
      const config = this.loadConfig();
      const sourceIndex = config.trustedPhoneNumbers.sources.findIndex(source => source.type === type);
      
      if (sourceIndex === -1) {
        return false;
      }

      config.trustedPhoneNumbers.sources[sourceIndex].active = active;
      config.trustedPhoneNumbers.sources[sourceIndex].lastUpdate = new Date().toISOString();
      
      return this.saveConfig(config);
    } catch (error) {
      console.error(`❌ Failed to toggle source type ${type}:`, error);
      return false;
    }
  }

  /**
   * ดึงรายการประเภทเบอร์โทรที่เปิดใช้งาน
   */
  static getActiveSourceTypes(): string[] {
    const config = this.loadConfig();
    return config.trustedPhoneNumbers.sources
      .filter(source => source.active)
      .map(source => source.type);
  }

  /**
   * รีเซ็ตการตั้งค่าเป็นค่าเริ่มต้น
   */
  static resetToDefault(): boolean {
    const defaultConfig = this.getDefaultConfig();
    return this.saveConfig(defaultConfig);
  }
}