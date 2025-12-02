import { Client, PostbackAction, MessageAction, URIAction } from '@line/bot-sdk';
import fs from 'fs';
import path from 'path';

export interface RichMenuArea {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  action: PostbackAction | MessageAction | URIAction;
}

export interface RichMenuConfig {
  size: {
    width: number;
    height: number;
  };
  selected: boolean;
  name: string;
  chatBarText: string;
  areas: RichMenuArea[];
}

export class RichMenuService {
  private client: Client;

  constructor() {
    this.client = new Client({
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
      channelSecret: process.env.LINE_CHANNEL_SECRET!,
    });
  }

  /**
   * สร้าง Rich Menu หลักสำหรับ ProtectCyber
   */
  async createProtectCyberRichMenu(): Promise<string> {
    const richMenuConfig: RichMenuConfig = {
      size: {
        width: 2500,
        height: 1686
      },
      selected: true,
      name: "ProtectCyber Main Menu",
      chatBarText: "🛡️ เกราะไซเบอร์",
      areas: [
        // ตรวจสอบข้อความใหม่
        {
          bounds: { x: 0, y: 0, width: 833, height: 843 },
          action: {
            type: "postback",
            data: "check_new_message"
          }
        },
        // ตรวจสอบข้อความเก่า  
        {
          bounds: { x: 833, y: 0, width: 834, height: 843 },
          action: {
            type: "postback", 
            data: "check_recent_messages"
          }
        },
        // ขอความช่วยเหลือ
        {
          bounds: { x: 1667, y: 0, width: 833, height: 843 },
          action: {
            type: "postback",
            data: "get_help"
          }
        },
        // รายงานปัญหา
        {
          bounds: { x: 0, y: 843, width: 833, height: 843 },
          action: {
            type: "postback",
            data: "report_threat"
          }
        },
        // เรียนรู้เพิ่มเติม
        {
          bounds: { x: 833, y: 843, width: 834, height: 843 },
          action: {
            type: "postback",
            data: "learn_more"
          }
        },
        // ติดต่อฉุกเฉิน
        {
          bounds: { x: 1667, y: 843, width: 833, height: 843 },
          action: {
            type: "postback",
            data: "emergency_contact"
          }
        }
      ]
    };

    try {
      console.log('🎨 Creating ProtectCyber Rich Menu...');
      
      // สร้าง Rich Menu
      const richMenuId = await this.client.createRichMenu(richMenuConfig);
      console.log('✅ Rich Menu created with ID:', richMenuId);

      return richMenuId;
    } catch (error) {
      console.error('❌ Failed to create Rich Menu:', error);
      throw error;
    }
  }

