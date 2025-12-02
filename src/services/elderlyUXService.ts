/**
 * Elderly-Friendly UX Service
 * ปรับ UI/UX ให้เหมาะกับผู้สูงอายุโดยเฉพาะ
 */

import { FlexMessage } from "@line/bot-sdk";

export interface ElderlyUXConfig {
  // Typography
  fontSize: {
    header: string;
    body: string;
    button: string;
    small: string;
  };
  
  // Colors (High Contrast)
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    background: string;
    text: string;
    textLight: string;
  };
  
  // Spacing
  spacing: {
    small: string;
    medium: string;
    large: string;
    button: string;
  };
}

export class ElderlyUXService {
  private config: ElderlyUXConfig = {
    fontSize: {
      header: "xl",     // ใหญ่มาก
      body: "lg",       // ใหญ่
      button: "md",     // ปานกลาง
      small: "sm"       // เล็ก (ใช้น้อย)
    },
    colors: {
      primary: "#2E7D32",      // เขียวเข้ม (ปลอดภัย)
      secondary: "#1976D2",    // น้ำเงิน (ข้อมูล)
      success: "#4CAF50",      // เขียวสด (ปลอดภัย)
      warning: "#FF9800",      // ส้ม (ระวัง)
      danger: "#F44336",       // แดง (อันตราย)
      background: "#FFFFFF",   // ขาวสะอาด
      text: "#212121",         // ดำเข้ม
      textLight: "#616161"     // เทาเข้ม
    },
    spacing: {
      small: "xs",
      medium: "sm", 
      large: "md",
      button: "lg"
    }
  };

