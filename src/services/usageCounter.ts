/**
 * Usage Counter Service
 * ระบบนับจำนวนการใช้งานสำหรับแพคเกจฟรี
 */

export interface UsageRecord {
  userId: string;
  month: string; // YYYY-MM format
  count: number;
  limit: number;
  resetDate: Date;
}

export class UsageCounter {
  private usageData: Map<string, UsageRecord> = new Map();
  private readonly FREE_PACKAGE_LIMIT = 50;

  /**
   * สร้าง key สำหรับ userId + month
   */
  private createKey(userId: string, month?: string): string {
    const currentMonth = month || new Date().toISOString().substr(0, 7);
    return `${userId}_${currentMonth}`;
  }

  /**
   * ตรวจสอบการใช้งานของผู้ใช้
   */
  async checkUsage(userId: string): Promise<{
    canUse: boolean;
    current: number;
    limit: number;
    remaining: number;
    resetDate: Date;
  }> {
    const key = this.createKey(userId);
    const currentMonth = new Date().toISOString().substr(0, 7);
    
    // หาข้อมูลการใช้งานหรือสร้างใหม่
    let record = this.usageData.get(key);
    
    if (!record) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      nextMonth.setHours(0, 0, 0, 0);
      
      record = {
        userId,
        month: currentMonth,
        count: 0,
        limit: this.FREE_PACKAGE_LIMIT,
        resetDate: nextMonth
      };
      
      this.usageData.set(key, record);
    }
    
    const canUse = record.count < record.limit;
    const remaining = Math.max(0, record.limit - record.count);
    
    return {
      canUse,
      current: record.count,
      limit: record.limit,
      remaining,
      resetDate: record.resetDate
    };
  }

  /**
   * เพิ่มการใช้งาน
   */
  async incrementUsage(userId: string): Promise<UsageRecord> {
    const key = this.createKey(userId);
    const usage = await this.checkUsage(userId);
    
    if (!usage.canUse) {
      throw new Error(`ใช้งานเกินขีดจำกัด ${usage.limit} ครั้ง/เดือน`);
    }
    
    const record = this.usageData.get(key)!;
    record.count += 1;
    
    console.log(`📊 User ${userId} usage: ${record.count}/${record.limit}`);
    
    return record;
  }

  /**
   * รีเซ็ตการใช้งานรายเดือน
   */
  async resetMonthlyUsage(userId: string): Promise<void> {
    const currentMonth = new Date().toISOString().substr(0, 7);
    const key = this.createKey(userId, currentMonth);
    
    this.usageData.delete(key);
    console.log(`🔄 Reset monthly usage for user: ${userId}`);
  }

  /**
   * ดึงสถิติการใช้งานทั้งหมด
   */
  async getUsageStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalUsage: number;
    averageUsage: number;
  }> {
    const records = Array.from(this.usageData.values());
    const activeUsers = records.filter(r => r.count > 0).length;
    const totalUsage = records.reduce((sum, r) => sum + r.count, 0);
    const averageUsage = activeUsers > 0 ? totalUsage / activeUsers : 0;
    
    return {
      totalUsers: records.length,
      activeUsers,
      totalUsage,
      averageUsage: Math.round(averageUsage * 100) / 100
    };
  }

  /**
   * ตรวจสอบว่าใกล้จะหมดโควต้าหรือไม่
   */
  async isNearingLimit(userId: string): Promise<{
    isNearing: boolean;
    percentage: number;
    warningThreshold: number;
  }> {
    const usage = await this.checkUsage(userId);
    const percentage = (usage.current / usage.limit) * 100;
    const warningThreshold = 80; // 80% ของขีดจำกัด
    
    return {
      isNearing: percentage >= warningThreshold,
      percentage: Math.round(percentage),
      warningThreshold
    };
  }

  /**
   * ล้างข้อมูลการใช้งานที่หมดอายุ
   */
  async cleanupExpiredUsage(): Promise<number> {
    const currentMonth = new Date().toISOString().substr(0, 7);
    let cleanedCount = 0;
    
    for (const [key, record] of this.usageData.entries()) {
      if (record.month < currentMonth) {
        this.usageData.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired usage records`);
    }
    
    return cleanedCount;
  }

  /**
   * ดูการใช้งานของผู้ใช้รายบุคคล
   */
  async getUserUsageHistory(userId: string): Promise<UsageRecord[]> {
    const records: UsageRecord[] = [];
    
    for (const [key, record] of this.usageData.entries()) {
      if (record.userId === userId) {
        records.push(record);
      }
    }
    
    return records.sort((a, b) => b.month.localeCompare(a.month));
  }
}

// Singleton instance
export const usageCounter = new UsageCounter();

// รันการล้างข้อมูลที่หมดอายุทุกวัน
setInterval(async () => {
  await usageCounter.cleanupExpiredUsage();
}, 24 * 60 * 60 * 1000); // 24 ชั่วโมง