/**
 * Package-Gated Features
 * ระบบควบคุมฟีเจอร์ตามแพคเกจ
 */

import { PackageManager, PackageType } from './packageManager';
import { FlexMessage } from '@line/bot-sdk';

export class PackageGatedFeatures {
  private packageManager: PackageManager;

  constructor() {
    this.packageManager = new PackageManager();
  }

  /**
   * ตรวจสอบการใช้งานฟีเจอร์ Real-time Monitoring
   */
  async canUseRealTimeMonitoring(userId: string): Promise<boolean> {
    return this.packageManager.canUseFeature(userId, 'realTimeMonitoring');
  }

  /**
   * ตรวจสอบการใช้งานฟีเจอร์ Family Link
   */
  async canUseFamilyLink(userId: string): Promise<boolean> {
    return this.packageManager.canUseFeature(userId, 'familyLink');
  }

  /**
   * ตรวจสอบการใช้งานฟีเจอร์ SOS Button
   */
  async canUseSOS(userId: string): Promise<boolean> {
    return this.packageManager.canUseFeature(userId, 'sosButton');
  }

  /**
   * ตรวจสอบการใช้งานฟีเจอร์ Admin Dashboard
   */
  async canUseAdminDashboard(userId: string): Promise<boolean> {
    return this.packageManager.canUseFeature(userId, 'adminDashboard');
  }

  /**
   * ตรวจสอบ Monthly Checks Limit
   */
  async checkMonthlyLimit(userId: string): Promise<{
    canUse: boolean;
    remaining: number;
    limit: number;
  }> {
    const usage = this.packageManager.checkUsageLimit(userId, 'monthlyChecks');
    return {
      canUse: usage.canUse,
      remaining: usage.remaining,
      limit: usage.limit
    };
  }