  /**
   * สร้าง Welcome Message สำหรับผู้สูงอายุ
   */
  createElderlyWelcomeMessage(): FlexMessage {
    return {
      type: "flex",
      altText: "👴👵 ยินดีต้อนรับสู่เกราะไซเบอร์",
      contents: {
        type: "bubble",
        styles: {
          header: {
            backgroundColor: this.config.colors.success,
          },
          body: {
            backgroundColor: this.config.colors.background,
          }
        },
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "👴👵 ยินดีต้อนรับ",
              weight: "bold",
              color: "#FFFFFF",
              size: this.config.fontSize.header,
              align: "center"
            },
            {
              type: "text",
              text: "เกราะไซเบอร์",
              weight: "bold",
              color: "#FFFFFF", 
              size: this.config.fontSize.header,
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
              text: "ระบบช่วยตรวจสอบ",
              weight: "bold",
              color: this.config.colors.text,
              size: this.config.fontSize.body,
              align: "center",
              margin: this.config.spacing.medium
            },
            {
              type: "text",
              text: "ข้อความต้องสงสัย",
              weight: "bold",
              color: this.config.colors.text,
              size: this.config.fontSize.body,
              align: "center"
            },
            {
              type: "separator",
              margin: this.config.spacing.large
            },
            {
              type: "text",
              text: "🔍 ง่ายๆ แค่ส่งข้อความมา",
              color: this.config.colors.textLight,
              size: this.config.fontSize.body,
              align: "center",
              margin: this.config.spacing.medium,
              wrap: true
            },
            {
              type: "text",
              text: "📱 เราจะช่วยตรวจสอบให้",
              color: this.config.colors.textLight,
              size: this.config.fontSize.body,
              align: "center",
              margin: this.config.spacing.small,
              wrap: true
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
                label: "📖 วิธีใช้งาน",
                data: "elderly_tutorial"
              },
              style: "primary",
              color: this.config.colors.success,
              margin: this.config.spacing.button
            }
          ]
        }
      }
    };
  }

  /**
   * สร้าง Safety Response สำหรับผู้สูงอายุ
   */
  createElderlySafetyResponse(messageText: string): FlexMessage {
    return {
      type: "flex",
      altText: "✅ ปลอดภัย",
      contents: {
        type: "bubble",
        styles: {
          header: {
            backgroundColor: this.config.colors.success,
          }
        },
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "✅ ปลอดภัย",
              weight: "bold",
              color: "#FFFFFF",
              size: this.config.fontSize.header,
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
              text: "ข้อความนี้ดูปลอดภัย",
              weight: "bold",
              color: this.config.colors.text,
              size: this.config.fontSize.body,
              align: "center",
              margin: this.config.spacing.medium
            },
            {
              type: "text",
              text: messageText.length > 50 ? messageText.substring(0, 50) + "..." : messageText,
              color: this.config.colors.textLight,
              size: this.config.fontSize.body,
              align: "center",
              margin: this.config.spacing.medium,
              wrap: true
            },
            {
              type: "separator",
              margin: this.config.spacing.large
            },
            {
              type: "text",
              text: "💡 แต่ยังไงก็ระวังเสมอ",
              color: this.config.colors.textLight,
              size: this.config.fontSize.body,
              align: "center",
              margin: this.config.spacing.medium,
              wrap: true
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
                label: "📞 ติดต่อสอบถาม",
                data: "ask_family"
              },
              style: "secondary",
              margin: this.config.spacing.button
            }
          ]
        }
      }
    };
  }

  /**
   * สร้าง Warning Message สำหรับผู้สูงอายุ
   */
  createElderlyWarningMessage(
    warningText: string,
    recommendations: string[]
  ): FlexMessage {
    return {
      type: "flex",
      altText: "⚠️ ระวัง!",
      contents: {
        type: "bubble",
        styles: {
          header: {
            backgroundColor: this.config.colors.warning,
          }
        },
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "⚠️ ระวัง!",
              weight: "bold",
              color: "#FFFFFF",
              size: this.config.fontSize.header,
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
              text: warningText,
              weight: "bold",
              color: this.config.colors.text,
              size: this.config.fontSize.body,
              align: "center",
              margin: this.config.spacing.medium,
              wrap: true
            },
            {
              type: "separator",
              margin: this.config.spacing.large
            },
            {
              type: "text",
              text: "💡 ควรทำ:",
              weight: "bold",
              color: this.config.colors.text,
              size: this.config.fontSize.body,
              margin: this.config.spacing.medium
            },
            ...recommendations.slice(0, 3).map(rec => ({
              type: "text" as const,
              text: `• ${rec}`,
              color: this.config.colors.textLight,
              size: this.config.fontSize.body,
              margin: this.config.spacing.small,
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
                label: "📞 โทรหาลูก",
                data: "call_family"
              },
              style: "primary",
              color: this.config.colors.primary,
              margin: this.config.spacing.button
            },
            {
              type: "button",
              action: {
                type: "postback",
                label: "🆘 ขอความช่วยเหลือ",
                data: "get_help"
              },
              style: "secondary",
              margin: this.config.spacing.small
            }
          ]
        }
      }
    };
  }

  /**
   * สร้าง Critical Threat Message สำหรับผู้สูงอายุ
   */
  createElderlyCriticalThreatMessage(
    threatText: string,
    urgentActions: string[]
  ): FlexMessage {
    return {
      type: "flex",
      altText: "🚨 อันตราย!",
      contents: {
        type: "bubble",
        styles: {
          header: {
            backgroundColor: this.config.colors.danger,
          }
        },
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "🚨 อันตราย!",
              weight: "bold",
              color: "#FFFFFF",
              size: this.config.fontSize.header,
              align: "center"
            },
            {
              type: "text",
              text: "อย่าดำเนินการ",
              weight: "bold",
              color: "#FFFFFF",
              size: this.config.fontSize.body,
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
              text: threatText,
              weight: "bold",
              color: this.config.colors.text,
              size: this.config.fontSize.body,
              align: "center",
              margin: this.config.spacing.medium,
              wrap: true
            },
            {
              type: "separator",
              margin: this.config.spacing.large
            },
            {
              type: "text",
              text: "🛑 ทำทันที:",
              weight: "bold",
              color: this.config.colors.danger,
              size: this.config.fontSize.body,
              margin: this.config.spacing.medium
            },
            ...urgentActions.slice(0, 3).map(action => ({
              type: "text" as const,
              text: `• ${action}`,
              color: this.config.colors.text,
              size: this.config.fontSize.body,
              margin: this.config.spacing.small,
              wrap: true,
              weight: "bold" as const
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
                label: "📞 โทรหาลูกด่วน",
                data: "emergency_call_family"
              },
              style: "primary",
              color: this.config.colors.danger,
              margin: this.config.spacing.button
            },
            {
              type: "button",
              action: {
                type: "postback",
                label: "🚨 ขอความช่วยเหลือ",
                data: "emergency_help"
              },
              style: "secondary",
              margin: this.config.spacing.small
            }
          ]
        }
      }
    };
  }

  /**
   * สร้าง Help Menu สำหรับผู้สูงอายุ
   */
  createElderlyHelpMenu(): FlexMessage {
    return {
      type: "flex",
      altText: "🆘 ความช่วยเหลือ",
      contents: {
        type: "bubble",
        styles: {
          header: {
            backgroundColor: this.config.colors.secondary,
          }
        },
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "🆘 ความช่วยเหลือ",
              weight: "bold",
              color: "#FFFFFF",
              size: this.config.fontSize.header,
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
              text: "🔍 วิธีใช้งาน",
              weight: "bold",
              color: this.config.colors.text,
              size: this.config.fontSize.body,
              margin: this.config.spacing.medium
            },
            {
              type: "text",
              text: "1. ส่งข้อความมาให้เรา",
              color: this.config.colors.textLight,
              size: this.config.fontSize.body,
              margin: this.config.spacing.small,
              wrap: true
            },
            {
              type: "text",
              text: "2. เรื่องวิจัยตรวจสอบ",
              color: this.config.colors.textLight,
              size: this.config.fontSize.body,
              margin: this.config.spacing.small,
              wrap: true
            },
            {
              type: "text",
              text: "3. จะบอกผลให้ทราบ",
              color: this.config.colors.textLight,
              size: this.config.fontSize.body,
              margin: this.config.spacing.small,
              wrap: true
            },
            {
              type: "separator",
              margin: this.config.spacing.large
            },
            {
              type: "text",
              text: "📞 เบอร์ฉุกเฉิน",
              weight: "bold",
              color: this.config.colors.text,
              size: this.config.fontSize.body,
              margin: this.config.spacing.medium
            },
            {
              type: "text",
              text: "ตำรวจ: 191",
              color: this.config.colors.textLight,
              size: this.config.fontSize.body,
              margin: this.config.spacing.small
            },
            {
              type: "text",
              text: "พยาบาล: 1669",
              color: this.config.colors.textLight,
              size: this.config.fontSize.body,
              margin: this.config.spacing.small
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
                label: "📖 อ่านเพิ่มเติม",
                data: "elderly_learn_more"
              },
              style: "primary",
              color: this.config.colors.secondary,
              margin: this.config.spacing.button
            }
          ]
        }
      }
    };
  }

  /**
   * สร้าง Unknown Threat Message สำหรับผู้สูงอายุ
   */
  createElderlyUnknownThreatMessage(
    phoneNumbers: string[],
    websites: string[]
  ): FlexMessage {
    return {
      type: "flex",
      altText: "🟠 เจอสิ่งที่ไม่คุ้นเคย",
      contents: {
        type: "bubble",
        styles: {
          header: {
            backgroundColor: this.config.colors.warning,
          }
        },
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "🟠 เจอสิ่งแปลก",
              weight: "bold",
              color: "#FFFFFF",
              size: this.config.fontSize.header,
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
              text: "พบเบอร์หรือเว็บไซต์",
              weight: "bold",
              color: this.config.colors.text,
              size: this.config.fontSize.body,
              align: "center",
              margin: this.config.spacing.medium
            },
            {
              type: "text",
              text: "ที่ไม่คุ้นเคย",
              weight: "bold",
              color: this.config.colors.text,
              size: this.config.fontSize.body,
              align: "center"
            },
            {
              type: "separator",
              margin: this.config.spacing.large
            },
            ...(phoneNumbers.length > 0 ? [
              {
                type: "text" as const,
                text: "📱 เบอร์ที่ไม่รู้จัก:",
                weight: "bold" as const,
                color: this.config.colors.text,
                size: this.config.fontSize.body,
                margin: this.config.spacing.medium
              },
              {
                type: "text" as const,
                text: phoneNumbers.join(', '),
                color: this.config.colors.textLight,
                size: this.config.fontSize.body,
                margin: this.config.spacing.small,
                wrap: true
              }
            ] : []),
            ...(websites.length > 0 ? [
              {
                type: "text" as const,
                text: "🌐 เว็บไซต์ที่ไม่รู้จัก:",
                weight: "bold" as const,
                color: this.config.colors.text,
                size: this.config.fontSize.body,
                margin: this.config.spacing.medium
              },
              {
                type: "text" as const,
                text: websites.join(', '),
                color: this.config.colors.textLight,
                size: this.config.fontSize.body,
                margin: this.config.spacing.small,
                wrap: true
              }
            ] : []),
            {
              type: "separator",
              margin: this.config.spacing.large
            },
            {
              type: "text",
              text: "💡 ควรทำ:",
              weight: "bold",
              color: this.config.colors.text,
              size: this.config.fontSize.body,
              margin: this.config.spacing.medium
            },
            {
              type: "text",
              text: "• ไม่โทรกลับเบอร์แปลก",
              color: this.config.colors.textLight,
              size: this.config.fontSize.body,
              margin: this.config.spacing.small,
              wrap: true
            },
            {
              type: "text",
              text: "• ไม่เข้าเว็บไซต์แปลก",
              color: this.config.colors.textLight,
              size: this.config.fontSize.body,
              margin: this.config.spacing.small,
              wrap: true
            },
            {
              type: "text",
              text: "• ปรึกษาผู้เชี่ยวชาญ",
              color: this.config.colors.textLight,
              size: this.config.fontSize.body,
              margin: this.config.spacing.small,
              wrap: true
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
                label: "📞 โทรหาลูก",
                data: "call_family"
              },
              style: "primary",
              color: this.config.colors.primary,
              margin: this.config.spacing.button
            },
            {
              type: "button",
              action: {
                type: "postback",
                label: "🆘 ขอความช่วยเหลือ",
                data: "get_help"
              },
              style: "secondary",
              margin: this.config.spacing.small
            }
          ]
        }
      }
    };
  }

  /**
   * สร้าง Educational Tips สำหรับผู้สูงอายุ
   */
  createElderlyEducationalTips(tips: string[]): FlexMessage {
    return {
      type: "flex",
      altText: "💡 เคล็ดลับ",
      contents: {
        type: "bubble",
        styles: {
          header: {
            backgroundColor: this.config.colors.secondary,
          }
        },
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "💡 เคล็ดลับ",
              weight: "bold",
              color: "#FFFFFF",
              size: this.config.fontSize.header,
              align: "center"
            },
            {
              type: "text",
              text: "ความปลอดภัย",
              weight: "bold",
              color: "#FFFFFF",
              size: this.config.fontSize.body,
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
              text: "🛡️ จำไว้ให้ดี:",
              weight: "bold",
              color: this.config.colors.text,
              size: this.config.fontSize.body,
              margin: this.config.spacing.medium
            },
            ...tips.slice(0, 4).map((tip, index) => ({
              type: "text" as const,
              text: `${index + 1}. ${tip}`,
              color: this.config.colors.textLight,
              size: this.config.fontSize.body,
              margin: this.config.spacing.small,
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
                label: "📖 อ่านเพิ่มเติม",
                data: "elderly_learn_more"
              },
              style: "primary",
              color: this.config.colors.secondary,
              margin: this.config.spacing.button
            }
          ]
        }
      }
    };
  }

  /**
   * สร้าง Emergency Contact Menu สำหรับผู้สูงอายุ
   */
  createElderlyEmergencyMenu(): FlexMessage {
    return {
      type: "flex",
      altText: "🚨 ติดต่อฉุกเฉิน",
      contents: {
        type: "bubble",
        styles: {
          header: {
            backgroundColor: this.config.colors.danger,
          }
        },
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "🚨 ติดต่อฉุกเฉิน",
              weight: "bold",
              color: "#FFFFFF",
              size: this.config.fontSize.header,
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
              text: "📞 เบอร์ฉุกเฉิน:",
              weight: "bold",
              color: this.config.colors.text,
              size: this.config.fontSize.body,
              margin: this.config.spacing.medium
            },
            {
              type: "text",
              text: "ตำรวจ: 191",
              color: this.config.colors.textLight,
              size: this.config.fontSize.body,
              margin: this.config.spacing.small
            },
            {
              type: "text",
              text: "พยาบาล: 1669",
              color: this.config.colors.textLight,
              size: this.config.fontSize.body,
              margin: this.config.spacing.small
            },
            {
              type: "text",
              text: "ไฟไหม้: 199",
              color: this.config.colors.textLight,
              size: this.config.fontSize.body,
              margin: this.config.spacing.small
            },
            {
              type: "separator",
              margin: this.config.spacing.large
            },
            {
              type: "text",
              text: "👨‍👩‍👧‍👦 ติดต่อครอบครัว:",
              weight: "bold",
              color: this.config.colors.text,
              size: this.config.fontSize.body,
              margin: this.config.spacing.medium
            },
            {
              type: "text",
              text: "กดปุ่มด้านล่างเพื่อโทร",
              color: this.config.colors.textLight,
              size: this.config.fontSize.body,
              margin: this.config.spacing.small,
              wrap: true
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
                label: "📞 โทรหาลูก",
                data: "call_family"
              },
              style: "primary",
              color: this.config.colors.primary,
              margin: this.config.spacing.button
            },
            {
              type: "button",
              action: {
                type: "postback",
                label: "🚨 ขอความช่วยเหลือ",
                data: "emergency_help"
              },
              style: "secondary",
              margin: this.config.spacing.small
            }
          ]
        }
      }
    };
  }
}