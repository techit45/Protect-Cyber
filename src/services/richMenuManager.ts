import { RichMenuService } from './richMenu';
import { BehavioralBiometricsService } from './behavioralBiometrics';
import path from 'path';

export class RichMenuManager {
  private richMenuService: RichMenuService;
  private behavioralService: BehavioralBiometricsService;
  private mainMenuId: string | null = null;
  private elderlyMenuId: string | null = null;
  private emergencyMenuId: string | null = null;

  constructor() {
    this.richMenuService = new RichMenuService();
    this.behavioralService = new BehavioralBiometricsService();
  }

  /**
   * เริ่มต้นระบบ Rich Menu ทั้งหมด
   */
  async initializeAllRichMenus(): Promise<void> {
    try {
      console.log('🚀 Initializing all Rich Menus...');

      // ลบ Rich Menu เก่าทั้งหมดก่อน
      await this.cleanupOldRichMenus();

      // สร้าง Rich Menu ใหม่
      await this.createAllMenus();

      // ตั้งค่า Default Rich Menu
      if (this.mainMenuId) {
        await this.richMenuService.setDefaultRichMenu(this.mainMenuId);
      }

      console.log('✅ All Rich Menus initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Rich Menus:', error);
      throw error;
    }
  }

  /**
   * สร้าง Rich Menu ทั้งหมด
   */
  private async createAllMenus(): Promise<void> {
    // สร้าง Main Menu
    this.mainMenuId = await this.richMenuService.createProtectCyberRichMenu();
    console.log('✅ Main Rich Menu created:', this.mainMenuId);

    // สร้าง Elderly Menu
    this.elderlyMenuId = await this.richMenuService.createElderlyRichMenu();
    console.log('✅ Elderly Rich Menu created:', this.elderlyMenuId);

    // สร้าง Emergency Menu
    this.emergencyMenuId = await this.richMenuService.createEmergencyRichMenu();
    console.log('✅ Emergency Rich Menu created:', this.emergencyMenuId);

    // สร้างรูปภาพ
    await this.generateMenuImages();
  }

  /**
   * สร้างรูปภาพ Rich Menu
   */
  private async generateMenuImages(): Promise<void> {
    try {
      console.log('🎨 Generating Rich Menu images...');

      // สร้าง SVG files
      this.richMenuService.generateRichMenuImage('main');
      this.richMenuService.generateRichMenuImage('elderly');
      this.richMenuService.generateRichMenuImage('emergency');

      // หมายเหตุ: ในการใช้งานจริง ต้องแปลง SVG เป็น PNG และอัพโหลด
      // const mainImagePath = path.join(__dirname, '../templates/rich-menu/main-rich-menu.png');
      // await this.richMenuService.uploadRichMenuImage(this.mainMenuId!, mainImagePath);

      console.log('✅ Rich Menu images generated');
    } catch (error) {
      console.error('❌ Failed to generate images:', error);
    }
  }

  /**
   * ลบ Rich Menu เก่าทั้งหมด
   */
  private async cleanupOldRichMenus(): Promise<void> {
    try {
      const richMenus = await this.richMenuService.getRichMenuList();
      
      for (const menu of richMenus) {
        if (menu.name?.includes('ProtectCyber')) {
          await this.richMenuService.deleteRichMenu(menu.richMenuId);
          console.log(`🗑️ Deleted old Rich Menu: ${menu.name}`);
        }
      }
    } catch (error) {
      console.log('⚠️ No old Rich Menus to clean up');
    }
  }

  /**
   * ตั้งค่า Rich Menu ตามประเภทผู้ใช้
   */
  async setUserSpecificMenu(userId: string): Promise<void> {
    try {
      const isElderly = this.behavioralService.isUserElderly(userId);
      
      if (isElderly && this.elderlyMenuId) {
        await this.richMenuService.setUserRichMenu(userId, this.elderlyMenuId);
        console.log(`👴👵 Set elderly menu for user: ${userId}`);
      } else if (this.mainMenuId) {
        await this.richMenuService.setUserRichMenu(userId, this.mainMenuId);
        console.log(`👤 Set main menu for user: ${userId}`);
      }
    } catch (error) {
      console.error('❌ Failed to set user-specific menu:', error);
    }
  }