  /**
   * อัพโหลดรูปภาพสำหรับ Rich Menu
   */
  async uploadRichMenuImage(richMenuId: string, imagePath: string): Promise<void> {
    try {
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`);
      }

      console.log('📸 Uploading Rich Menu image...');
      
      const imageBuffer = fs.readFileSync(imagePath);
      await this.client.setRichMenuImage(richMenuId, imageBuffer, 'image/png');
      
      console.log('✅ Rich Menu image uploaded successfully');
    } catch (error) {
      console.error('❌ Failed to upload Rich Menu image:', error);
      throw error;
    }
  }

  /**
   * ตั้งค่า Rich Menu เป็นค่าเริ่มต้นสำหรับผู้ใช้ทั้งหมด
   */
  async setDefaultRichMenu(richMenuId: string): Promise<void> {
    try {
      console.log('🎯 Setting default Rich Menu...');
      
      await this.client.setDefaultRichMenu(richMenuId);
      
      console.log('✅ Default Rich Menu set successfully');
    } catch (error) {
      console.error('❌ Failed to set default Rich Menu:', error);
      throw error;
    }
  }

  /**
   * ตั้งค่า Rich Menu สำหรับผู้ใช้เฉพาะ
   */
  async setUserRichMenu(userId: string, richMenuId: string): Promise<void> {
    try {
      console.log(`👤 Setting Rich Menu for user: ${userId}`);
      
      await this.client.linkRichMenuToUser(userId, richMenuId);
      
      console.log('✅ User Rich Menu set successfully');
    } catch (error) {
      console.error('❌ Failed to set user Rich Menu:', error);
      throw error;
    }
  }

  /**
   * ลบ Rich Menu
   */
  async deleteRichMenu(richMenuId: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting Rich Menu: ${richMenuId}`);
      
      await this.client.deleteRichMenu(richMenuId);
      
      console.log('✅ Rich Menu deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete Rich Menu:', error);
      throw error;
    }
  }

  /**
   * ดึงรายการ Rich Menu ทั้งหมด
   */
  async getRichMenuList(): Promise<any[]> {
    try {
      console.log('📋 Getting Rich Menu list...');
      
      const richMenus = await this.client.getRichMenuList();
      
      console.log(`✅ Found ${richMenus.length} Rich Menus`);
      return richMenus;
    } catch (error) {
      console.error('❌ Failed to get Rich Menu list:', error);
      throw error;
    }
  }

  /**
   * สร้าง Rich Menu สำหรับผู้สูงอายุ (ขนาดใหญ่ อ่านง่าย)
   */
  async createElderlyRichMenu(): Promise<string> {
    const richMenuConfig: RichMenuConfig = {
      size: {
        width: 2500,
        height: 843 // ความสูงน้อยลงเพื่อให้อ่านง่าย
      },
      selected: true,
      name: "ProtectCyber Elderly Menu",
      chatBarText: "🛡️ ป้องกันภัย",
      areas: [
        // ตรวจสอบข้อความ (ใหญ่)
        {
          bounds: { x: 0, y: 0, width: 1250, height: 843 },
          action: {
            type: "postback",
            data: "check_new_message"
          }
        },
        // ขอความช่วยเหลือ (ใหญ่)
        {
          bounds: { x: 1250, y: 0, width: 1250, height: 843 },
          action: {
            type: "postback",
            data: "get_help"
          }
        }
      ]
    };

    try {
      console.log('👴👵 Creating Elderly Rich Menu...');
      
      const richMenuId = await this.client.createRichMenu(richMenuConfig);
      console.log('✅ Elderly Rich Menu created with ID:', richMenuId);

      return richMenuId;
    } catch (error) {
      console.error('❌ Failed to create Elderly Rich Menu:', error);
      throw error;
    }
  }

  /**
   * สร้าง Rich Menu ฉุกเฉิน
   */
  async createEmergencyRichMenu(): Promise<string> {
    const richMenuConfig: RichMenuConfig = {
      size: {
        width: 2500,
        height: 843
      },
      selected: true,
      name: "ProtectCyber Emergency Menu",
      chatBarText: "🚨 ฉุกเฉิน",
      areas: [
        // โทรตำรวจ 191
        {
          bounds: { x: 0, y: 0, width: 833, height: 843 },
          action: {
            type: "uri",
            uri: "tel:191"
          }
        },
        // โทร ThaiCERT 1441
        {
          bounds: { x: 833, y: 0, width: 834, height: 843 },
          action: {
            type: "uri", 
            uri: "tel:1441"
          }
        },
        // ยืนยันปลอดภัย
        {
          bounds: { x: 1667, y: 0, width: 833, height: 843 },
          action: {
            type: "postback",
            data: "emergency_resolved"
          }
        }
      ]
    };

    try {
      console.log('🚨 Creating Emergency Rich Menu...');
      
      const richMenuId = await this.client.createRichMenu(richMenuConfig);
      console.log('✅ Emergency Rich Menu created with ID:', richMenuId);

      return richMenuId;
    } catch (error) {
      console.error('❌ Failed to create Emergency Rich Menu:', error);
      throw error;
    }
  }

  /**
   * สร้างรูปภาพ Rich Menu อัตโนมัติ (SVG to PNG)
   */
  generateRichMenuImage(type: 'main' | 'elderly' | 'emergency'): string {
    let svg = '';
    
    if (type === 'main') {
      svg = `
<svg width="2500" height="1686" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2E7D32;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="2500" height="1686" fill="url(#bg)"/>
  
  <!-- Top Row -->
  <!-- ตรวจสอบข้อความใหม่ -->
  <rect x="10" y="10" width="813" height="823" fill="#FFFFFF" rx="20" stroke="#2E7D32" stroke-width="4"/>
  <text x="416" y="350" text-anchor="middle" font-family="Arial" font-size="80" font-weight="bold" fill="#2E7D32">🔍</text>
  <text x="416" y="450" text-anchor="middle" font-family="Arial" font-size="60" font-weight="bold" fill="#2E7D32">ตรวจสอบ</text>
  <text x="416" y="520" text-anchor="middle" font-family="Arial" font-size="60" font-weight="bold" fill="#2E7D32">ข้อความใหม่</text>
  
  <!-- ตรวจสอบข้อความเก่า -->
  <rect x="843" y="10" width="814" height="823" fill="#FFFFFF" rx="20" stroke="#2E7D32" stroke-width="4"/>
  <text x="1250" y="350" text-anchor="middle" font-family="Arial" font-size="80" font-weight="bold" fill="#2E7D32">📄</text>
  <text x="1250" y="450" text-anchor="middle" font-family="Arial" font-size="60" font-weight="bold" fill="#2E7D32">ตรวจสอบ</text>
  <text x="1250" y="520" text-anchor="middle" font-family="Arial" font-size="60" font-weight="bold" fill="#2E7D32">ข้อความเก่า</text>
  
  <!-- ขอความช่วยเหลือ -->
  <rect x="1677" y="10" width="813" height="823" fill="#FFFFFF" rx="20" stroke="#2E7D32" stroke-width="4"/>
  <text x="2083" y="350" text-anchor="middle" font-family="Arial" font-size="80" font-weight="bold" fill="#2E7D32">🆘</text>
  <text x="2083" y="450" text-anchor="middle" font-family="Arial" font-size="60" font-weight="bold" fill="#2E7D32">ขอความ</text>
  <text x="2083" y="520" text-anchor="middle" font-family="Arial" font-size="60" font-weight="bold" fill="#2E7D32">ช่วยเหลือ</text>
  
  <!-- Bottom Row -->
  <!-- รายงานปัญหา -->
  <rect x="10" y="853" width="813" height="823" fill="#FFFFFF" rx="20" stroke="#2E7D32" stroke-width="4"/>
  <text x="416" y="1193" text-anchor="middle" font-family="Arial" font-size="80" font-weight="bold" fill="#2E7D32">📋</text>
  <text x="416" y="1293" text-anchor="middle" font-family="Arial" font-size="60" font-weight="bold" fill="#2E7D32">รายงาน</text>
  <text x="416" y="1363" text-anchor="middle" font-family="Arial" font-size="60" font-weight="bold" fill="#2E7D32">ปัญหา</text>
  
  <!-- เรียนรู้เพิ่มเติม -->
  <rect x="843" y="853" width="814" height="823" fill="#FFFFFF" rx="20" stroke="#2E7D32" stroke-width="4"/>
  <text x="1250" y="1193" text-anchor="middle" font-family="Arial" font-size="80" font-weight="bold" fill="#2E7D32">📚</text>
  <text x="1250" y="1293" text-anchor="middle" font-family="Arial" font-size="60" font-weight="bold" fill="#2E7D32">เรียนรู้</text>
  <text x="1250" y="1363" text-anchor="middle" font-family="Arial" font-size="60" font-weight="bold" fill="#2E7D32">เพิ่มเติม</text>
  
  <!-- ติดต่อฉุกเฉิน -->
  <rect x="1677" y="853" width="813" height="823" fill="#FFFFFF" rx="20" stroke="#FF4444" stroke-width="4"/>
  <text x="2083" y="1193" text-anchor="middle" font-family="Arial" font-size="80" font-weight="bold" fill="#FF4444">🚨</text>
  <text x="2083" y="1293" text-anchor="middle" font-family="Arial" font-size="60" font-weight="bold" fill="#FF4444">ติดต่อ</text>
  <text x="2083" y="1363" text-anchor="middle" font-family="Arial" font-size="60" font-weight="bold" fill="#FF4444">ฉุกเฉิน</text>
</svg>`;
    } else if (type === 'elderly') {
      svg = `
<svg width="2500" height="843" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2E7D32;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="2500" height="843" fill="url(#bg)"/>
  
  <!-- ตรวจสอบข้อความ -->
  <rect x="20" y="20" width="1210" height="803" fill="#FFFFFF" rx="30" stroke="#2E7D32" stroke-width="6"/>
  <text x="625" y="300" text-anchor="middle" font-family="Arial" font-size="120" font-weight="bold" fill="#2E7D32">🔍</text>
  <text x="625" y="450" text-anchor="middle" font-family="Arial" font-size="90" font-weight="bold" fill="#2E7D32">ตรวจสอบข้อความ</text>
  <text x="625" y="550" text-anchor="middle" font-family="Arial" font-size="60" fill="#666">กดเพื่อเริ่มตรวจสอบ</text>
  
  <!-- ขอความช่วยเหลือ -->
  <rect x="1270" y="20" width="1210" height="803" fill="#FFFFFF" rx="30" stroke="#FF6B6B" stroke-width="6"/>
  <text x="1875" y="300" text-anchor="middle" font-family="Arial" font-size="120" font-weight="bold" fill="#FF6B6B">🆘</text>
  <text x="1875" y="450" text-anchor="middle" font-family="Arial" font-size="90" font-weight="bold" fill="#FF6B6B">ขอความช่วยเหลือ</text>
  <text x="1875" y="550" text-anchor="middle" font-family="Arial" font-size="60" fill="#666">กดเมื่อต้องการความช่วยเหลือ</text>
</svg>`;
    } else if (type === 'emergency') {
      svg = `
<svg width="2500" height="843" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF4444;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#C62828;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="2500" height="843" fill="url(#bg)"/>
  
  <!-- โทรตำรวจ 191 -->
  <rect x="20" y="20" width="793" height="803" fill="#FFFFFF" rx="20" stroke="#C62828" stroke-width="4"/>
  <text x="416" y="250" text-anchor="middle" font-family="Arial" font-size="80" font-weight="bold" fill="#C62828">👮‍♂️</text>
  <text x="416" y="350" text-anchor="middle" font-family="Arial" font-size="70" font-weight="bold" fill="#C62828">191</text>
  <text x="416" y="450" text-anchor="middle" font-family="Arial" font-size="50" font-weight="bold" fill="#C62828">ตำรวจ</text>
  
  <!-- โทร ThaiCERT 1441 -->
  <rect x="853" y="20" width="794" height="803" fill="#FFFFFF" rx="20" stroke="#C62828" stroke-width="4"/>
  <text x="1250" y="250" text-anchor="middle" font-family="Arial" font-size="80" font-weight="bold" fill="#C62828">🛡️</text>
  <text x="1250" y="350" text-anchor="middle" font-family="Arial" font-size="70" font-weight="bold" fill="#C62828">1441</text>
  <text x="1250" y="450" text-anchor="middle" font-family="Arial" font-size="50" font-weight="bold" fill="#C62828">ThaiCERT</text>
  
  <!-- ยืนยันปลอดภัย -->
  <rect x="1687" y="20" width="793" height="803" fill="#FFFFFF" rx="20" stroke="#4CAF50" stroke-width="4"/>
  <text x="2083" y="250" text-anchor="middle" font-family="Arial" font-size="80" font-weight="bold" fill="#4CAF50">✅</text>
  <text x="2083" y="350" text-anchor="middle" font-family="Arial" font-size="60" font-weight="bold" fill="#4CAF50">ยืนยัน</text>
  <text x="2083" y="420" text-anchor="middle" font-family="Arial" font-size="60" font-weight="bold" fill="#4CAF50">ปลอดภัย</text>
</svg>`;
    }

    // สร้างโฟลเดอร์หากไม่มี
    const imageDir = path.join(__dirname, '../templates/rich-menu');
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }

    const svgPath = path.join(imageDir, `${type}-rich-menu.svg`);
    fs.writeFileSync(svgPath, svg);

    console.log(`✅ Generated ${type} Rich Menu SVG: ${svgPath}`);
    
    // หมายเหตุ: ในการใช้งานจริง ต้องแปลง SVG เป็น PNG ด้วย library เช่น sharp หรือ puppeteer
    return svgPath;
  }
}