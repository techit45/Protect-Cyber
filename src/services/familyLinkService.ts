/**
 * Family Link Service
 * ระบบเชื่อมต่อครอบครัวสำหรับแพคเกจ Family Plan
 */

import { FlexMessage } from "@line/bot-sdk";

export interface FamilyMember {
  userId: string;
  name: string;
  role: 'parent' | 'child' | 'guardian';
  joinDate: Date;
  active: boolean;
  phone?: string;
  emergencyContact: boolean;
}

export interface FamilyGroup {
  id: string;
  parentUserId: string;
  familyName: string;
  members: FamilyMember[];
  createdAt: Date;
  settings: {
    autoAlert: boolean;
    emergencyNotification: boolean;
    dailyReport: boolean;
    locationSharing: boolean;
  };
}

export interface FamilyAlert {
  id: string;
  fromUserId: string;
  toUserIds: string[];
  threatInfo: any;
  alertType: 'threat' | 'sos' | 'warning';
  timestamp: Date;
  acknowledged: boolean;
}

export class FamilyLinkService {
  private familyGroups: Map<string, FamilyGroup> = new Map();
  private userToFamily: Map<string, string> = new Map();

  /**
   * สร้างกลุ่มครอบครัว
   */
  async createFamilyGroup(parentUserId: string, familyName: string): Promise<FamilyGroup> {
    const familyId = `family_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const familyGroup: FamilyGroup = {
      id: familyId,
      parentUserId,
      familyName,
      members: [
        {
          userId: parentUserId,
          name: 'ผู้ปกครอง',
          role: 'parent',
          joinDate: new Date(),
          active: true,
          emergencyContact: true
        }
      ],
      createdAt: new Date(),
      settings: {
        autoAlert: true,
        emergencyNotification: true,
        dailyReport: true,
        locationSharing: false
      }
    };
    
    this.familyGroups.set(familyId, familyGroup);
    this.userToFamily.set(parentUserId, familyId);
    
    console.log('👨‍👩‍👧‍👦 Family group created:', familyId);
    return familyGroup;
  }

  /**
   * เชิญสมาชิกครอบครัว
   */
  async inviteFamilyMember(
    parentUserId: string, 
    memberUserId: string, 
    memberName: string, 
    role: 'child' | 'guardian'
  ): Promise<boolean> {
    const familyId = this.userToFamily.get(parentUserId);
    if (!familyId) {
      throw new Error('ไม่พบกลุ่มครอบครัว');
    }
    
    const familyGroup = this.familyGroups.get(familyId);
    if (!familyGroup) {
      throw new Error('ไม่พบข้อมูลครอบครัว');
    }
    
    // ตรวจสอบจำนวนสมาชิก (Family Plan: สูงสุด 5 คน)
    if (familyGroup.members.length >= 5) {
      throw new Error('จำนวนสมาชิกครอบครัวเกินขีดจำกัด (5 คน)');
    }
    
    // ตรวจสอบว่าเป็นสมาชิกอยู่แล้วหรือไม่
    const existingMember = familyGroup.members.find(m => m.userId === memberUserId);
    if (existingMember) {
      throw new Error('เป็นสมาชิกอยู่แล้ว');
    }
    
    // เพิ่มสมาชิกใหม่
    const newMember: FamilyMember = {
      userId: memberUserId,
      name: memberName,
      role,
      joinDate: new Date(),
      active: true,
      emergencyContact: role === 'guardian'
    };
    
    familyGroup.members.push(newMember);
    this.userToFamily.set(memberUserId, familyId);
    
    console.log('➕ Family member added:', memberUserId, 'to family', familyId);
    return true;
  }

  /**
   * ส่งการแจ้งเตือนไปยังครอบครัว
   */
  async sendFamilyAlert(
    fromUserId: string, 
    threatInfo: any, 
    alertType: 'threat' | 'sos' | 'warning'
  ): Promise<FamilyAlert> {
    const familyId = this.userToFamily.get(fromUserId);
    if (!familyId) {
      throw new Error('ไม่พบกลุ่มครอบครัว');
    }
    
    const familyGroup = this.familyGroups.get(familyId);
    if (!familyGroup) {
      throw new Error('ไม่พบข้อมูลครอบครัว');
    }
    
    // หาสมาชิกที่จะส่งแจ้งเตือน
    const alertTargets = familyGroup.members
      .filter(m => m.userId !== fromUserId && m.active)
      .map(m => m.userId);
    
    const alert: FamilyAlert = {
      id: `alert_${Date.now()}`,
      fromUserId,
      toUserIds: alertTargets,
      threatInfo,
      alertType,
      timestamp: new Date(),
      acknowledged: false
    };
    
    console.log('🚨 Family alert sent:', alert.id);
    return alert;
  }

  /**
   * ดึงข้อมูลสมาชิกครอบครัว
   */
  async getFamilyMembers(userId: string): Promise<FamilyMember[]> {
    const familyId = this.userToFamily.get(userId);
    if (!familyId) {
      return [];
    }
    
    const familyGroup = this.familyGroups.get(familyId);
    return familyGroup?.members || [];
  }

  /**
   * ตรวจสอบว่าเป็นสมาชิกครอบครัวหรือไม่
   */
  isFamilyMember(userId: string): boolean {
    return this.userToFamily.has(userId);
  }

  /**
   * ตรวจสอบว่าเป็นผู้ปกครองหรือไม่
   */
  isParent(userId: string): boolean {
    const familyId = this.userToFamily.get(userId);
    if (!familyId) return false;
    
    const familyGroup = this.familyGroups.get(familyId);
    return familyGroup?.parentUserId === userId;
  }

  /**
   * สร้างข้อความเชิญเข้าร่วมครอบครัว
   */
  createFamilyInviteMessage(familyName: string, inviterName: string): FlexMessage {
    return {
      type: "flex",
      altText: "📧 เชิญเข้าร่วมครอบครัว",
      contents: {
        type: "bubble",
        styles: {
          header: {
            backgroundColor: "#4CAF50",
          }
        },
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "📧 เชิญเข้าร่วมครอบครัว",
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
              text: `${inviterName}`,
              weight: "bold",
              color: "#333333",
              size: "lg",
              align: "center",
              margin: "md"
            },
            {
              type: "text",
              text: "เชิญคุณเข้าร่วมครอบครัว",
              color: "#666666",
              size: "md",
              align: "center"
            },
            {
              type: "text",
              text: `"${familyName}"`,
              weight: "bold",
              color: "#4CAF50",
              size: "lg",
              align: "center",
              margin: "md"
            },
            {
              type: "separator",
              margin: "lg"
            },
            {
              type: "text",
              text: "💡 ข้อดีที่จะได้รับ:",
              weight: "bold",
              color: "#333333",
              size: "md",
              margin: "lg"
            },
            {
              type: "text",
              text: "• ได้รับการแจ้งเตือนภัยคุกคาม",
              color: "#666666",
              size: "sm",
              margin: "sm"
            },
            {
              type: "text",
              text: "• ครอบครัวช่วยเหลือกันได้",
              color: "#666666",
              size: "sm",
              margin: "xs"
            },
            {
              type: "text",
              text: "• ระบบ SOS ฉุกเฉิน",
              color: "#666666",
              size: "sm",
              margin: "xs"
            },
            {
              type: "text",
              text: "• รายงานความปลอดภัย",
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
                label: "✅ ตอบรับคำเชิญ",
                data: "accept_family_invite"
              },
              style: "primary",
              color: "#4CAF50",
              margin: "md"
            },
            {
              type: "button",
              action: {
                type: "postback",
                label: "❌ ปฏิเสธ",
                data: "decline_family_invite"
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
   * สร้างข้อความแจ้งเตือนครอบครัว
   */
  createFamilyThreatAlert(
    fromMemberName: string, 
    threatInfo: any, 
    alertType: 'threat' | 'sos' | 'warning'
  ): FlexMessage {
    const alertIcon = alertType === 'sos' ? '🚨' : alertType === 'threat' ? '⚠️' : '🔔';
    const alertColor = alertType === 'sos' ? '#FF4444' : alertType === 'threat' ? '#FF9800' : '#2196F3';
    
    return {
      type: "flex",
      altText: `${alertIcon} แจ้งเตือนครอบครัว`,
      contents: {
        type: "bubble",
        styles: {
          header: {
            backgroundColor: alertColor,
          }
        },
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: `${alertIcon} แจ้งเตือนครอบครัว`,
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
              text: `สมาชิก: ${fromMemberName}`,
              weight: "bold",
              color: "#333333",
              size: "lg",
              margin: "md"
            },
            {
              type: "text",
              text: alertType === 'sos' ? 'ขอความช่วยเหลือฉุกเฉิน' : 
                    alertType === 'threat' ? 'พบภัยคุกคาม' : 'แจ้งเตือนทั่วไป',
              color: "#666666",
              size: "md",
              margin: "sm"
            },
            {
              type: "separator",
              margin: "lg"
            },
            {
              type: "text",
              text: "📋 รายละเอียด:",
              weight: "bold",
              color: "#333333",
              size: "md",
              margin: "lg"
            },
            {
              type: "text",
              text: threatInfo.description || 'ไม่มีรายละเอียดเพิ่มเติม',
              color: "#666666",
              size: "sm",
              margin: "sm",
              wrap: true
            },
            {
              type: "text",
              text: `⏰ เวลา: ${new Date().toLocaleString('th-TH')}`,
              color: "#666666",
              size: "xs",
              margin: "md"
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
                label: "📞 ติดต่อกลับ",
                data: `contact_family_member`
              },
              style: "primary",
              color: alertColor,
              margin: "md"
            },
            {
              type: "button",
              action: {
                type: "postback",
                label: "✅ รับทราบแล้ว",
                data: "acknowledge_family_alert"
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
   * สร้างข้อความแสดงสมาชิกครอบครัว
   */
  createFamilyMembersMessage(familyGroup: FamilyGroup): FlexMessage {
    return {
      type: "flex",
      altText: "👨‍👩‍👧‍👦 สมาชิกครอบครัว",
      contents: {
        type: "bubble",
        styles: {
          header: {
            backgroundColor: "#4CAF50",
          }
        },
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "👨‍👩‍👧‍👦 สมาชิกครอบครัว",
              weight: "bold",
              color: "#FFFFFF",
              size: "xl",
              align: "center"
            },
            {
              type: "text",
              text: familyGroup.familyName,
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
              text: `👥 จำนวนสมาชิก: ${familyGroup.members.length}/5`,
              weight: "bold",
              color: "#333333",
              size: "md",
              margin: "md"
            },
            {
              type: "separator",
              margin: "md"
            },
            ...familyGroup.members.map(member => ({
              type: "box" as const,
              layout: "horizontal" as const,
              contents: [
                {
                  type: "text" as const,
                  text: member.role === 'parent' ? '👨‍👩‍👧‍👦' : 
                        member.role === 'guardian' ? '👨‍👩‍👧‍👦' : '👶',
                  size: "sm" as const,
                  flex: 1
                },
                {
                  type: "text" as const,
                  text: member.name,
                  size: "sm" as const,
                  flex: 4,
                  weight: "bold" as const
                },
                {
                  type: "text" as const,
                  text: member.active ? '🟢' : '🔴',
                  size: "sm" as const,
                  flex: 1,
                  align: "end" as const
                }
              ],
              margin: "sm" as const
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
                label: "➕ เชิญสมาชิกใหม่",
                data: "invite_family_member"
              },
              style: "primary",
              color: "#4CAF50",
              margin: "md"
            },
            {
              type: "button",
              action: {
                type: "postback",
                label: "⚙️ ตั้งค่าครอบครัว",
                data: "family_settings"
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
   * สร้างรายงานสรุปสำหรับครอบครัว
   */
  async generateFamilyReport(familyId: string): Promise<any> {
    const familyGroup = this.familyGroups.get(familyId);
    if (!familyGroup) {
      throw new Error('ไม่พบข้อมูลครอบครัว');
    }
    
    // TODO: ดึงข้อมูลจากฐานข้อมูล
    const report = {
      familyName: familyGroup.familyName,
      totalMembers: familyGroup.members.length,
      activeMembers: familyGroup.members.filter(m => m.active).length,
      alertsThisWeek: 0, // Mock data
      threatsDetected: 0, // Mock data
      safetyScore: 85, // Mock data
      recommendations: [
        'ควรติดตั้งแอป LINE บนมือถือทุกเครื่อง',
        'ตั้งค่าการแจ้งเตือนให้เปิดอยู่เสมอ',
        'อบรมสมาชิกครอบครัวเรื่องการรู้เท่าทันภัยคุกคาม'
      ]
    };
    
    return report;
  }
}