  /**
   * เปลี่ยนเป็น Emergency Rich Menu
   */
  async switchToEmergencyMenu(userId: string): Promise<void> {
    try {
      if (this.emergencyMenuId) {
        await this.richMenuService.setUserRichMenu(userId, this.emergencyMenuId);
        console.log(`🚨 Switched to emergency menu for user: ${userId}`);
      }
    } catch (error) {
      console.error('❌ Failed to switch to emergency menu:', error);
    }
  }

  /**
   * กลับไปใช้ Rich Menu ปกติ
   */
  async switchToNormalMenu(userId: string): Promise<void> {
    try {
      await this.setUserSpecificMenu(userId);
      console.log(`🔄 Switched back to normal menu for user: ${userId}`);
    } catch (error) {
      console.error('❌ Failed to switch to normal menu:', error);
    }
  }

  /**
   * จัดการ Postback เพิ่มเติมสำหรับ Rich Menu
   */
  async handleRichMenuAction(userId: string, action: string): Promise<string | null> {
    switch (action) {
      case 'learn_more':
        return this.createLearningContent();
      
      case 'emergency_contact':
        await this.switchToEmergencyMenu(userId);
        return '🚨 เปลี่ยนเป็นเมนูฉุกเฉินแล้ว\nกดปุ่มด้านล่างเพื่อติดต่อหน่วยงาน';
      
      default:
        return null;
    }
  }

  /**
   * สร้างเนื้อหาการเรียนรู้
   */
  private createLearningContent(): string {
    return `📚 เรียนรู้เพิ่มเติมเกี่ยวกับภัยไซเบอร์

🛡️ **หลักการป้องกันพื้นฐาน:**
• ไม่คลิกลิงก์จากคนแปลกหน้า
• ตรวจสอบ URL ก่อนกรอกข้อมูล
• ไม่แชร์รหัสผ่านให้ใคร

🇹🇭 **ภัยคุกคามยอดฮิตในไทย:**
• หลอกโอนเงิน "ได้รางวัล"
• แอบอ้างเป็นธนาคาร
• หลอกลงทุน "ได้กำไรแน่นอน"

📞 **ติดต่อขอความช่วยเหลือ:**
• ThaiCERT: 1441
• ตำรวจไซเบอร์: 191
• LINE: @protectcyber

พิมพ์ "เกราะไซเบอร์" เพื่อกลับเมนูหลัก`;
  }

  /**
   * ตรวจสอบสถานะ Rich Menu
   */
  async getMenuStatus(): Promise<{
    mainMenuId: string | null;
    elderlyMenuId: string | null;
    emergencyMenuId: string | null;
    totalMenus: number;
  }> {
    const richMenus = await this.richMenuService.getRichMenuList();
    
    return {
      mainMenuId: this.mainMenuId,
      elderlyMenuId: this.elderlyMenuId,
      emergencyMenuId: this.emergencyMenuId,
      totalMenus: richMenus.length
    };
  }

  /**
   * รีเซ็ต Rich Menu ทั้งหมด
   */
  async resetAllMenus(): Promise<void> {
    try {
      console.log('🔄 Resetting all Rich Menus...');
      
      await this.cleanupOldRichMenus();
      await this.initializeAllRichMenus();
      
      console.log('✅ All Rich Menus reset successfully');
    } catch (error) {
      console.error('❌ Failed to reset Rich Menus:', error);
      throw error;
    }
  }

  // Getters
  getMainMenuId(): string | null { return this.mainMenuId; }
  getElderlyMenuId(): string | null { return this.elderlyMenuId; }
  getEmergencyMenuId(): string | null { return this.emergencyMenuId; }
}