  /**
   * สร้างข้อความแจ้งเตือนเมื่อใช้งานเกิน Limit
   */
  createLimitExceededMessage(userId: string): FlexMessage {
    const userPackage = this.packageManager.getUserPackage(userId);
    const packageInfo = this.packageManager.getPackageInfo(userPackage);
    
    return {
      type: "flex",
      altText: "🚫 ใช้งานเกินขีดจำกัด",
      contents: {
        type: "bubble",
        styles: {
          header: {
            backgroundColor: "#FF9800",
          }
        },
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "🚫 ใช้งานเกินขีดจำกัด",
              weight: "bold",
              color: "#FFFFFF",
              size: "xl",
              align: "center"
            }
          ]
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: `แพคเกจปัจจุบัน: ${packageInfo.name}`,
              weight: "bold",
              color: "#333333",
              size: "lg",
              align: "center",
              margin: "md"
            },
            {
              type: "text",
              text: `ตรวจสอบได้ ${packageInfo.features.monthlyChecks} ครั้ง/เดือน`,
              color: "#666666",
              size: "md",
              align: "center",
              margin: "sm"
            },
            {
              type: "separator",
              margin: "lg"
            },
            {
              type: "text",
              text: "💡 อยากใช้งานต่อ?",
              weight: "bold",
              color: "#333333",
              size: "md",
              margin: "lg"
            },
            {
              type: "text",
              text: "• อัพเกรดเป็น Family Plan",
              color: "#666666",
              size: "sm",
              margin: "sm"
            },
            {
              type: "text",
              text: "• ตรวจสอบได้ 500 ครั้ง/เดือน",
              color: "#666666",
              size: "sm",
              margin: "xs"
            },
            {
              type: "text",
              text: "• ราคา 79 บ./เดือน",
              color: "#666666",
              size: "sm",
              margin: "xs"
            }
          ]
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              action: {
                type: "postback",
                label: "🔄 อัพเกรดแพคเกจ",
                data: "upgrade_package"
              },
              style: "primary",
              color: "#4CAF50",
              margin: "md"
            },
            {
              type: "button",
              action: {
                type: "postback",
                label: "📊 ดูแพคเกจทั้งหมด",
                data: "view_packages"
              },
              style: "secondary",
              margin: "sm"
            }
          ]
        }
      }
    };
  }

  /**
   * สร้างข้อความแสดงฟีเจอร์ที่ถูกล็อค
   */
  createFeatureLockedMessage(userId: string, featureName: string): FlexMessage {
    const upgradeInfo = this.packageManager.needsUpgrade(userId, 'realTimeMonitoring');
    const suggestedPackage = this.packageManager.getPackageInfo(upgradeInfo.suggestedPackage);
    
    return {
      type: "flex",
      altText: `🔒 ${featureName} ต้องอัพเกรด`,
      contents: {
        type: "bubble",
        styles: {
          header: {
            backgroundColor: "#FF6B00",
          }
        },
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: `🔒 ${featureName}`,
              weight: "bold",
              color: "#FFFFFF",
              size: "xl",
              align: "center"
            },
            {
              type: "text",
              text: "ต้องอัพเกรดแพคเกจ",
              color: "#FFFFFF",
              size: "md",
              align: "center"
            }
          ]
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: `📦 แพคเกจที่แนะนำ`,
              weight: "bold",
              color: "#333333",
              size: "lg",
              margin: "md"
            },
            {
              type: "text",
              text: suggestedPackage.name,
              weight: "bold",
              color: "#FF6B00",
              size: "lg",
              align: "center",
              margin: "sm"
            },
            {
              type: "text",
              text: `💰 ${suggestedPackage.priceUnit}`,
              color: "#666666",
              size: "md",
              align: "center",
              margin: "sm"
            },
            {
              type: "separator",
              margin: "lg"
            },
            {
              type: "text",
              text: "✨ ฟีเจอร์พิเศษ:",
              weight: "bold",
              color: "#333333",
              size: "md",
              margin: "lg"
            },
            ...suggestedPackage.description.slice(0, 3).map(desc => ({
              type: "text" as const,
              text: `• ${desc}`,
              color: "#666666",
              size: "sm",
              margin: "xs",
              wrap: true
            }))
          ]
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              action: {
                type: "postback",
                label: "🔄 อัพเกรดเลย",
                data: `upgrade_to_${upgradeInfo.suggestedPackage}`
              },
              style: "primary",
              color: "#FF6B00",
              margin: "md"
            },
            {
              type: "button",
              action: {
                type: "postback",
                label: "📞 ติดต่อสอบถาม",
                data: "contact_sales"
              },
              style: "secondary",
              margin: "sm"
            }
          ]
        }
      }
    };
  }

  /**
   * สร้างข้อความแสดงข้อมูลแพคเกจทั้งหมด
   */
  createPackageComparisonMessage(): FlexMessage {
    const packages = this.packageManager.getAllPackages();
    
    return {
      type: "flex",
      altText: "📦 เปรียบเทียบแพคเกจ ProtectCyber",
      contents: {
        type: "carousel",
        contents: packages.map(pkg => ({
          type: "bubble",
          styles: {
            header: {
              backgroundColor: pkg.id === 'free' ? "#4CAF50" : 
                            pkg.id === 'family' ? "#FF9800" : "#2196F3",
            }
          },
          header: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: pkg.name,
                weight: "bold",
                color: "#FFFFFF",
                size: "xl",
                align: "center"
              },
              {
                type: "text",
                text: pkg.priceUnit,
                color: "#FFFFFF",
                size: "sm",
                align: "center",
                wrap: true
              }
            ]
          },
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: `🎯 ${pkg.target}`,
                weight: "bold",
                color: "#333333",
                size: "md",
                margin: "md",
                wrap: true
              },
              {
                type: "separator",
                margin: "md"
              },
              {
                type: "text",
                text: "✨ ฟีเจอร์หลัก:",
                weight: "bold",
                color: "#333333",
                size: "sm",
                margin: "md"
              },
              ...pkg.description.slice(0, 3).map(desc => ({
                type: "text" as const,
                text: `• ${desc}`,
                color: "#666666",
                size: "xs",
                margin: "xs",
                wrap: true
              }))
            ]
          },
          footer: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "button",
                action: {
                  type: "postback",
                  label: pkg.id === 'free' ? "✅ ใช้งานฟรี" : 
                        pkg.id === 'family' ? "🔄 อัพเกรด" : "📞 ติดต่อ",
                  data: pkg.id === 'free' ? "use_free" : 
                        pkg.id === 'family' ? "upgrade_family" : "contact_enterprise"
                },
                style: "primary",
                color: pkg.id === 'free' ? "#4CAF50" : 
                      pkg.id === 'family' ? "#FF9800" : "#2196F3"
              }
            ]
          }
        }))
      }
    };
  }

  /**
   * ตรวจสอบและแสดงข้อความเตือนเมื่อใช้ฟีเจอร์ที่ถูกล็อค
   */
  async checkFeatureAccess(userId: string, featureName: string): Promise<FlexMessage | null> {
    const userPackage = this.packageManager.getUserPackage(userId);
    
    switch (featureName) {
      case 'realTimeMonitoring':
        if (!await this.canUseRealTimeMonitoring(userId)) {
          return this.createFeatureLockedMessage(userId, 'การแจ้งเตือนอัตโนมัติ');
        }
        break;
        
      case 'familyLink':
        if (!await this.canUseFamilyLink(userId)) {
          return this.createFeatureLockedMessage(userId, 'การเชื่อมต่อครอบครัว');
        }
        break;
        
      case 'sosButton':
        if (!await this.canUseSOS(userId)) {
          return this.createFeatureLockedMessage(userId, 'ปุ่ม SOS ฉุกเฉิน');
        }
        break;
        
      case 'adminDashboard':
        if (!await this.canUseAdminDashboard(userId)) {
          return this.createFeatureLockedMessage(userId, 'Admin Dashboard');
        }
        break;
    }
    
    return null;
  }
}