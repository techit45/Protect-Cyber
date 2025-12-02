/**
 * Unknown Threat Card Generator
 * สร้าง Flex Message Card สำหรับแสดงผลภัยคุกคามที่ไม่รู้จัก
 */

import { FlexMessage } from "@line/bot-sdk";
import { UnknownThreatResult } from "./unknownThreatDetector";

export class UnknownThreatCardGenerator {
  
  /**
   * สร้าง Flex Message Card สำหรับภัยคุกคามที่ไม่รู้จัก
   */
  static createUnknownThreatCard(unknownThreatResult: UnknownThreatResult, messageText: string): FlexMessage {
    const { threatType, phoneNumbers, websites, warnings, recommendations } = unknownThreatResult;
    
    // สร้าง content สำหรับแสดงรายละเอียดภัยคุกคาม
    const threatDetails: any[] = [];
    
    // แสดงเบอร์โทรที่ไม่รู้จัก
    if (phoneNumbers.length > 0) {
      threatDetails.push({
        type: "text",
        text: "📱 เบอร์โทรที่ไม่รู้จัก:",
        weight: "bold",
        color: "#FF6B00",
        margin: "md"
      });
      
      phoneNumbers.forEach(phone => {
        threatDetails.push({
          type: "text",
          text: `• ${phone}`,
          size: "sm",
          color: "#FF6B00",
          margin: "xs"
        });
      });
    }
    
    // แสดงเว็บไซต์ที่ไม่รู้จัก
    if (websites.length > 0) {
      threatDetails.push({
        type: "text",
        text: "🌐 เว็บไซต์ที่ไม่รู้จัก:",
        weight: "bold",
        color: "#FF6B00",
        margin: "md"
      });
      
      websites.forEach(website => {
        threatDetails.push({
          type: "text",
          text: `• ${website}`,
          size: "sm",
          color: "#FF6B00",
          margin: "xs",
          wrap: true
        });
      });
    }
    
    // แสดงคำเตือน
    if (warnings.length > 0) {
      threatDetails.push({
        type: "separator",
        margin: "md"
      });
      
      threatDetails.push({
        type: "text",
        text: "⚠️ คำเตือน:",
        weight: "bold",
        color: "#FF6B00",
        margin: "md"
      });
      
      warnings.forEach(warning => {
        threatDetails.push({
          type: "text",
          text: warning,
          size: "sm",
          color: "#333333",
          margin: "xs",
          wrap: true
        });
      });
    }
    
    // แสดงคำแนะนำ
    if (recommendations.length > 0) {
      threatDetails.push({
        type: "separator",
        margin: "md"
      });
      
      threatDetails.push({
        type: "text",
        text: "💡 คำแนะนำ:",
        weight: "bold",
        color: "#4CAF50",
        margin: "md"
      });
      
      recommendations.forEach(recommendation => {
        threatDetails.push({
          type: "text",
          text: recommendation,
          size: "sm",
          color: "#333333",
          margin: "xs",
          wrap: true
        });
      });
    }
    
    // กำหนดข้อความหัวเรื่อง
    let headerText = "🟠 พบสิ่งที่ไม่คุ้นเคย";
    let altText = "⚠️ พบสิ่งที่ไม่คุ้นเคย";
    
    if (threatType === 'unknown_phone') {
      headerText = "📱 พบเบอร์โทรที่ไม่คุ้นเคย";
      altText = "📱 พบเบอร์โทรที่ไม่คุ้นเคย";
    } else if (threatType === 'unknown_website') {
      headerText = "🌐 พบเว็บไซต์ที่ไม่คุ้นเคย";
      altText = "🌐 พบเว็บไซต์ที่ไม่คุ้นเคย";
    } else if (threatType === 'both') {
      headerText = "🚨 พบเบอร์และเว็บที่ไม่คุ้นเคย";
      altText = "🚨 พบเบอร์และเว็บที่ไม่คุ้นเคย";
    }
    
    return {
      type: "flex",
      altText,
      contents: {
        type: "bubble",
        styles: {
          header: {
            backgroundColor: "#FF8800", // สีส้ม HIGH
          },
        },
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: headerText,
              weight: "bold",
              color: "#FFFFFF",
              size: "lg",
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
              text: "ข้อความที่ตรวจสอบ:",
              weight: "bold",
              color: "#333333",
              size: "sm"
            },
            {
              type: "text",
              text: messageText.length > 100 ? messageText.substring(0, 100) + "..." : messageText,
              size: "xs",
              color: "#666666",
              wrap: true,
              margin: "xs"
            },
            {
              type: "separator",
              margin: "md"
            },
            ...threatDetails
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
                label: "🆘 ขอความช่วยเหลือ",
                data: "get_help"
              },
              style: "primary",
              color: "#FF6B00"
            },
            {
              type: "button",
              action: {
                type: "postback",
                label: "📞 รายงานปัญหา",
                data: "report_threat"
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
   * สร้าง Flex Message Card แบบย่อสำหรับภัยคุกคามที่ไม่รู้จัก
   */
  static createUnknownThreatSummaryCard(unknownThreatResult: UnknownThreatResult): FlexMessage {
    const { threatType, phoneNumbers, websites } = unknownThreatResult;
    
    let summaryText = "";
    let iconEmoji = "🟠";
    
    if (threatType === 'unknown_phone') {
      summaryText = `พบเบอร์โทรที่ไม่คุ้นเคย ${phoneNumbers.length} เบอร์`;
      iconEmoji = "📱";
    } else if (threatType === 'unknown_website') {
      summaryText = `พบเว็บไซต์ที่ไม่คุ้นเคย ${websites.length} เว็บ`;
      iconEmoji = "🌐";
    } else if (threatType === 'both') {
      summaryText = `พบเบอร์และเว็บที่ไม่คุ้นเคย (${phoneNumbers.length} เบอร์, ${websites.length} เว็บ)`;
      iconEmoji = "🚨";
    }
    
    return {
      type: "flex",
      altText: `${iconEmoji} ${summaryText}`,
      contents: {
        type: "bubble",
        styles: {
          header: {
            backgroundColor: "#FF8800",
          },
        },
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: `${iconEmoji} ตรวจพบสิ่งที่ไม่คุ้นเคย`,
              weight: "bold",
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
              text: summaryText,
              weight: "bold",
              color: "#FF6B00",
              size: "sm",
              align: "center",
              wrap: true
            },
            {
              type: "text",
              text: "ระดับความเสี่ยง: สูง (HIGH)",
              size: "xs",
              color: "#666666",
              align: "center",
              margin: "sm"
            }
          ]
        },
        footer: {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "button",
              action: {
                type: "postback",
                label: "ดูรายละเอียด",
                data: "view_unknown_threat_details"
              },
              flex: 1,
              style: "primary",
              color: "#FF6B00"
            }
          ]
        }
      }
    };
  }
}