import {
  Client,
  WebhookEvent,
  TextMessage,
  FlexMessage,
  MessageAPIResponseBase,
} from "@line/bot-sdk";
import { ThreatDetectorService, ThreatAnalysisResult } from "./threatDetector";
import { SessionManager } from "./sessionManager";
import { MessageStorage, StoredMessage } from "./messageStorage";
import { RealTimeThreatDetectionService, RealTimeThreatEvent } from "./realTimeThreatDetection";
import { RichMenuManager } from "./richMenuManager";
import { UnknownThreatCardGenerator } from "./unknownThreatCardGenerator";
import { ElderlyUXService } from "./elderlyUXService";
import { ElderlyThreatTextGenerator } from "./elderlyThreatTextGenerator";
import { usageCounter } from "./usageCounter";

export class LineBotService {
  private client: Client;
  private threatDetector: ThreatDetectorService;
  private sessionManager: SessionManager;
  private messageStorage: MessageStorage;
  private realTimeThreatDetection: RealTimeThreatDetectionService;
  private richMenuManager: RichMenuManager;
  private elderlyUX: ElderlyUXService;

  constructor() {
    this.client = new Client({
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
      channelSecret: process.env.LINE_CHANNEL_SECRET!,
    });

    this.threatDetector = new ThreatDetectorService();
    this.sessionManager = new SessionManager();
    this.messageStorage = new MessageStorage();
    this.realTimeThreatDetection = new RealTimeThreatDetectionService();
    this.richMenuManager = new RichMenuManager();
    this.elderlyUX = new ElderlyUXService();
    
    // Set up real-time threat detection event handlers
    this.setupThreatDetectionEvents();
    
    // Initialize Rich Menus (only if enabled)
    if (process.env.RICH_MENU_ENABLED === 'true') {
      this.initializeRichMenus();
    }
  }

  private setupThreatDetectionEvents(): void {
    // Handle real-time threat detection events
    this.realTimeThreatDetection.on('threatDetected', this.handleThreatDetected.bind(this));
    this.realTimeThreatDetection.on('alertGenerated', this.handleAlertGenerated.bind(this));
    this.realTimeThreatDetection.on('emergencyTriggered', this.handleEmergencyTriggered.bind(this));
    
    console.log('🔔 Real-time threat detection events set up');
  }

  private async initializeRichMenus(): Promise<void> {
    try {
      console.log('🎨 Initializing Rich Menus...');
      await this.richMenuManager.initializeAllRichMenus();
      console.log('✅ Rich Menus initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Rich Menus:', error);
      // Don't throw error - Rich Menu is not critical for core functionality
    }
  }

  private async handleThreatDetected(event: RealTimeThreatEvent): Promise<void> {
    console.log('🚨 Threat detected for user:', event.userId);
    
    // Send additional warnings for high-risk threats
    if (event.emergencyLevel === 'critical' || event.emergencyLevel === 'high') {
      const warningMessage = this.createEmergencyWarningMessage(event);
      await this.client.pushMessage(event.userId, warningMessage);
    }
    
    // Send educational tips if available
    if (event.educationalTips.length > 0) {
      const educationalMessage = this.createEducationalTipsMessage(event.educationalTips);
      await this.client.pushMessage(event.userId, educationalMessage);
    }
  }

  private async handleAlertGenerated(alert: any): Promise<void> {
    console.log('📢 Alert generated:', alert.alertType);
    
    // Handle family alerts
    if (alert.alertType === 'family_notification') {
      // In production, this would send notifications to family members
      console.log('👨‍👩‍👧‍👦 Family alert triggered for user:', alert.userId);
    }
  }

  private async handleEmergencyTriggered(alert: any): Promise<void> {
    console.log('🚨 Emergency triggered for user:', alert.userId);
    
    // Send emergency assistance message
    const emergencyMessage = this.createEmergencyAssistanceMessage();
    await this.client.pushMessage(alert.userId, emergencyMessage);
  }

  private async handleEmergencyResolved(replyToken: string, userId: string): Promise<void> {
    const confirmationMessage: FlexMessage = {
      type: "flex",
      altText: "✅ ยืนยันความปลอดภัย",
      contents: {
        type: "bubble" as const,
        styles: {
          header: {
            backgroundColor: "#4CAF50",
          },
        },
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "✅ ยืนยันความปลอดภัย",
              weight: "bold" as const,
              color: "#FFFFFF",
              size: "xl",
            },
          ],
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "ขอบคุณที่แจ้งให้ทราบว่าคุณปลอดภัยแล้ว",
              wrap: true,
              color: "#4CAF50",
              weight: "bold" as const,
            },
            {
              type: "text" as const,
              text: "เราจะยกเลิกการแจ้งเตือนฉุกเฉิน หากต้องการความช่วยเหลือเพิ่มเติม สามารถพิมพ์ 'ช่วยตรวจ' ได้ตลอดเวลา",
              wrap: true,
              margin: "md" as const,
            },
          ],
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "🔍 ตรวจสอบข้อความอื่น",
                data: "check_another",
              },
              style: "primary" as const,
              color: "#4CAF50",
            },
          ],
        },
      },
    };

    await this.client.replyMessage(replyToken, confirmationMessage);
    console.log("✅ Emergency resolved confirmation sent for user:", userId);
  }

  async handleWebhook(events: WebhookEvent[]): Promise<void> {
    const promises = events.map((event) => this.handleEvent(event));
    await Promise.all(promises);
  }

  private async handleEvent(event: WebhookEvent): Promise<void> {
    try {
      switch (event.type) {
        case "message":
          await this.handleMessage(event);
          break;
        case "postback":
          await this.handlePostback(event);
          break;
        case "follow":
          await this.handleFollow(event);
          break;
        case "unfollow":
          await this.handleUnfollow(event);
          break;
        default:
          console.log("Unhandled event type:", event.type);
      }
    } catch (error) {
      console.error("Error handling LINE event:", error);
    }
  }

  private async handleMessage(event: any): Promise<void> {
    console.log("🔄 Processing message event:", event);

    if (event.message.type !== "text") {
      console.log(`📎 Non-text message received: ${event.message.type} - ignoring silently`);
      // ไม่ตอบกลับเมื่อได้รับไฟล์/รูปภาพ/สติกเกอร์
      return;
    }

    const userId = event.source.userId;
    const messageText = event.message.text.trim();
    const messageId = event.message.id;

    console.log("📨 Message received:", {
      userId,
      messageText: messageText.substring(0, 50),
      messageId,
    });

    try {
      // Check if user typed trigger word
      if (messageText === "ช่วยตรวจ" || messageText.includes("ช่วยตรวจ") || 
          messageText === "ตรวจสอบ" || messageText.includes("ตรวจสอบ")) {
        console.log("🎯 Trigger word detected:", messageText);
        
        const optionsMessage = this.createOptionsMessage(userId);
        await this.client.replyMessage(event.replyToken, optionsMessage);
        console.log("📤 Check options message sent");
        return;
      }

      // Check for Rich Menu commands (text-based)
      if (messageText === "ตรวจสอบข้อความใหม่") {
        console.log("🎯 Rich Menu: ตรวจสอบข้อความใหม่");
        this.sessionManager.updateSessionState(userId, 'WAITING_FOR_MESSAGE_TO_CHECK');
        const promptMessage = this.createPromptMessage();
        await this.client.replyMessage(event.replyToken, promptMessage);
        return;
      } else if (messageText === "ช่วยเหลือและสนับสนุน") {
        console.log("🎯 Rich Menu: ช่วยเหลือและสนับสนุน");
        await this.sendHelpAndSupportMessage(userId, event.replyToken);
        return;
      } else if (messageText === "ตั้งค่าระบบ") {
        console.log("🎯 Rich Menu: ตั้งค่าระบบ");
        await this.sendSettingsMenu(userId, event.replyToken);
        return;
      } else if (messageText === "ความรู้และการศึกษา") {
        console.log("🎯 Rich Menu: ความรู้และการศึกษา");
        await this.sendKnowledgeCenter(userId, event.replyToken);
        return;
      }

      // Store message for potential future analysis (always store)
      this.messageStorage.storeMessage(userId, messageText);
      console.log("💬 Message received and stored");

      // Check if user is in interactive mode (waiting for message to check)
      if (this.sessionManager.isWaitingForMessage(userId)) {
        console.log("🔍 User in interactive mode - analyzing provided message");
        
        // ตรวจสอบการใช้งาน
        const usage = await usageCounter.checkUsage(userId);
        if (!usage.canUse) {
          console.log(`⚠️ User ${userId} exceeded usage limit: ${usage.current}/${usage.limit}`);
          
          const limitMessage = this.createUsageLimitMessage(usage);
          await this.client.replyMessage(event.replyToken, limitMessage);
          
          // Reset session state
          this.sessionManager.resetSession(userId);
          return;
        }
        
        // เพิ่มการใช้งาน
        await usageCounter.incrementUsage(userId);
        console.log(`📊 Usage incremented for user ${userId}: ${usage.current + 1}/${usage.limit}`);
        
        // Reset session state
        this.sessionManager.resetSession(userId);
        
        // Run real-time comprehensive analysis
        const threatEvent = await this.realTimeThreatDetection.analyzeMessageRealTime(
          userId, 
          messageText,
          {
            typingDuration: undefined, // Could be tracked from LINE webhook timing
            characterCount: messageText.length,
            errors: undefined // Could be estimated from message patterns
          }
        );
        
        // Use the analysis from real-time detection
        const analysis = threatEvent.analysis;
        
        console.log("🔍 Analysis result:", {
          userId,
          riskLevel: analysis.riskLevel,
          threatType: analysis.threatType,
          confidence: analysis.confidence,
        });

        // Send response for ALL risk levels (including SAFE)
        const response = this.createThreatResponse(analysis);
        await this.client.replyMessage(event.replyToken, response);
        console.log("✅ Analysis response sent successfully");
        
        // ตรวจสอบว่าใกล้หมดการใช้งานหรือไม่
        const nearingLimit = await usageCounter.isNearingLimit(userId);
        if (nearingLimit.isNearing) {
          const warningMessage = this.createNearingLimitWarning(usage);
          await this.client.pushMessage(userId, warningMessage);
        }
        
        return;
      }

      // Normal mode - message already stored above
      // Note: We don't auto-analyze messages unless user is in interactive mode
      console.log("💬 Normal message stored (no auto-analysis)");
      
    } catch (error) {
      console.error("❌ Error processing message:", error);
      
      // Reset session on error
      this.sessionManager.resetSession(userId);

      // Send error response
      const errorResponse: FlexMessage = {
        type: "flex",
        altText: "❌ เกิดข้อผิดพลาด",
        contents: {
          type: "bubble" as const,
          styles: {
            header: {
              backgroundColor: "#FF6B6B",
            },
          },
          header: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "❌ เกิดข้อผิดพลาด",
                weight: "bold" as const,
                color: "#FFFFFF",
                size: "xl",
              },
            ],
          },
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "ขออภัย เกิดข้อผิดพลาดในการประมวลผล",
                wrap: true,
                color: "#FF6B6B",
                weight: "bold" as const,
              },
              {
                type: "text" as const,
                text: "กรุณาลองใหม่อีกครั้ง หรือพิมพ์ 'ช่วยตรวจ' เพื่อเริ่มใหม่",
                wrap: true,
                margin: "md" as const,
              },
            ],
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "🔄 เริ่มใหม่",
                  data: "check_another",
                },
                style: "primary" as const,
                color: "#FF6B6B",
              },
            ],
          },
        },
      };

      try {
        await this.client.replyMessage(event.replyToken, errorResponse);
        console.log("📤 Error response sent");
      } catch (replyError) {
        console.error("❌ Failed to send error response:", replyError);
      }
    }
  }

  private async handlePostback(event: any): Promise<void> {
    const userId = event.source.userId;
    const data = event.postback.data;

    console.log("🔔 Postback received:", { userId, data, timestamp: new Date().toISOString() });

    // Handle postback actions
    if (data === "get_help") {
      await this.sendHelpMessage(userId);
    } else if (data === "report_threat") {
      await this.sendReportConfirmation(userId);
    } else if (data === "check_another") {
      const optionsMessage = this.createOptionsMessage(userId);
      await this.client.replyMessage(event.replyToken, optionsMessage);
    } else if (data === "check_new_message") {
      this.sessionManager.updateSessionState(userId, 'WAITING_FOR_MESSAGE_TO_CHECK');
      const promptMessage = this.createPromptMessage();
      await this.client.replyMessage(event.replyToken, promptMessage);
    } else if (data === "check_recent_messages") {
      console.log("🔍 DEBUG: check_recent_messages triggered for user:", userId);
      try {
        const recentMessage = this.createRecentMessagesSelection(userId);
        console.log("🔍 DEBUG: recentMessage created successfully");
        await this.client.replyMessage(event.replyToken, recentMessage);
        console.log("🔍 DEBUG: replyMessage sent successfully");
      } catch (error) {
        console.error("❌ DEBUG: Error in check_recent_messages:", error);
        throw error;
      }
    } else if (data.startsWith("check_msg_")) {
      const messageId = data.replace("check_msg_", "");
      await this.handleMessageSelection(event.replyToken, userId, messageId);
    } else if (data === "emergency_resolved") {
      await this.handleEmergencyResolved(event.replyToken, userId);
    } else if (data === "contact_support") {
      // ติดต่อสอบถาม
      await this.client.replyMessage(event.replyToken, {
        type: "text",
        text: "📞 ติดต่อสอบถาม:\nTel: 02-XXX-XXXX\nEmail: support@protectcyber.com\n\nหรือส่งข้อความใน LINE OA นี้"
      });
    } else if (data === "back_to_menu") {
      // กลับเมนูหลัก
      const optionsMessage = this.createOptionsMessage(userId);
      await this.client.replyMessage(event.replyToken, optionsMessage);
    } else if (data === "help_support") {
      // ช่วยเหลือและสนับสนุน
      await this.sendHelpAndSupportMessage(userId, event.replyToken);
    } else if (data === "view_history") {
      // ดูประวัติการตรวจสอบ
      await this.sendHistoryMessage(userId, event.replyToken);
    } else if (data === "settings_menu") {
      // ตั้งค่าระบบ
      await this.sendSettingsMenu(userId, event.replyToken);
    } else if (data === "knowledge_center") {
      // ความรู้และการศึกษา
      await this.sendKnowledgeCenter(userId, event.replyToken);
    } else if (data === "learn_more" || data === "emergency_contact") {
      // Handle Rich Menu specific actions
      const response = await this.richMenuManager.handleRichMenuAction(userId, data);
      if (response) {
        await this.client.replyMessage(event.replyToken, {
          type: "text",
          text: response
        });
      }
    } else if (data === "learn_scam_detection") {
      // เรียนรู้การตรวจจับการหลอกลวง
      await this.sendScamDetectionLearning(userId, event.replyToken);
    } else if (data === "latest_scam_patterns") {
      // รูปแบบการหลอกลวงล่าสุด
      await this.sendLatestScamPatterns(userId, event.replyToken);
    } else if (data === "knowledge_quiz") {
      // แบบทดสอบความรู้
      await this.sendKnowledgeQuiz(userId, event.replyToken);
    } else if (data === "adjust_settings") {
      // ปรับตั้งค่า
      await this.sendAdvancedSettings(userId, event.replyToken);
    } else if (data === "report_problem") {
      // รายงานปัญหา
      await this.sendProblemReport(userId, event.replyToken);
    } else if (data === "get_help") {
      // ขอความช่วยเหลือ
      await this.sendHelpMessage(userId, event.replyToken);
    } else if (data === "call_police_191") {
      // โทรแจ้งตำรวจ 191
      await this.sendEmergencyContact(userId, event.replyToken, "police");
    } else if (data === "call_thaicert_1441") {
      // โทรแจ้ง ThaiCERT 1441
      await this.sendEmergencyContact(userId, event.replyToken, "thaicert");
    } else if (data === "confirm_safe") {
      // ยืนยันปลอดภัย
      await this.sendSafeConfirmation(userId, event.replyToken);
    } else if (data.startsWith("quiz_answer_")) {
      // จัดการคำตอบแบบทดสอบ
      const answer = data.replace("quiz_answer_", "");
      await this.handleQuizAnswer(userId, event.replyToken, answer);
    } else if (data === "start_learning_module") {
      // เริ่มโมดูลการเรียนรู้
      await this.sendLearningModule(userId, event.replyToken);
    } else if (data === "watch_tutorial_videos") {
      // ดูวิดีโอสอน
      await this.sendTutorialVideos(userId, event.replyToken);
    } else if (data === "change_language") {
      // เปลี่ยนภาษา
      await this.sendLanguageSelection(userId, event.replyToken);
    } else if (data === "adjust_sensitivity") {
      // ปรับความอ่อนไหว
      await this.sendSensitivitySettings(userId, event.replyToken);
    } else if (data === "notification_settings") {
      // ตั้งค่าการแจ้งเตือน
      await this.sendNotificationSettings(userId, event.replyToken);
    } else if (data === "view_detailed_patterns") {
      // ดูรายละเอียดรูปแบบการหลอกลวง
      await this.sendDetailedScamPatterns(userId, event.replyToken);
    } else if (data === "report_false_detection") {
      // รายงานการตรวจจับผิด
      await this.sendFalseDetectionReport(userId, event.replyToken);
    } else if (data === "report_technical_issue") {
      // รายงานปัญหาทางเทคนิค
      await this.sendTechnicalIssueReport(userId, event.replyToken);
    } else if (data === "contact_support_team") {
      // ติดต่อทีมสนับสนุน
      await this.sendSupportTeamContact(userId, event.replyToken);
    } else if (data.startsWith("set_language_")) {
      // จัดการการเปลี่ยนภาษา
      const language = data.replace("set_language_", "");
      await this.handleLanguageChange(userId, event.replyToken, language);
    } else if (data.startsWith("set_sensitivity_")) {
      // จัดการการปรับความอ่อนไหว
      const level = data.replace("set_sensitivity_", "");
      await this.handleSensitivityChange(userId, event.replyToken, level);
    } else if (data.startsWith("toggle_") || data === "disable_all_notifications") {
      // จัดการการตั้งค่าการแจ้งเตือน
      await this.handleNotificationToggle(userId, event.replyToken, data);
    } else if (data === "view_more_patterns") {
      // ดูรูปแบบการหลอกลวงเพิ่มเติม
      await this.sendMoreScamPatterns(userId, event.replyToken);
    } else if (data.startsWith("report_false_")) {
      // จัดการรายงานการตรวจจับผิด
      const reportType = data.replace("report_false_", "");
      await this.handleFalseDetectionReport(userId, event.replyToken, reportType);
    } else if (data.startsWith("report_")) {
      // จัดการรายงานปัญหาทางเทคนิค
      await this.handleTechnicalReport(userId, event.replyToken, data);
    } else if (data === "start_support_chat") {
      // เริ่มแชทกับทีมสนับสนุน
      await this.startSupportChat(userId, event.replyToken);
    } else if (data.startsWith("learn_")) {
      // จัดการเนื้อหาการเรียนรู้
      const topic = data.replace("learn_", "");
      await this.handleLearningContent(userId, event.replyToken, topic);
    } else if (data === "more_protection_tips") {
      // เคล็ดลับป้องกันเพิ่มเติม
      await this.sendMoreProtectionTips(userId, event.replyToken);
    } else if (data === "quick_check") {
      // ตรวจสอบด่วน
      await this.handleQuickCheck(userId, event.replyToken);
    } else if (data === "quick_help") {
      // ช่วยเหลือด่วน
      await this.handleQuickHelp(userId, event.replyToken);
    } else if (data === "check_message_elderly") {
      // ตรวจสอบข้อความสำหรับผู้สูงอายุ
      await this.handleElderlyCheck(userId, event.replyToken);
    } else if (data === "get_help_elderly") {
      // ช่วยเหลือสำหรับผู้สูงอายุ
      await this.handleElderlyHelp(userId, event.replyToken);
    } else {
      console.log("❓ DEBUG: Unhandled postback data:", data);
      // Send acknowledgment so user knows something happened
      try {
        await this.client.replyMessage(event.replyToken, {
          type: "text",
          text: `🔧 DEBUG: ได้รับคำสั่ง "${data}" แต่ยังไม่รองรับ`
        });
      } catch (err) {
        console.error("❌ Failed to send debug message:", err);
      }
    }
  }

  private async handleFollow(event: any): Promise<void> {
    const userId = event.source.userId;

    console.log("👋 New follower:", userId);

    // Set user-specific Rich Menu
    await this.richMenuManager.setUserSpecificMenu(userId);

    // Send welcome message
    const welcomeMessage = this.createWelcomeMessage();
    await this.client.replyMessage(event.replyToken, welcomeMessage);
  }

  private async handleUnfollow(event: any): Promise<void> {
    const userId = event.source.userId;
    console.log("👋 User unfollowed:", userId);
  }

  private createThreatResponse(
    analysis: ThreatAnalysisResult
  ): TextMessage | FlexMessage {
    const { riskLevel, threatType, recommendations, suspiciousKeywords, urls } =
      analysis;

    // ตรวจสอบว่ามี unknown threat หรือไม่ - ใช้ Elderly UX
    if (analysis.thaiAnalysis?.unknownThreatResult?.isUnknownThreat) {
      console.log('🟠 Creating elderly unknown threat response');
      return this.elderlyUX.createElderlyUnknownThreatMessage(
        analysis.thaiAnalysis.unknownThreatResult.phoneNumbers,
        analysis.thaiAnalysis.unknownThreatResult.websites
      );
    }

    // Create different responses based on risk level - ใช้ Elderly UX
    switch (riskLevel) {
      case "CRITICAL":
        return this.elderlyUX.createElderlyCriticalThreatMessage(
          ElderlyThreatTextGenerator.getCriticalThreatText(analysis),
          ElderlyThreatTextGenerator.getCriticalUrgentActions(analysis)
        );
      case "HIGH":
        return this.elderlyUX.createElderlyWarningMessage(
          ElderlyThreatTextGenerator.getHighThreatText(analysis),
          recommendations
        );
      case "MEDIUM":
        return this.elderlyUX.createElderlyWarningMessage(
          ElderlyThreatTextGenerator.getMediumThreatText(analysis),
          recommendations
        );
      case "LOW":
        return this.elderlyUX.createElderlyWarningMessage(
          "พบสิ่งที่ต้องระวัง",
          recommendations
        );
      case "SAFE":
        return this.elderlyUX.createElderlySafetyResponse(
          ElderlyThreatTextGenerator.getSafetyMessageText(analysis)
        );
      default:
        return this.elderlyUX.createElderlySafetyResponse("ข้อความนี้ดูปลอดภัย");
    }
  }

  private createCriticalThreatResponse(
    analysis: ThreatAnalysisResult
  ): FlexMessage {
    return {
      type: "flex",
      altText: "🚨 พบภัยคุกคามร้ายแรง!",
      contents: {
        type: "bubble" as const,
        styles: {
          header: {
            backgroundColor: "#FF4444",
          },
        },
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "🚨 อันตรายร้ายแรง!",
              weight: "bold" as const,
              color: "#FFFFFF",
              size: "xl",
            },
          ],
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: `ประเภท: ${this.getThreatTypeText(analysis.threatType)}`,
              weight: "bold" as const,
              color: "#FF4444",
              size: "md",
            },
            {
              type: "separator" as const,
              margin: "md" as const,
            },
            {
              type: "text" as const,
              text: "คำแนะนำ:",
              weight: "bold" as const,
              margin: "md" as const,
            },
            ...analysis.recommendations.slice(0, 3).map((rec) => ({
              type: "text" as const,
              text: rec,
              wrap: true,
              margin: "sm" as const,
            })),
            ...(analysis.thaiThreatCategory ? [{
              type: "separator" as const,
              margin: "md" as const,
            }, {
              type: "text" as const,
              text: `📋 ประเภทภัย: ${analysis.thaiThreatCategory.nameTh}`,
              size: "sm",
              color: "#666666",
              wrap: true,
            }] : []),
            ...(analysis.elderlyWarnings && analysis.elderlyWarnings.length > 0 ? [{
              type: "separator" as const,
              margin: "md" as const,
            }, {
              type: "text" as const,
              text: "👴👵 คำแนะนำสำหรับผู้สูงอายุ:",
              weight: "bold" as const,
              size: "sm",
              color: "#FF8800",
            }, ...analysis.elderlyWarnings.slice(0, 2).map(warning => ({
              type: "text" as const,
              text: warning,
              size: "sm",
              wrap: true,
              margin: "xs",
            }))] : []),
            ...(analysis.suspiciousKeywords.length > 0
              ? [
                  {
                    type: "separator" as const,
                    margin: "md" as const,
                  },
                  {
                    type: "text" as const,
                    text: `คำที่น่าสงสัย: ${analysis.suspiciousKeywords.join(
                      ", "
                    )}`,
                    size: "sm",
                    color: "#999999",
                    wrap: true,
                  },
                ]
              : []),
          ],
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "🆘 ขอความช่วยเหลือ",
                data: "get_help",
              },
              style: "primary" as const,
              color: "#FF4444",
            },
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "📢 แจ้งภัยคุกคาม",
                data: "report_threat",
              },
              style: "secondary" as const,
            },
          ],
        },
      },
    };
  }

  private createHighThreatResponse(
    analysis: ThreatAnalysisResult
  ): FlexMessage {
    return {
      type: "flex",
      altText: "⚠️ พบภัยคุกคามสูง",
      contents: {
        type: "bubble" as const,
        styles: {
          header: {
            backgroundColor: "#FF8800",
          },
        },
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "⚠️ ระวังอันตราย!",
              weight: "bold" as const,
              color: "#FFFFFF",
              size: "xl",
            },
          ],
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: `ประเภท: ${this.getThreatTypeText(analysis.threatType)}`,
              weight: "bold" as const,
              color: "#FF8800",
            },
            {
              type: "separator" as const,
              margin: "md" as const,
            },
            ...analysis.recommendations.slice(0, 3).map((rec) => ({
              type: "text" as const,
              text: rec,
              wrap: true,
              margin: "sm" as const,
            })),
            ...(analysis.thaiThreatCategory ? [{
              type: "separator" as const,
              margin: "md" as const,
            }, {
              type: "text" as const,
              text: `📋 ประเภทภัย: ${analysis.thaiThreatCategory.nameTh}`,
              size: "sm",
              color: "#666666",
              wrap: true,
            }] : []),
            ...(analysis.elderlyWarnings && analysis.elderlyWarnings.length > 0 ? [{
              type: "separator" as const,
              margin: "md" as const,
            }, {
              type: "text" as const,
              text: "👴👵 คำแนะนำสำหรับผู้สูงอายุ:",
              weight: "bold" as const,
              size: "sm",
              color: "#FF8800",
            }, ...analysis.elderlyWarnings.slice(0, 2).map(warning => ({
              type: "text" as const,
              text: warning,
              size: "sm",
              wrap: true,
              margin: "xs",
            }))] : []),
          ],
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "🆘 ขอคำแนะนำ",
                data: "get_help",
              },
              style: "primary" as const,
              color: "#FF8800",
            },
          ],
        },
      },
    };
  }

  private createMediumThreatResponse(
    analysis: ThreatAnalysisResult
  ): FlexMessage {
    return {
      type: "flex",
      altText: "🔍 ตรวจพบความเสี่ยง",
      contents: {
        type: "bubble" as const,
        styles: {
          header: {
            backgroundColor: "#FF9800",
          },
        },
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "🔍 ตรวจพบความเสี่ยง",
              weight: "bold" as const,
              color: "#FFFFFF",
              size: "xl",
            },
          ],
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: `ประเภท: ${this.getThreatTypeText(analysis.threatType)}`,
              weight: "bold" as const,
              color: "#FF9800",
              size: "md",
            },
            {
              type: "separator" as const,
              margin: "md" as const,
            },
            {
              type: "text" as const,
              text: "คำแนะนำ:",
              weight: "bold" as const,
              margin: "md" as const,
            },
            ...analysis.recommendations.slice(0, 3).map((rec) => ({
              type: "text" as const,
              text: rec,
              wrap: true,
              margin: "sm" as const,
            })),
            ...(analysis.thaiThreatCategory ? [{
              type: "separator" as const,
              margin: "md" as const,
            }, {
              type: "text" as const,
              text: `📋 ประเภทภัย: ${analysis.thaiThreatCategory.nameTh}`,
              size: "sm",
              color: "#666666",
              wrap: true,
            }] : []),
            ...(analysis.elderlyWarnings && analysis.elderlyWarnings.length > 0 ? [{
              type: "separator" as const,
              margin: "md" as const,
            }, {
              type: "text" as const,
              text: "👴👵 คำแนะนำสำหรับผู้สูงอายุ:",
              weight: "bold" as const,
              size: "sm",
              color: "#FF8800",
            }, ...analysis.elderlyWarnings.slice(0, 2).map(warning => ({
              type: "text" as const,
              text: warning,
              size: "sm",
              wrap: true,
              margin: "xs",
            }))] : []),
            ...(analysis.suspiciousKeywords.length > 0
              ? [
                  {
                    type: "separator" as const,
                    margin: "md" as const,
                  },
                  {
                    type: "text" as const,
                    text: `คำที่น่าสงสัย: ${analysis.suspiciousKeywords.join(", ")}`,
                    size: "sm",
                    color: "#999999",
                    wrap: true,
                  },
                ]
              : []),
          ],
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "💡 ตรวจสอบข้อความอื่น",
                data: "check_another",
              },
              style: "primary" as const,
              color: "#FF9800",
            },
          ],
        },
      },
    };
  }

  private createWelcomeMessage(): FlexMessage {
    return this.elderlyUX.createElderlyWelcomeMessage();
  }

  private createOldWelcomeMessage(): FlexMessage {
    return {
      type: "flex",
      altText: "ยินดีต้อนรับสู่เกราะไซเบอร์",
      contents: {
        type: "bubble" as const,
        styles: {
          header: {
            backgroundColor: "#4CAF50",
          },
        },
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "🛡️ เกราะไซเบอร์",
              weight: "bold" as const,
              color: "#FFFFFF",
              size: "xl",
            },
            {
              type: "text" as const,
              text: "AI ป้องกันภัยไซเบอร์",
              color: "#FFFFFF",
              size: "sm",
            },
          ],
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "ยินดีต้อนรับสู่ 👋",
              weight: "bold" as const,
              size: "lg" as const,
            },
            {
              type: "text" as const,
              text: "บริการปกป้องคุณจากภัยคุกคามออนไลน์ด้วย AI ที่ฉลาดและเข้าใจภาษาไทย",
              wrap: true,
              margin: "md" as const,
            },
            {
              type: "separator" as const,
              margin: "md" as const,
            },
            {
              type: "text" as const,
              text: "📋 วิธีใช้งาน:",
              weight: "bold" as const,
              margin: "md" as const,
            },
            {
              type: "text" as const,
              text: "1. ส่งข้อความที่ต้องการตรวจสอบ\n2. รับคำแนะนำแบบทันที\n3. ปลอดภัยจากคำแนะนำ",
              wrap: true,
              margin: "sm" as const,
            },
          ],
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "ส่งข้อความมาเลย!",
              align: "center",
              color: "#4CAF50",
              weight: "bold" as const,
            },
          ],
        },
      },
    };
  }

  private getThreatTypeText(threatType: string): string {
    const types: { [key: string]: string } = {
      PHISHING: "ฟิชชิ่ง (ขโมยข้อมูล)",
      SCAM: "การพนัน/ขโมยเงิน",
      SPAM: "สแปม",
      ROMANCE_SCAM: "ขโมยใจ",
      INVESTMENT_FRAUD: "ขโมยลงทุน",
      SAFE: "ปลอดภัย",
    };
    return types[threatType] || threatType;
  }


  private async sendHelpMessage(userId: string, replyToken?: string): Promise<void> {
    const message: FlexMessage = {
      type: "flex",
      altText: "🆘 ช่วยเหลือฉุกเฉิน",
      contents: {
        type: "bubble" as const,
        styles: {
          header: {
            backgroundColor: "#FF4444",
          },
        },
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "🆘 ช่วยเหลือฉุกเฉิน",
              weight: "bold" as const,
              color: "#FFFFFF",
              size: "xl",
            },
          ],
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "📞 หมายเลขด่วน:",
              weight: "bold" as const,
              color: "#FF4444",
              size: "lg" as const,
            },
            {
              type: "text" as const,
              text: "• ตำรวจไซเบอร์: 1441\n• ตำรวจข้อมูลอาชญากรรม: 1111\n• ศูนย์รับเรื่องร้องเรียน: 191",
              wrap: true,
              margin: "md" as const,
            },
            {
              type: "separator" as const,
              margin: "lg" as const,
            },
            {
              type: "text" as const,
              text: "💡 เคล็ดลับสำคัญ:",
              weight: "bold" as const,
              color: "#FF4444",
              margin: "lg" as const,
            },
            {
              type: "text" as const,
              text: "• ไม่ให้ข้อมูลส่วนตัวกับคนแปลกหน้า\n• ปฏิเสธข้อมูลเงินทองและรหัสผ่านทุกครั้ง\n• ตรวจสอบก่อนคลิกลิงก์หรือดาวน์โหลดแอป",
              wrap: true,
              margin: "md" as const,
            },
          ],
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "🔍 ตรวจสอบข้อความอื่น",
                data: "check_another",
              },
              style: "secondary" as const,
            },
          ],
        },
      },
    };

    if (replyToken) {
      await this.client.replyMessage(replyToken, message as any);
    } else {
      await this.client.pushMessage(userId, message);
    }
  }

  private async sendReportConfirmation(userId: string): Promise<void> {
    const message: FlexMessage = {
      type: "flex",
      altText: "✅ ขอบคุณสำหรับการแจ้ง",
      contents: {
        type: "bubble" as const,
        styles: {
          header: {
            backgroundColor: "#4CAF50",
          },
        },
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "✅ รายงานสำเร็จ",
              weight: "bold" as const,
              color: "#FFFFFF",
              size: "xl",
            },
          ],
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "ขอบคุณสำหรับการแจ้งภัยคุกคาม",
              weight: "bold" as const,
              color: "#4CAF50",
              size: "lg" as const,
            },
            {
              type: "separator" as const,
              margin: "md" as const,
            },
            {
              type: "text" as const,
              text: "ข้อมูลของคุณจะถูกส่งไปยังหน่วยงานที่เกี่ยวข้องเพื่อดำเนินการต่อไป",
              wrap: true,
              margin: "md" as const,
            },
            {
              type: "text" as const,
              text: "🛡️ ช่วยกันปกป้องคนไทยจากภัยไซเบอร์",
              wrap: true,
              margin: "md" as const,
              color: "#4CAF50",
              weight: "bold" as const,
            },
          ],
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "🔍 ตรวจสอบข้อความอื่น",
                data: "check_another",
              },
              style: "primary" as const,
              color: "#4CAF50",
            },
          ],
        },
      },
    };

    await this.client.pushMessage(userId, message);
  }

  private createOptionsMessage(userId: string): FlexMessage {
    const messageCount = this.messageStorage.getUserMessageCount(userId);
    console.log(`📊 User ${userId} has ${messageCount} stored messages`);
    
    return {
      type: "flex",
      altText: "เลือกวิธีตรวจสอบ",
      contents: {
        type: "bubble" as const,
        styles: {
          header: {
            backgroundColor: "#2196F3",
          },
        },
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "🔍 เกราะไซเบอร์",
              weight: "bold" as const,
              color: "#FFFFFF",
              size: "xl",
            },
          ],
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "ต้องการตรวจสอบข้อความแบบไหน?",
              weight: "bold" as const,
              size: "lg" as const,
              color: "#2196F3",
            },
            {
              type: "text" as const,
              text: "💡 เคล็ดลับ: พิมพ์ \"ช่วยตรวจ\" ได้ตลอดเวลา",
              size: "xs" as const,
              color: "#999999",
              margin: "sm" as const,
            },
            {
              type: "separator" as const,
              margin: "md" as const,
            },
          ],
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          spacing: "sm",
          contents: [
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "📝 ตรวจสอบข้อความใหม่",
                data: "check_new_message",
              },
              style: "primary" as const,
              color: "#2196F3",
            },
            ...(messageCount > 0 ? [{
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: `📄 ตรวจสอบข้อความเก่า (${messageCount} ข้อความ)`,
                data: "check_recent_messages",
              },
              style: "secondary" as const,
            }] : []),
          ],
        },
      },
    };
  }

  private createPromptMessage(): FlexMessage {
    return {
      type: "flex",
      altText: "ต้องการตรวจสอบข้อความไหน?",
      contents: {
        type: "bubble" as const,
        styles: {
          header: {
            backgroundColor: "#2196F3",
          },
        },
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "🔍 เกราะไซเบอร์พร้อมช่วย",
              weight: "bold" as const,
              color: "#FFFFFF",
              size: "xl",
            },
          ],
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "ต้องการตรวจสอบข้อความไหนครับ?",
              weight: "bold" as const,
              size: "lg" as const,
              color: "#2196F3",
            },
            {
              type: "separator" as const,
              margin: "md" as const,
            },
            {
              type: "text" as const,
              text: "กรุณาส่งข้อความที่ต้องการตรวจสอบมาในข้อความถัดไป",
              wrap: true,
              margin: "md" as const,
            },
            {
              type: "text" as const,
              text: "📝 ตัวอย่าง:\n• ข้อความ SMS ที่สงสัย\n• ข้อความ LINE ที่ได้รับ\n• โฆษณาที่น่าสงสัย",
              wrap: true,
              margin: "md" as const,
              size: "sm",
              color: "#666666",
            },
          ],
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "รอข้อความจากคุณ... ⏳",
              align: "center",
              color: "#2196F3",
              weight: "bold" as const,
              size: "sm",
            },
          ],
        },
      },
    };
  }

  private createSafeResponse(analysis: ThreatAnalysisResult): FlexMessage {
    return {
      type: "flex",
      altText: "✅ ปลอดภัย!",
      contents: {
        type: "bubble" as const,
        styles: {
          header: {
            backgroundColor: "#4CAF50",
          },
        },
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "✅ ปลอดภัย!",
              weight: "bold" as const,
              color: "#FFFFFF",
              size: "xl",
            },
          ],
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "ประเภท: ปลอดภัย",
              weight: "bold" as const,
              color: "#4CAF50",
              size: "md",
            },
            {
              type: "separator" as const,
              margin: "md" as const,
            },
            {
              type: "text" as const,
              text: "คำแนะนำ:",
              weight: "bold" as const,
              margin: "md" as const,
            },
            {
              type: "text" as const,
              text: "• ข้อความนี้ดูปลอดภัย\n• ไม่พบสิ่งที่น่าสงสัย\n• สามารถใช้งานได้ตามปกติ",
              wrap: true,
              margin: "sm" as const,
            },
          ],
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "💡 ตรวจสอบข้อความอื่น",
                data: "check_another",
              },
              style: "primary" as const,
              color: "#4CAF50",
            },
          ],
        },
      },
    };
  }

  private createLowThreatResponse(analysis: ThreatAnalysisResult): FlexMessage {
    return {
      type: "flex",
      altText: "🟡 ความเสี่ยงต่ำ",
      contents: {
        type: "bubble" as const,
        styles: {
          header: {
            backgroundColor: "#FFC107",
          },
        },
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "🟡 **ความเสี่ยงต่ำ**",
              weight: "bold" as const,
              color: "#FFFFFF",
              size: "xl",
            },
          ],
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "แม้ว่าข้อความนี้จะมีความเสี่ยงต่ำ แต่ควรระวัง",
              wrap: true,
              margin: "md" as const,
            },
            {
              type: "separator" as const,
              margin: "md" as const,
            },
            {
              type: "text" as const,
              text: "**คำแนะนำ:**",
              weight: "bold" as const,
              margin: "md" as const,
            },
            {
              type: "text" as const,
              text: "✅ ข้อความนี้ดูปลอดภัย",
              wrap: true,
              margin: "sm" as const,
              color: "#4CAF50",
            },
            {
              type: "text" as const,
              text: "💡 พิมพ์ 'ช่วยตรวจ' เพื่อตรวจสอบข้อความอื่น",
              wrap: true,
              margin: "md" as const,
              size: "sm",
              color: "#666666",
            },
          ],
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "💡 ตรวจสอบข้อความอื่น",
                data: "check_another",
              },
              style: "primary" as const,
              color: "#FFC107",
            },
          ],
        },
      },
    };
  }

  private createRecentMessagesSelection(userId: string): FlexMessage {
    const recentMessages = this.messageStorage.getRecentMessages(userId, 5);
    console.log(`📋 Found ${recentMessages.length} recent messages for user ${userId}`);
    
    if (recentMessages.length === 0) {
      return {
        type: "flex",
        altText: "ไม่มีข้อความเก่า",
        contents: {
          type: "bubble" as const,
          styles: {
            header: {
              backgroundColor: "#FF9800",
            },
          },
          header: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "📄 ไม่มีข้อความเก่า",
                weight: "bold" as const,
                color: "#FFFFFF",
                size: "xl",
              },
            ],
          },
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "ไม่มีข้อความเก่าที่บันทึกไว้",
                wrap: true,
                color: "#FF9800",
                weight: "bold" as const,
              },
              {
                type: "text" as const,
                text: "กรุณาส่งข้อความก่อน แล้วจึงจะสามารถตรวจสอบข้อความเก่าได้",
                wrap: true,
                margin: "md" as const,
              },
            ],
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "📝 ตรวจสอบข้อความใหม่",
                  data: "check_new_message",
                },
                style: "primary" as const,
                color: "#FF9800",
              },
            ],
          },
        },
      };
    }

    // Limit to 3 messages to avoid button limit issues
    const limitedMessages = recentMessages.slice(0, 3);
    const messageButtons = limitedMessages.map((msg, index) => ({
      type: "button" as const,
      action: {
        type: "postback" as const,
        label: `${index + 1}. ${msg.preview}`,
        data: `check_msg_${msg.id}`,
      },
      style: "secondary" as const,
    }));

    // Add back button (keep all buttons as secondary for consistency)
    messageButtons.push({
      type: "button" as const,
      action: {
        type: "postback" as const,
        label: "🔙 กลับไปเลือกใหม่",
        data: "check_another",
      },
      style: "secondary" as const,
    });

    return {
      type: "flex",
      altText: "เลือกข้อความที่ต้องการตรวจสอบ",
      contents: {
        type: "bubble" as const,
        styles: {
          header: {
            backgroundColor: "#FF9800",
          },
        },
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "📄 ข้อความล่าสุด",
              weight: "bold" as const,
              color: "#FFFFFF",
              size: "xl",
            },
          ],
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "เลือกข้อความที่ต้องการตรวจสอบ:",
              weight: "bold" as const,
              margin: "md" as const,
            },
          ],
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          spacing: "sm",
          contents: messageButtons,
        },
      },
    };
  }

  private async handleMessageSelection(replyToken: string, userId: string, messageId: string): Promise<void> {
    const message = this.messageStorage.getMessageById(userId, messageId);
    
    if (!message) {
      const errorMessage: FlexMessage = {
        type: "flex",
        altText: "❌ ข้อความไม่พบ",
        contents: {
          type: "bubble" as const,
          styles: {
            header: {
              backgroundColor: "#FF6B6B",
            },
          },
          header: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "❌ ข้อความไม่พบ",
                weight: "bold" as const,
                color: "#FFFFFF",
                size: "xl",
              },
            ],
          },
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "ข้อความที่เลือกไม่พบ อาจถูกลบไปแล้ว",
                wrap: true,
                color: "#FF6B6B",
              },
            ],
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "🔍 กลับไปเลือกข้อความใหม่",
                  data: "check_recent_messages",
                },
                style: "primary" as const,
                color: "#FF6B6B",
              },
            ],
          },
        },
      };
      await this.client.replyMessage(replyToken, errorMessage);
      return;
    }

    console.log(`🔍 Analyzing selected message: ${message.preview}`);
    
    // Run real-time analysis on selected message
    const threatEvent = await this.realTimeThreatDetection.analyzeMessageRealTime(
      userId, 
      message.text
    );
    
    // Use the analysis from real-time detection
    const analysis = threatEvent.analysis;
    
    console.log("🔍 Analysis result:", {
      userId,
      riskLevel: analysis.riskLevel,
      threatType: analysis.threatType,
      confidence: analysis.confidence,
    });

    // Send response
    const response = this.createThreatResponse(analysis);
    await this.client.replyMessage(replyToken, response);
    console.log("✅ Analysis response sent successfully");
  }

  private createEmergencyWarningMessage(event: RealTimeThreatEvent): FlexMessage {
    return {
      type: "flex",
      altText: "🚨 แจ้งเตือนฉุกเฉิน!",
      contents: {
        type: "bubble" as const,
        styles: {
          header: {
            backgroundColor: "#DC143C",
          },
        },
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "🚨 แจ้งเตือนฉุกเฉิน!",
              weight: "bold" as const,
              color: "#FFFFFF",
              size: "xl",
            },
          ],
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: `ตรวจพบภัยคุกคามระดับ ${event.emergencyLevel.toUpperCase()}`,
              weight: "bold" as const,
              color: "#DC143C",
              size: "lg" as const,
            },
            {
              type: "separator" as const,
              margin: "md" as const,
            },
            {
              type: "text" as const,
              text: "คำแนะนำเร่งด่วน:",
              weight: "bold" as const,
              margin: "md" as const,
            },
            ...event.analysis.recommendations.slice(0, 3).map((rec) => ({
              type: "text" as const,
              text: `• ${rec}`,
              wrap: true,
              margin: "sm" as const,
              color: "#DC143C",
            })),
            ...(event.behavioralAnalysis.isDuressDetected ? [{
              type: "separator" as const,
              margin: "md" as const,
            }, {
              type: "text" as const,
              text: "⚠️ ตรวจพบสัญญาณการถูกบีบบังคับ",
              weight: "bold" as const,
              color: "#FF8800",
              wrap: true,
            }] : []),
            ...(event.thaiIntelligence.elderlyWarnings.length > 0 ? [{
              type: "separator" as const,
              margin: "md" as const,
            }, {
              type: "text" as const,
              text: "👴👵 คำเตือนสำหรับผู้สูงอายุ:",
              weight: "bold" as const,
              color: "#FF8800",
            }, ...event.thaiIntelligence.elderlyWarnings.slice(0, 2).map(warning => ({
              type: "text" as const,
              text: `• ${warning}`,
              wrap: true,
              margin: "sm" as const,
              size: "sm",
            }))] : [])
          ],
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "🆘 ขอความช่วยเหลือ",
                data: "get_help",
              },
              style: "primary" as const,
              color: "#DC143C",
            },
          ],
        },
      },
    };
  }

  private createEducationalTipsMessage(tips: any[]): FlexMessage {
    return {
      type: "flex",
      altText: "💡 เคล็ดลับความปลอดภัย",
      contents: {
        type: "bubble" as const,
        styles: {
          header: {
            backgroundColor: "#4CAF50",
          },
        },
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "💡 เคล็ดลับความปลอดภัย",
              weight: "bold" as const,
              color: "#FFFFFF",
              size: "xl",
            },
          ],
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "แนะนำสำหรับคุณ:",
              weight: "bold" as const,
              margin: "md" as const,
            },
            ...tips.slice(0, 3).map((tip) => ({
              type: "text" as const,
              text: `• ${tip.tip}`,
              wrap: true,
              margin: "sm" as const,
            })),
          ],
        },
      },
    };
  }

  private createEmergencyAssistanceMessage(): FlexMessage {
    return {
      type: "flex",
      altText: "🆘 ความช่วยเหลือฉุกเฉิน",
      contents: {
        type: "bubble" as const,
        styles: {
          header: {
            backgroundColor: "#FF4444",
          },
        },
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "🆘 ความช่วยเหลือฉุกเฉิน",
              weight: "bold" as const,
              color: "#FFFFFF",
              size: "xl",
            },
          ],
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "ระบบตรวจพบสถานการณ์ฉุกเฉินที่อาจต้องการความช่วยเหลือ",
              wrap: true,
              margin: "md" as const,
            },
            {
              type: "separator" as const,
              margin: "md" as const,
            },
            {
              type: "text" as const,
              text: "📞 หมายเลขฉุกเฉิน:",
              weight: "bold" as const,
              margin: "md" as const,
            },
            {
              type: "text" as const,
              text: "• ตำรวจไซเบอร์: 1441\n• ศูนย์รับเรื่องร้องเรียน: 191\n• หมายเลขฉุกเฉิน: 199",
              wrap: true,
              margin: "sm" as const,
            },
          ],
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "✅ ฉันปลอดภัยแล้ว",
                data: "emergency_resolved",
              },
              style: "primary" as const,
              color: "#4CAF50",
            },
          ],
        },
      },
    };
  }

  /**
   * สร้างข้อความแสดงข้อจำกัดการใช้งาน
   */
  private createUsageLimitMessage(usage: any): FlexMessage {
    return {
      type: "flex",
      altText: "🚫 ใช้งานเกินขีดจำกัด",
      contents: {
        type: "bubble" as const,
        styles: {
          header: {
            backgroundColor: "#FF6B6B",
          }
        },
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "🚫 ใช้งานเกินขีดจำกัด",
              weight: "bold" as const,
              color: "#FFFFFF",
              size: "xl",
              align: "center"
            }
          ]
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "🔢 การใช้งาน",
              weight: "bold" as const,
              color: "#333333",
              size: "lg" as const,
              align: "center",
              margin: "md" as const
            },
            {
              type: "text" as const,
              text: `ใช้งานได้ ${usage.limit} ครั้ง/เดือน`,
              color: "#666666",
              size: "md",
              align: "center",
              margin: "sm" as const
            },
            {
              type: "text" as const,
              text: `ปัจจุบัน: ${usage.current}/${usage.limit}`,
              color: "#FF6B6B",
              size: "md",
              align: "center",
              weight: "bold" as const,
              margin: "sm" as const
            },
            {
              type: "separator" as const,
              margin: "lg" as const
            },
            {
              type: "text" as const,
              text: "📅 รีเซ็ตการใช้งาน",
              weight: "bold" as const,
              color: "#333333",
              size: "md",
              margin: "lg" as const
            },
            {
              type: "text" as const,
              text: `${usage.resetDate.toLocaleDateString('th-TH', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}`,
              color: "#666666",
              size: "sm",
              margin: "sm" as const
            },
            {
              type: "separator" as const,
              margin: "lg" as const
            },
            {
              type: "text" as const,
              text: "💡 ต้องการใช้งานต่อ?",
              weight: "bold" as const,
              color: "#333333",
              size: "md",
              margin: "lg" as const
            },
            {
              type: "text" as const,
              text: "รอจนกว่าจะรีเซ็ต หรือติดต่อสอบถามเพิ่มเติม",
              color: "#666666",
              size: "sm",
              margin: "sm" as const,
              wrap: true
            }
          ]
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "📞 ติดต่อสอบถาม",
                data: "contact_support"
              },
              style: "primary" as const,
              color: "#FF9800",
              margin: "md" as const
            },
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "🏠 กลับเมนูหลัก",
                data: "back_to_menu"
              },
              style: "secondary" as const,
              margin: "sm" as const
            }
          ]
        }
      }
    };
  }

  /**
   * สร้างข้อความเตือนใกล้หมดการใช้งาน
   */
  private createNearingLimitWarning(usage: any): FlexMessage {
    return {
      type: "flex",
      altText: "⚠️ ใกล้หมดการใช้งาน",
      contents: {
        type: "bubble" as const,
        styles: {
          header: {
            backgroundColor: "#FF9800",
          }
        },
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "⚠️ ใกล้หมดการใช้งาน",
              weight: "bold" as const,
              color: "#FFFFFF",
              size: "xl",
              align: "center"
            }
          ]
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: `เหลือ ${usage.remaining} ครั้ง`,
              weight: "bold" as const,
              color: "#FF9800",
              size: "lg" as const,
              align: "center",
              margin: "md" as const
            },
            {
              type: "text" as const,
              text: `จาก ${usage.limit} ครั้ง/เดือน`,
              color: "#666666",
              size: "md",
              align: "center",
              margin: "sm" as const
            },
            {
              type: "text" as const,
              text: "กรุณาใช้งานอย่างระมัดระวัง",
              color: "#666666",
              size: "sm",
              align: "center",
              margin: "md" as const,
              wrap: true
            }
          ]
        }
      }
    };
  }

  // Public methods for external use
  async sendMessage(
    userId: string,
    message: TextMessage | FlexMessage
  ): Promise<MessageAPIResponseBase> {
    return await this.client.pushMessage(userId, message);
  }

  async broadcastMessage(
    message: TextMessage | FlexMessage
  ): Promise<MessageAPIResponseBase> {
    return await this.client.broadcast(message);
  }

  /**
   * ส่งข้อความช่วยเหลือและสนับสนุน (สำหรับ Rich Menu)
   */
  private async sendHelpAndSupportMessage(userId: string, replyToken: string): Promise<void> {
    const message: FlexMessage = {
      type: "flex",
      altText: "🆘 ช่วยเหลือและสนับสนุน",
      contents: {
        type: "bubble" as const,
        styles: {
          header: {
            backgroundColor: "#1976D2",
          },
        },
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "🆘 ช่วยเหลือและสนับสนุน",
              weight: "bold" as const,
              color: "#FFFFFF",
              size: "xl",
            },
          ],
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "📞 ติดต่อฉุกเฉิน:",
              weight: "bold" as const,
              color: "#1976D2",
              size: "lg" as const,
            },
            {
              type: "text" as const,
              text: "• ตำรวจไซเบอร์: 1441\n• ศูนย์รับเรื่องร้องเรียน: 191\n• ProtectCyber: 02-XXX-XXXX",
              wrap: true,
              margin: "md" as const,
            },
            {
              type: "separator" as const,
              margin: "lg" as const,
            },
            {
              type: "text" as const,
              text: "💡 วิธีใช้งาน:",
              weight: "bold" as const,
              color: "#1976D2",
              size: "lg" as const,
              margin: "lg" as const,
            },
            {
              type: "text" as const,
              text: "• ส่งข้อความที่ต้องการตรวจสอบ\n• รอผลการวิเคราะห์\n• ทำตามคำแนะนำที่ได้รับ",
              wrap: true,
              margin: "md" as const,
            },
          ],
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "🔍 ตรวจสอบข้อความใหม่",
                data: "check_new_message",
              },
              style: "secondary" as const,
              margin: "sm" as const,
            },
          ],
        },
      },
    };

    await this.client.replyMessage(replyToken, message as any);
  }

  /**
   * ส่งข้อความประวัติการตรวจสอบ (สำหรับ Rich Menu)
   */
  private async sendHistoryMessage(userId: string, replyToken: string): Promise<void> {
    const recentMessages = this.messageStorage.getRecentMessages(userId, 5);
    
    if (recentMessages.length === 0) {
      const message: FlexMessage = {
        type: "flex",
        altText: "📄 ไม่มีประวัติการตรวจสอบ",
        contents: {
          type: "bubble" as const,
          styles: {
            header: {
              backgroundColor: "#616161",
            },
          },
          header: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "📄 ประวัติการตรวจสอบ",
                weight: "bold" as const,
                color: "#FFFFFF",
                size: "xl",
              },
            ],
          },
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "ไม่มีประวัติการตรวจสอบ",
                wrap: true,
                color: "#616161",
                size: "lg" as const,
                align: "center",
              },
              {
                type: "text" as const,
                text: "เริ่มตรวจสอบข้อความเพื่อสร้างประวัติ",
                wrap: true,
                color: "#999999",
                size: "sm",
                align: "center",
                margin: "md" as const,
              },
            ],
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "🔍 ตรวจสอบข้อความใหม่",
                  data: "check_new_message",
                },
                style: "primary" as const,
                color: "#616161",
              },
            ],
          },
        },
      };

      await this.client.replyMessage(replyToken, message as any);
      return;
    }

    // มีประวัติการตรวจสอบ - สร้างรายการ
    const messageButtons = recentMessages.map((msg, index) => ({
      type: "button" as const,
      action: {
        type: "postback" as const,
        label: `${index + 1}. ${msg.text.substring(0, 20)}...`,
        data: `check_msg_${msg.id}`,
      },
      style: "secondary" as const,
      margin: index > 0 ? "sm" as const : undefined,
    }));

    const message: FlexMessage = {
      type: "flex",
      altText: "📄 ประวัติการตรวจสอบ",
      contents: {
        type: "bubble" as const,
        styles: {
          header: {
            backgroundColor: "#616161",
          },
        },
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "📄 ประวัติการตรวจสอบ",
              weight: "bold" as const,
              color: "#FFFFFF",
              size: "xl",
            },
          ],
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: `📋 ข้อความล่าสุด ${recentMessages.length} รายการ:`,
              weight: "bold" as const,
              color: "#616161",
              size: "lg" as const,
            },
            {
              type: "text" as const,
              text: "แตะเพื่อดูรายละเอียด",
              color: "#999999",
              size: "sm",
              margin: "sm" as const,
            },
          ],
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            ...messageButtons,
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "🔍 ตรวจสอบข้อความใหม่",
                data: "check_new_message",
              },
              style: "primary" as const,
              color: "#616161",
              margin: "md" as const,
            },
          ],
        },
      },
    };

    await this.client.replyMessage(replyToken, message as any);
  }

  /**
   * ส่งเมนูตั้งค่า (สำหรับ Rich Menu)
   */
  private async sendSettingsMenu(userId: string, replyToken: string): Promise<void> {
    
    const message: FlexMessage = {
      type: "flex",
      altText: "⚙️ ตั้งค่าระบบ",
      contents: {
        type: "bubble" as const,
        styles: {
          header: {
            backgroundColor: "#F57C00",
          },
        },
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "⚙️ ตั้งค่าระบบ",
              weight: "bold" as const,
              color: "#FFFFFF",
              size: "xl",
            },
          ],
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "🔧 ตั้งค่าระบบ:",
              weight: "bold" as const,
              color: "#F57C00",
              size: "lg" as const,
              margin: "lg" as const,
            },
            {
              type: "text" as const,
              text: "• ระดับความละเอียด: ปานกลาง\n• การแจ้งเตือน: เปิด\n• ขนาดตัวอักษร: ใหญ่",
              wrap: true,
              margin: "md" as const,
            },
          ],
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "🔧 ปรับแต่งการตั้งค่า",
                data: "adjust_settings",
              },
              style: "secondary" as const,
              margin: "sm" as const,
            },
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "🔍 ตรวจสอบข้อความใหม่",
                data: "check_new_message",
              },
              style: "secondary" as const,
              margin: "sm" as const,
            },
          ],
        },
      },
    };

    await this.client.replyMessage(replyToken, message as any);
  }

  /**
   * ส่งศูนย์ความรู้และการศึกษา (สำหรับ Rich Menu)
   */
  private async sendKnowledgeCenter(userId: string, replyToken: string): Promise<void> {
    const message: FlexMessage = {
      type: "flex",
      altText: "🎓 ศูนย์ความรู้และการศึกษา",
      contents: {
        type: "bubble" as const,
        styles: {
          header: {
            backgroundColor: "#7B1FA2",
          },
        },
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "🎓 ศูนย์ความรู้และการศึกษา",
              weight: "bold" as const,
              color: "#FFFFFF",
              size: "xl",
            },
          ],
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "📚 หมวดหมู่ความรู้:",
              weight: "bold" as const,
              color: "#7B1FA2",
              size: "lg" as const,
            },
            {
              type: "text" as const,
              text: "• สังเกตข้อความหลอกลวง 10 ข้อ\n• รูปแบบการหลอกลวงยอดฮิต\n• เทคนิคป้องกันตัวเอง\n• เรื่องจริงจากผู้ที่เคยถูกหลอก",
              wrap: true,
              margin: "md" as const,
            },
            {
              type: "separator" as const,
              margin: "lg" as const,
            },
            {
              type: "text" as const,
              text: "🏆 ทดสอบความรู้:",
              weight: "bold" as const,
              color: "#7B1FA2",
              size: "lg" as const,
              margin: "lg" as const,
            },
            {
              type: "text" as const,
              text: "Quiz เล็กๆ เพื่อทดสอบความเข้าใจเรื่องความปลอดภัยไซเบอร์",
              wrap: true,
              margin: "md" as const,
            },
          ],
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "🎯 สังเกตข้อความหลอกลวง",
                data: "learn_scam_detection",
              },
              style: "primary" as const,
              color: "#7B1FA2",
            },
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "🚨 รูปแบบการหลอกลวงใหม่",
                data: "latest_scam_patterns",
              },
              style: "secondary" as const,
              margin: "sm" as const,
            },
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "🏆 ทดสอบความรู้",
                data: "knowledge_quiz",
              },
              style: "secondary" as const,
              margin: "sm" as const,
            },
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "🔍 ตรวจสอบข้อความใหม่",
                data: "check_new_message",
              },
              style: "secondary" as const,
              margin: "sm" as const,
            },
          ],
        },
      },
    };

    await this.client.replyMessage(replyToken, message as any);
  }

  /**
   * ส่งเนื้อหาการเรียนรู้การตรวจจับการหลอกลวง
   */
  private async sendScamDetectionLearning(userId: string, replyToken: string): Promise<void> {
    const message = {
      type: "flex" as const,
      altText: "เรียนรู้การตรวจจับการหลอกลวง",
      contents: {
        type: "bubble" as const,
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "🎓 เรียนรู้การตรวจจับการหลอกลวง",
              weight: "bold" as const,
              size: "lg" as const,
              color: "#FFFFFF"
            }
          ],
          backgroundColor: "#FF6B6B"
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "📚 หัวข้อการเรียนรู้:",
              weight: "bold" as const,
              margin: "md" as const
            },
            {
              type: "text" as const,
              text: "• จำแนกประเภทการหลอกลวง\n• สัญญาณเตือนที่ต้องระวัง\n• วิธีการตรวจสอบข้อความ\n• เทคนิคการป้องกัน\n• กรณีศึกษาจริง",
              wrap: true,
              margin: "sm" as const
            }
          ]
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "เริ่มเรียนรู้",
                data: "start_learning_module"
              },
              style: "primary" as const
            },
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "ดูวิดีโอสอน",
                data: "watch_tutorial_videos"
              },
              style: "secondary" as const
            }
          ]
        }
      }
    };

    await this.client.replyMessage(replyToken, message as any);
  }

  /**
   * ส่งข้อมูลรูปแบบการหลอกลวงล่าสุด
   */
  private async sendLatestScamPatterns(userId: string, replyToken: string): Promise<void> {
    const message = {
      type: "flex" as const,
      altText: "รูปแบบการหลอกลวงล่าสุด",
      contents: {
        type: "bubble" as const,
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "🚨 รูปแบบการหลอกลวงล่าสุด",
              weight: "bold" as const,
              size: "lg" as const,
              color: "#FFFFFF"
            }
          ],
          backgroundColor: "#FF9500"
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "⚠️ ระวังแนวทางใหม่ที่กำลังระบาด:",
              weight: "bold" as const,
              color: "#FF5722"
            },
            {
              type: "separator" as const,
              margin: "md" as const
            },
            {
              type: "text" as const,
              text: "1. 📱 SMS ปลอมจากธนาคาร\n   - อ้างบัญชีถูกอายัด\n   - ให้คลิกลิงค์ยืนยันตัวตน\n\n2. 💰 การลงทุนคริปโต\n   - สัญญาผลตอบแทนสูง\n   - กลุ่มลับใน Telegram\n\n3. 🎁 รางวัลปลอมจากแบรนด์ดัง\n   - ได้รับเลือกเป็นผู้โชคดี\n   - ต้องจ่ายค่าขนส่ง",
              wrap: true,
              margin: "md" as const
            }
          ]
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "ดูรายละเอียดเพิ่มเติม",
                data: "view_detailed_patterns"
              },
              style: "primary" as const
            }
          ]
        }
      }
    };

    await this.client.replyMessage(replyToken, message as any);
  }

  /**
   * ส่งแบบทดสอบความรู้
   */
  private async sendKnowledgeQuiz(userId: string, replyToken: string): Promise<void> {
    const message = {
      type: "flex" as const,
      altText: "แบบทดสอบความรู้",
      contents: {
        type: "bubble" as const,
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "🧠 แบบทดสอบความรู้",
              weight: "bold" as const,
              size: "lg" as const,
              color: "#FFFFFF"
            }
          ],
          backgroundColor: "#4CAF50"
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "คำถามที่ 1/5:",
              weight: "bold"
            },
            {
              type: "text" as const,
              text: "หากได้รับข้อความแจ้งว่า 'บัญชีธนาคารของคุณถูกอายัด กรุณากดลิงค์เพื่อยืนยันตัวตน' ควรทำอย่างไร?",
              wrap: true,
              margin: "md" as const
            }
          ]
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "A. คลิกลิงค์ทันที",
                data: "quiz_answer_A"
              },
              style: "secondary" as const
            },
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "B. โทรหาธนาคารโดยตรง",
                data: "quiz_answer_B"
              },
              style: "secondary" as const
            },
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "C. ลบข้อความทิ้ง",
                data: "quiz_answer_C"
              },
              style: "secondary" as const
            }
          ]
        }
      }
    };

    await this.client.replyMessage(replyToken, message as any);
  }

  /**
   * ส่งเมนูการตั้งค่าขั้นสูง
   */
  private async sendAdvancedSettings(userId: string, replyToken: string): Promise<void> {
    const message = {
      type: "flex" as const,
      altText: "การตั้งค่าขั้นสูง",
      contents: {
        type: "bubble" as const,
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "⚙️ การตั้งค่าขั้นสูง",
              weight: "bold" as const,
              size: "lg" as const,
              color: "#FFFFFF"
            }
          ],
          backgroundColor: "#607D8B"
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "🎛️ ปรับแต่งการทำงาน:",
              weight: "bold"
            },
            {
              type: "text" as const,
              text: "• ระดับความอ่อนไหวการตรวจจับ\n• ภาษาที่ใช้ในการแสดงผล\n• การแจ้งเตือนอัตโนมัติ\n• การส่งรายงานให้ครอบครัว\n• โหมดการใช้งาน (ผู้สูงอายุ/ทั่วไป)",
              wrap: true,
              margin: "sm" as const
            }
          ]
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "ตั้งค่าความอ่อนไหว",
                data: "adjust_sensitivity"
              },
              style: "primary" as const
            },
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "เปลี่ยนภาษา",
                data: "change_language"
              },
              style: "secondary" as const
            },
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "การแจ้งเตือน",
                data: "notification_settings"
              },
              style: "secondary" as const
            }
          ]
        }
      }
    };

    await this.client.replyMessage(replyToken, message as any);
  }

  /**
   * ส่งฟอร์มรายงานปัญหา
   */
  private async sendProblemReport(userId: string, replyToken: string): Promise<void> {
    const message = {
      type: "flex" as const,
      altText: "รายงานปัญหา",
      contents: {
        type: "bubble" as const,
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "📞 รายงานปัญหา",
              weight: "bold" as const,
              size: "lg" as const,
              color: "#FFFFFF"
            }
          ],
          backgroundColor: "#9C27B0"
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "🛠️ ปัญหาที่พบบ่อย:",
              weight: "bold"
            },
            {
              type: "text" as const,
              text: "• การตรวจจับไม่ถูกต้อง\n• ระบบตอบสนองช้า\n• ข้อความแสดงผลผิดพลาด\n• ฟีเจอร์ไม่ทำงาน\n• ต้องการความช่วยเหลือ",
              wrap: true,
              margin: "sm" as const
            },
            {
              type: "separator" as const,
              margin: "md" as const
            },
            {
              type: "text" as const,
              text: "💬 ส่งข้อความรายละเอียดปัญหา หรือติดต่อทีมสนับสนุน:",
              wrap: true,
              margin: "md" as const
            }
          ]
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "รายงานการตรวจจับผิด",
                data: "report_false_detection"
              },
              style: "primary" as const
            },
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "ปัญหาทางเทคนิค",
                data: "report_technical_issue"
              },
              style: "secondary" as const
            },
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "ติดต่อทีมสนับสนุน",
                data: "contact_support_team"
              },
              style: "secondary" as const
            }
          ]
        }
      }
    };

    await this.client.replyMessage(replyToken, message as any);
  }

  /**
   * ส่งข้อมูลการติดต่อฉุกเฉิน
   */
  private async sendEmergencyContact(userId: string, replyToken: string, type: "police" | "thaicert"): Promise<void> {
    let message;

    if (type === "police") {
      message = {
        type: "flex" as const,
        altText: "ติดต่อตำรวจ 191",
        contents: {
          type: "bubble" as const,
          header: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "👮‍♂️ ติดต่อตำรวจ 191",
                weight: "bold" as const,
                size: "lg" as const,
                color: "#FFFFFF"
              }
            ],
            backgroundColor: "#F44336"
          },
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "🚨 สำหรับกรณีฉุกเฉิน:",
                weight: "bold" as const,
                color: "#F44336"
              },
              {
                type: "text" as const,
                text: "• โดนหลอกลวงเงิน\n• ถูกขู่เข็ญ\n• สงสัยว่าเป็นอาชญากรรม\n• ต้องการความช่วยเหลือทันที",
                wrap: true,
                margin: "md" as const
              },
              {
                type: "separator" as const,
                margin: "lg" as const
              },
              {
                type: "text" as const,
                text: "📞 หมายเลข: 191\n🕐 เปิดบริการ: 24 ชั่วโมง",
                margin: "md" as const
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "uri" as const,
                  label: "โทร 191",
                  uri: "tel:191"
                },
                style: "primary" as const,
                color: "#F44336"
              }
            ]
          }
        }
      };
    } else {
      message = {
        type: "flex" as const,
        altText: "ติดต่อ ThaiCERT 1441",
        contents: {
          type: "bubble" as const,
          header: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "🛡️ ติดต่อ ThaiCERT 1441",
                weight: "bold" as const,
                size: "lg" as const,
                color: "#FFFFFF"
              }
            ],
            backgroundColor: "#FF5722"
          },
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "🔒 สำหรับภัยคุกคามไซเบอร์:",
                weight: "bold" as const,
                color: "#FF5722"
              },
              {
                type: "text" as const,
                text: "• เว็บไซต์หลอกลวง\n• อีเมลฟิชชิ่ง\n• มัลแวร์/ไวรัส\n• การแฮกข้อมูล\n• ปัญหาความปลอดภัยออนไลน์",
                wrap: true,
                margin: "md" as const
              },
              {
                type: "separator" as const,
                margin: "lg" as const
              },
              {
                type: "text" as const,
                text: "📞 หมายเลข: 1441\n🕐 เปิดบริการ: จันทร์-ศุกร์ 8:30-16:30",
                margin: "md" as const
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "uri" as const,
                  label: "โทร 1441",
                  uri: "tel:1441"
                },
                style: "primary" as const,
                color: "#FF5722"
              }
            ]
          }
        }
      };
    }

    await this.client.replyMessage(replyToken, message as any);
  }

  /**
   * ส่งการยืนยันความปลอดภัย
   */
  private async sendSafeConfirmation(userId: string, replyToken: string): Promise<void> {
    const message = {
      type: "flex" as const,
      altText: "ยืนยันความปลอดภัย",
      contents: {
        type: "bubble" as const,
        header: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "✅ ยืนยันความปลอดภัย",
              weight: "bold" as const,
              size: "lg" as const,
              color: "#FFFFFF"
            }
          ],
          backgroundColor: "#4CAF50"
        },
        body: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "text" as const,
              text: "🎉 ขอบคุณที่แจ้งให้ทราบว่าคุณปลอดภัยแล้ว",
              wrap: true,
              weight: "bold" as const,
              color: "#4CAF50"
            },
            {
              type: "separator" as const,
              margin: "md" as const
            },
            {
              type: "text" as const,
              text: "📊 ข้อมูลนี้จะช่วยเราปรับปรุงระบบให้ดีขึ้น",
              wrap: true,
              margin: "md" as const
            },
            {
              type: "text" as const,
              text: "🛡️ เราจะดูแลคุณต่อไป ส่งข้อความมาได้ทุกเมื่อที่ต้องการความช่วยเหลือ",
              wrap: true,
              margin: "md" as const
            }
          ]
        },
        footer: {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            {
              type: "button" as const,
              action: {
                type: "postback" as const,
                label: "กลับเมนูหลัก",
                data: "back_to_menu"
              },
              style: "primary" as const
            }
          ]
        }
      }
    };

    await this.client.replyMessage(replyToken, message as any);
  }

  /**
   * จัดการคำตอบแบบทดสอบ
   */
  private async handleQuizAnswer(userId: string, replyToken: string, answer: string): Promise<void> {
    try {
      const message = {
        type: "flex" as const,
        altText: "ผลลัพธ์แบบทดสอบ",
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "📝 ผลลัพธ์แบบทดสอบ",
                weight: "bold" as const,
                size: "xl" as const,
                color: "#1DB446"
              },
              {
                type: "separator" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: `คำตอบของคุณ: ${answer}`,
                margin: "md" as const,
                size: "md" as const
              },
              {
                type: "text" as const,
                text: answer === "B" 
                  ? "✅ ถูกต้อง! ไม่ควรกดลิงค์จากแหล่งที่ไม่น่าเชื่อถือ"
                  : "❌ ไม่ถูกต้อง คำตอบที่ถูกคือ B - ไม่กดลิงค์",
                margin: "md" as const,
                wrap: true,
                color: answer === "B" ? "#1DB446" : "#FF5722"
              },
              {
                type: "text" as const,
                text: "💡 จำไว้: อย่าเชื่อข้อความที่บอกให้กดลิงค์เพื่อรับของรางวัลหรือยืนยันข้อมูล",
                margin: "lg" as const,
                wrap: true,
                size: "sm" as const
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "ทำแบบทดสอบต่อ",
                  data: "knowledge_quiz"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "กลับเมนูหลัก",
                  data: "back_to_menu"
                },
                style: "secondary" as const
              }
            ],
            spacing: "sm" as const
          }
        }
      };

      await this.client.replyMessage(replyToken, message as any);
    } catch (error) {
      console.error('❌ Error in handleQuizAnswer:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาดในการประมวลผลคำตอบ กรุณาลองใหม่อีกครั้ง"
      });
    }
  }

  /**
   * ส่งโมดูลการเรียนรู้
   */
  private async sendLearningModule(userId: string, replyToken: string): Promise<void> {
    try {
      const message = {
        type: "flex" as const,
        altText: "โมดูลการเรียนรู้",
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "📚 โมดูลการเรียนรู้",
                weight: "bold" as const,
                size: "xl" as const,
                color: "#1DB446"
              },
              {
                type: "separator" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: "เลือกหัวข้อที่ต้องการเรียนรู้:",
                margin: "md" as const
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "🎣 การตรวจจับฟิชชิ่ง",
                  data: "learn_phishing"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "💰 การหลอกลวงทางการเงิน",
                  data: "learn_financial_scam"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "📱 ความปลอดภัยออนไลน์",
                  data: "learn_online_safety"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "กลับเมนูหลัก",
                  data: "back_to_menu"
                },
                style: "secondary" as const
              }
            ],
            spacing: "sm" as const
          }
        }
      };

      await this.client.replyMessage(replyToken, message as any);
    } catch (error) {
      console.error('❌ Error in sendLearningModule:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาดในการโหลดโมดูลการเรียนรู้"
      });
    }
  }

  /**
   * ส่งวิดีโอสอน
   */
  private async sendTutorialVideos(userId: string, replyToken: string): Promise<void> {
    try {
      const message = {
        type: "flex" as const,
        altText: "วิดีโอสอน",
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "🎬 วิดีโอสอน",
                weight: "bold" as const,
                size: "xl" as const,
                color: "#1DB446"
              },
              {
                type: "separator" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: "เลือกวิดีโอที่ต้องการชม:",
                margin: "md" as const
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "uri" as const,
                  label: "🎯 จดจำลักษณะการหลอกลวง",
                  uri: "https://youtube.com/watch?v=example1"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "uri" as const,
                  label: "🔒 ตรวจสอบความปลอดภัยเว็บไซต์",
                  uri: "https://youtube.com/watch?v=example2"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "uri" as const,
                  label: "📞 วิธีรายงานการหลอกลวง",
                  uri: "https://youtube.com/watch?v=example3"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "กลับเมนูหลัก",
                  data: "back_to_menu"
                },
                style: "secondary" as const
              }
            ],
            spacing: "sm" as const
          }
        }
      };

      await this.client.replyMessage(replyToken, message as any);
    } catch (error) {
      console.error('❌ Error in sendTutorialVideos:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาดในการโหลดวิดีโอสอน"
      });
    }
  }

  /**
   * ส่งเมนูเลือกภาษา
   */
  private async sendLanguageSelection(userId: string, replyToken: string): Promise<void> {
    try {
      const message = {
        type: "flex" as const,
        altText: "เลือกภาษา",
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "🌐 เลือกภาษา / Select Language",
                weight: "bold" as const,
                size: "xl" as const,
                color: "#1DB446"
              },
              {
                type: "separator" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: "กรุณาเลือกภาษาที่ต้องการ:",
                margin: "md" as const
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "🇹🇭 ไทย (Thai)",
                  data: "set_language_th"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "🇺🇸 English",
                  data: "set_language_en"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "🇨🇳 中文 (Chinese)",
                  data: "set_language_zh"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "🇲🇲 မြန်မာ (Myanmar)",
                  data: "set_language_my"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "กลับเมนูหลัก",
                  data: "back_to_menu"
                },
                style: "secondary" as const
              }
            ],
            spacing: "sm" as const
          }
        }
      };

      await this.client.replyMessage(replyToken, message as any);
    } catch (error) {
      console.error('❌ Error in sendLanguageSelection:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาดในการโหลดเมนูภาษา"
      });
    }
  }

  /**
   * ส่งการตั้งค่าความอ่อนไหว
   */
  private async sendSensitivitySettings(userId: string, replyToken: string): Promise<void> {
    try {
      const message = {
        type: "flex" as const,
        altText: "ตั้งค่าความอ่อนไหว",
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "⚙️ ความอ่อนไหวในการตรวจจับ",
                weight: "bold" as const,
                size: "xl" as const,
                color: "#1DB446"
              },
              {
                type: "separator" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: "เลือกระดับความอ่อนไหวที่เหมาะสมกับคุณ:",
                margin: "md" as const,
                wrap: true
              },
              {
                type: "text" as const,
                text: "🔴 สูง: ตรวจจับเข้มงวด อาจมีการแจ้งเตือนผิดพลาดบ้าง\n🟡 ปานกลาง: สมดุลระหว่างความแม่นยำและการตรวจจับ\n🟢 ต่ำ: ตรวจจับเฉพาะที่แน่ใจว่าเป็นภัยคุกคาม",
                margin: "md" as const,
                wrap: true,
                size: "sm" as const
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "🔴 ความอ่อนไหวสูง",
                  data: "set_sensitivity_high"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "🟡 ความอ่อนไหวปานกลาง",
                  data: "set_sensitivity_medium"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "🟢 ความอ่อนไหวต่ำ",
                  data: "set_sensitivity_low"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "กลับเมนูหลัก",
                  data: "back_to_menu"
                },
                style: "secondary" as const
              }
            ],
            spacing: "sm" as const
          }
        }
      };

      await this.client.replyMessage(replyToken, message as any);
    } catch (error) {
      console.error('❌ Error in sendSensitivitySettings:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาดในการโหลดการตั้งค่า"
      });
    }
  }

  /**
   * ส่งการตั้งค่าการแจ้งเตือน
   */
  private async sendNotificationSettings(userId: string, replyToken: string): Promise<void> {
    try {
      const message = {
        type: "flex" as const,
        altText: "ตั้งค่าการแจ้งเตือน",
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "🔔 ตั้งค่าการแจ้งเตือน",
                weight: "bold" as const,
                size: "xl" as const,
                color: "#1DB446"
              },
              {
                type: "separator" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: "เลือกประเภทการแจ้งเตือนที่ต้องการ:",
                margin: "md" as const
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "🚨 แจ้งเตือนภัยคุกคามทันที",
                  data: "toggle_threat_alerts"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "📱 แจ้งเตือนรูปแบบใหม่",
                  data: "toggle_pattern_alerts"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "📊 สรุปรายสัปดาห์",
                  data: "toggle_weekly_summary"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "🔕 ปิดการแจ้งเตือนทั้งหมด",
                  data: "disable_all_notifications"
                },
                style: "secondary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "กลับเมนูหลัก",
                  data: "back_to_menu"
                },
                style: "secondary" as const
              }
            ],
            spacing: "sm" as const
          }
        }
      };

      await this.client.replyMessage(replyToken, message as any);
    } catch (error) {
      console.error('❌ Error in sendNotificationSettings:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาดในการโหลดการตั้งค่าการแจ้งเตือน"
      });
    }
  }

  /**
   * ส่งรายละเอียดรูปแบบการหลอกลวง
   */
  private async sendDetailedScamPatterns(userId: string, replyToken: string): Promise<void> {
    try {
      const message = {
        type: "flex" as const,
        altText: "รูปแบบการหลอกลวงโดยละเอียด",
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "🔍 รูปแบบการหลอกลวงโดยละเอียด",
                weight: "bold" as const,
                size: "xl" as const,
                color: "#1DB446"
              },
              {
                type: "separator" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: "💰 การหลอกลวงทางการเงิน:",
                weight: "bold" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: "• แจ้งบัญชีถูกอายัด\n• ขอยืนยันข้อมูลส่วนตัว\n• มีค่าธรรมเนียมที่ต้องจ่าย\n• บอกให้กดลิงค์เพื่ออัปเดต",
                margin: "sm" as const,
                wrap: true,
                size: "sm" as const
              },
              {
                type: "text" as const,
                text: "🎁 การหลอกด้วยของรางวัล:",
                weight: "bold" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: "• คุณได้รับรางวัลใหญ่\n• เป็นผู้โชคดีจากการจับรางวัล\n• ขอให้กรอกข้อมูลเพื่อรับรางวัล\n• ต้องจ่ายค่าธรรมเนียมก่อนรับ",
                margin: "sm" as const,
                wrap: true,
                size: "sm" as const
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "ดูรูปแบบเพิ่มเติม",
                  data: "view_more_patterns"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "กลับเมนูหลัก",
                  data: "back_to_menu"
                },
                style: "secondary" as const
              }
            ],
            spacing: "sm" as const
          }
        }
      };

      await this.client.replyMessage(replyToken, message as any);
    } catch (error) {
      console.error('❌ Error in sendDetailedScamPatterns:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาดในการโหลดข้อมูลรูปแบบการหลอกลวง"
      });
    }
  }

  /**
   * ส่งฟอร์มรายงานการตรวจจับผิด
   */
  private async sendFalseDetectionReport(userId: string, replyToken: string): Promise<void> {
    try {
      const message = {
        type: "flex" as const,
        altText: "รายงานการตรวจจับผิด",
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "📊 รายงานการตรวจจับผิด",
                weight: "bold" as const,
                size: "xl" as const,
                color: "#1DB446"
              },
              {
                type: "separator" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: "หากระบบตรวจจับผิดพลาด กรุณาช่วยรายงานให้เราทราบ:",
                margin: "md" as const,
                wrap: true
              },
              {
                type: "text" as const,
                text: "🔹 ระบบบอกว่าอันตราย แต่จริงๆ ปลอดภัย\n🔹 ระบบบอกว่าปลอดภัย แต่จริงๆ อันตราย",
                margin: "md" as const,
                wrap: true,
                size: "sm" as const
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "❌ ตรวจจับผิด: ปลอดภัยแต่บอกอันตราย",
                  data: "report_false_positive"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "⚠️ ตรวจจับผิด: อันตรายแต่บอกปลอดภัย",
                  data: "report_false_negative"
                },
                style: "secondary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "กลับเมนูหลัก",
                  data: "back_to_menu"
                },
                style: "secondary" as const
              }
            ],
            spacing: "sm" as const
          }
        }
      };

      await this.client.replyMessage(replyToken, message as any);
    } catch (error) {
      console.error('❌ Error in sendFalseDetectionReport:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาดในการโหลดฟอร์มรายงาน"
      });
    }
  }

  /**
   * ส่งฟอร์มรายงานปัญหาทางเทคนิค
   */
  private async sendTechnicalIssueReport(userId: string, replyToken: string): Promise<void> {
    try {
      const message = {
        type: "flex" as const,
        altText: "รายงานปัญหาทางเทคนิค",
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "🔧 รายงานปัญหาทางเทคนิค",
                weight: "bold" as const,
                size: "xl" as const,
                color: "#1DB446"
              },
              {
                type: "separator" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: "พบปัญหาการใช้งาน? กรุณารายงานให้เราทราบ:",
                margin: "md" as const,
                wrap: true
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "🐛 ระบบค้าง หรือ ตอบสนองช้า",
                  data: "report_system_slow"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "❌ ไม่สามารถวิเคราะห์ข้อความได้",
                  data: "report_analysis_failed"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "🔄 ระบบไม่ตอบกลับ",
                  data: "report_no_response"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "📝 ปัญหาอื่นๆ",
                  data: "report_other_issue"
                },
                style: "secondary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "กลับเมนูหลัก",
                  data: "back_to_menu"
                },
                style: "secondary" as const
              }
            ],
            spacing: "sm" as const
          }
        }
      };

      await this.client.replyMessage(replyToken, message as any);
    } catch (error) {
      console.error('❌ Error in sendTechnicalIssueReport:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาดในการโหลดฟอร์มรายงานปัญหา"
      });
    }
  }

  /**
   * ส่งข้อมูลติดต่อทีมสนับสนุน
   */
  private async sendSupportTeamContact(userId: string, replyToken: string): Promise<void> {
    try {
      const message = {
        type: "flex" as const,
        altText: "ติดต่อทีมสนับสนุน",
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "👥 ติดต่อทีมสนับสนุน",
                weight: "bold" as const,
                size: "xl" as const,
                color: "#1DB446"
              },
              {
                type: "separator" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: "📞 เบอร์โทรศัพท์:",
                weight: "bold" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: "02-XXX-XXXX (จันทร์-ศุกร์ 9:00-18:00)",
                margin: "sm" as const,
                size: "sm" as const
              },
              {
                type: "text" as const,
                text: "📧 อีเมล:",
                weight: "bold" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: "support@protectcyber.co.th",
                margin: "sm" as const,
                size: "sm" as const
              },
              {
                type: "text" as const,
                text: "💬 LINE Official:",
                weight: "bold" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: "ส่งข้อความในแชทนี้ได้เลย ทีมงานจะตอบกลับโดยเร็ว",
                margin: "sm" as const,
                size: "sm" as const,
                wrap: true
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "uri" as const,
                  label: "📧 ส่งอีเมลแจ้งปัญหา",
                  uri: "mailto:support@protectcyber.co.th?subject=รายงานปัญหา"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "💬 แชทกับทีมสนับสนุน",
                  data: "start_support_chat"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "กลับเมนูหลัก",
                  data: "back_to_menu"
                },
                style: "secondary" as const
              }
            ],
            spacing: "sm" as const
          }
        }
      };

      await this.client.replyMessage(replyToken, message as any);
    } catch (error) {
      console.error('❌ Error in sendSupportTeamContact:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาดในการโหลดข้อมูลติดต่อ"
      });
    }
  }

  /**
   * จัดการการเปลี่ยนภาษา
   */
  private async handleLanguageChange(userId: string, replyToken: string, language: string): Promise<void> {
    try {
      // บันทึกการตั้งค่าภาษาของผู้ใช้ (ในระบบจริงจะบันทึกลงฐานข้อมูล)
      // userLanguagePreferences.set(userId, language);

      const languageNames: Record<string, string> = {
        'th': 'ไทย',
        'en': 'English',
        'zh': '中文',
        'my': 'မြန်မာ'
      };

      const message = {
        type: "flex" as const,
        altText: "ตั้งค่าภาษาเรียบร้อย",
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "✅ ตั้งค่าภาษาเรียบร้อย",
                weight: "bold" as const,
                size: "xl" as const,
                color: "#1DB446"
              },
              {
                type: "separator" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: `ภาษาที่เลือก: ${languageNames[language] || language}`,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: "การตั้งค่านี้จะมีผลกับการแสดงผลข้อความและเมนูในอนาคต",
                margin: "md" as const,
                wrap: true,
                size: "sm" as const,
                color: "#666666"
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "กลับเมนูหลัก",
                  data: "back_to_menu"
                },
                style: "primary" as const
              }
            ]
          }
        }
      };

      await this.client.replyMessage(replyToken, message as any);
    } catch (error) {
      console.error('❌ Error in handleLanguageChange:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาดในการเปลี่ยนภาษา"
      });
    }
  }

  /**
   * จัดการการปรับความอ่อนไหว
   */
  private async handleSensitivityChange(userId: string, replyToken: string, level: string): Promise<void> {
    try {
      // บันทึกการตั้งค่าความอ่อนไหวของผู้ใช้ (ในระบบจริงจะบันทึกลงฐานข้อมูล)
      // userSensitivitySettings.set(userId, level);

      const levelNames: Record<string, { name: string; description: string; emoji: string }> = {
        'high': { 
          name: 'ความอ่อนไหวสูง', 
          description: 'ตรวจจับเข้มงวด อาจมีการแจ้งเตือนผิดพลาดบ้าง',
          emoji: '🔴'
        },
        'medium': { 
          name: 'ความอ่อนไหวปานกลาง', 
          description: 'สมดุลระหว่างความแม่นยำและการตรวจจับ',
          emoji: '🟡'
        },
        'low': { 
          name: 'ความอ่อนไหวต่ำ', 
          description: 'ตรวจจับเฉพาะที่แน่ใจว่าเป็นภัยคุกคาม',
          emoji: '🟢'
        }
      };

      const selectedLevel = levelNames[level];

      const message = {
        type: "flex" as const,
        altText: "ตั้งค่าความอ่อนไหวเรียบร้อย",
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "✅ ตั้งค่าความอ่อนไหวเรียบร้อย",
                weight: "bold" as const,
                size: "xl" as const,
                color: "#1DB446"
              },
              {
                type: "separator" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: `${selectedLevel?.emoji} ${selectedLevel?.name}`,
                margin: "md" as const,
                weight: "bold" as const
              },
              {
                type: "text" as const,
                text: selectedLevel?.description || 'รอการอัปเดต',
                margin: "sm" as const,
                wrap: true,
                size: "sm" as const,
                color: "#666666"
              },
              {
                type: "text" as const,
                text: "💡 คุณสามารถเปลี่ยนการตั้งค่านี้ได้ทุกเมื่อจากเมนูการตั้งค่า",
                margin: "md" as const,
                wrap: true,
                size: "sm" as const
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "กลับเมนูหลัก",
                  data: "back_to_menu"
                },
                style: "primary" as const
              }
            ]
          }
        }
      };

      await this.client.replyMessage(replyToken, message as any);
    } catch (error) {
      console.error('❌ Error in handleSensitivityChange:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาดในการปรับความอ่อนไหว"
      });
    }
  }

  /**
   * จัดการการตั้งค่าการแจ้งเตือน
   */
  private async handleNotificationToggle(userId: string, replyToken: string, action: string): Promise<void> {
    try {
      let title = "";
      let message = "";
      let emoji = "";

      switch (action) {
        case "toggle_threat_alerts":
          title = "🚨 แจ้งเตือนภัยคุกคาม";
          message = "เปิดใช้งานการแจ้งเตือนเมื่อพบภัยคุกคามทันที";
          emoji = "🔔";
          break;
        case "toggle_pattern_alerts":
          title = "📱 แจ้งเตือนรูปแบบใหม่";
          message = "เปิดใช้งานการแจ้งเตือนเมื่อมีรูปแบบการหลอกลวงใหม่";
          emoji = "🔔";
          break;
        case "toggle_weekly_summary":
          title = "📊 สรุปรายสัปดาห์";
          message = "เปิดใช้งานการส่งสรุปสถิติการใช้งานรายสัปดาห์";
          emoji = "📊";
          break;
        case "disable_all_notifications":
          title = "🔕 ปิดการแจ้งเตือนทั้งหมด";
          message = "ปิดการแจ้งเตือนทั้งหมด (ยกเว้นการตอบกลับข้อความ)";
          emoji = "🔕";
          break;
        default:
          title = "⚙️ การตั้งค่าการแจ้งเตือน";
          message = "อัปเดตการตั้งค่าเรียบร้อย";
          emoji = "⚙️";
      }

      const responseMessage = {
        type: "flex" as const,
        altText: "ตั้งค่าการแจ้งเตือนเรียบร้อย",
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: `✅ ${title}`,
                weight: "bold" as const,
                size: "xl" as const,
                color: "#1DB446"
              },
              {
                type: "separator" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: `${emoji} ${message}`,
                margin: "md" as const,
                wrap: true
              },
              {
                type: "text" as const,
                text: "การตั้งค่านี้จะมีผลทันที คุณสามารถเปลี่ยนแปลงได้ทุกเมื่อ",
                margin: "md" as const,
                wrap: true,
                size: "sm" as const,
                color: "#666666"
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "ตั้งค่าอื่นๆ",
                  data: "notification_settings"
                },
                style: "secondary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "กลับเมนูหลัก",
                  data: "back_to_menu"
                },
                style: "primary" as const
              }
            ],
            spacing: "sm" as const
          }
        }
      };

      await this.client.replyMessage(replyToken, responseMessage as any);
    } catch (error) {
      console.error('❌ Error in handleNotificationToggle:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาดในการตั้งค่าการแจ้งเตือน"
      });
    }
  }

  /**
   * ส่งรูปแบบการหลอกลวงเพิ่มเติม
   */
  private async sendMoreScamPatterns(userId: string, replyToken: string): Promise<void> {
    try {
      const message = {
        type: "flex" as const,
        altText: "รูปแบบการหลอกลวงเพิ่มเติม",
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "🔍 รูปแบบการหลอกลวงเพิ่มเติม",
                weight: "bold" as const,
                size: "xl" as const,
                color: "#1DB446"
              },
              {
                type: "separator" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: "📞 การหลอกลวงทางโทรศัพท์:",
                weight: "bold" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: "• แอบอ้างเป็นเจ้าหน้าที่ธนาคาร\n• ขอรหัส OTP ทางโทรศัพท์\n• บอกว่าบัญชีมีปัญหา\n• ขู่ว่าจะปิดบัญชี",
                margin: "sm" as const,
                wrap: true,
                size: "sm" as const
              },
              {
                type: "text" as const,
                text: "🌐 การหลอกลวงเว็บไซต์ปลอม:",
                weight: "bold" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: "• เว็บไซต์ธนาคารปลอม\n• หน้าล็อกอินปลอม\n• URL ที่คล้ายของจริง\n• ใบรับรองความปลอดภัยปลอม",
                margin: "sm" as const,
                wrap: true,
                size: "sm" as const
              },
              {
                type: "text" as const,
                text: "💡 วิธีป้องกัน:",
                weight: "bold" as const,
                margin: "md" as const,
                color: "#FF9800"
              },
              {
                type: "text" as const,
                text: "• ตรวจสอบ URL ให้ถูกต้อง\n• ไม่ให้รหัส OTP ใครง่ายๆ\n• ติดต่อธนาคารโดยตรง\n• ใช้แอปธนาคารอย่างเป็นทางการ",
                margin: "sm" as const,
                wrap: true,
                size: "sm" as const
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "ดูเคล็ดลับเพิ่มเติม",
                  data: "more_protection_tips"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "กลับเมนูหลัก",
                  data: "back_to_menu"
                },
                style: "secondary" as const
              }
            ],
            spacing: "sm" as const
          }
        }
      };

      await this.client.replyMessage(replyToken, message as any);
    } catch (error) {
      console.error('❌ Error in sendMoreScamPatterns:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาดในการโหลดข้อมูล"
      });
    }
  }

  /**
   * จัดการรายงานการตรวจจับผิด
   */
  private async handleFalseDetectionReport(userId: string, replyToken: string, reportType: string): Promise<void> {
    try {
      let title = "";
      let description = "";
      let nextSteps = "";

      if (reportType === "positive") {
        title = "❌ รายงาน False Positive";
        description = "ระบบตรวจจับว่าอันตราย แต่จริงๆ ปลอดภัย";
        nextSteps = "เราจะปรับปรุงระบบให้แม่นยำขึ้น";
      } else if (reportType === "negative") {
        title = "⚠️ รายงาน False Negative";
        description = "ระบบตรวจจับว่าปลอดภัย แต่จริงๆ อันตราย";
        nextSteps = "เราจะเพิ่มการตรวจจับสำหรับกรณีนี้";
      }

      const message = {
        type: "flex" as const,
        altText: "รายงานการตรวจจับผิดเรียบร้อย",
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "✅ รายงานเรียบร้อยแล้ว",
                weight: "bold" as const,
                size: "xl" as const,
                color: "#1DB446"
              },
              {
                type: "separator" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: title,
                margin: "md" as const,
                weight: "bold" as const
              },
              {
                type: "text" as const,
                text: description,
                margin: "sm" as const,
                wrap: true,
                size: "sm" as const
              },
              {
                type: "text" as const,
                text: `📊 ${nextSteps}`,
                margin: "md" as const,
                wrap: true,
                color: "#666666"
              },
              {
                type: "text" as const,
                text: "🙏 ขอบคุณที่ช่วยปรับปรุงระบบให้ดีขึ้น",
                margin: "md" as const,
                wrap: true
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "รายงานเพิ่มเติม",
                  data: "report_false_detection"
                },
                style: "secondary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "กลับเมนูหลัก",
                  data: "back_to_menu"
                },
                style: "primary" as const
              }
            ],
            spacing: "sm" as const
          }
        }
      };

      await this.client.replyMessage(replyToken, message as any);
    } catch (error) {
      console.error('❌ Error in handleFalseDetectionReport:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาดในการส่งรายงาน"
      });
    }
  }

  /**
   * จัดการรายงานปัญหาทางเทคนิค
   */
  private async handleTechnicalReport(userId: string, replyToken: string, reportType: string): Promise<void> {
    try {
      let title = "";
      let description = "";
      let solution = "";

      switch (reportType) {
        case "report_system_slow":
          title = "🐛 ระบบตอบสนองช้า";
          description = "ปัญหาการทำงานช้าของระบบ";
          solution = "เราจะตรวจสอบประสิทธิภาพเซิร์ฟเวอร์";
          break;
        case "report_analysis_failed":
          title = "❌ วิเคราะห์ข้อความไม่ได้";
          description = "ระบบไม่สามารถวิเคราะห์ข้อความได้";
          solution = "เราจะปรับปรุง AI engine";
          break;
        case "report_no_response":
          title = "🔄 ระบบไม่ตอบกลับ";
          description = "ระบบไม่ตอบสนองหรือไม่มีการตอบกลับ";
          solution = "เราจะตรวจสอบการเชื่อมต่อระบบ";
          break;
        case "report_other_issue":
          title = "📝 ปัญหาอื่นๆ";
          description = "ปัญหาการใช้งานอื่นๆ";
          solution = "เราจะวิเคราะห์และแก้ไขให้เร็วที่สุด";
          break;
        default:
          title = "🔧 รายงานปัญหา";
          description = "ได้รับรายงานปัญหาเรียบร้อย";
          solution = "ทีมงานจะตรวจสอบและแก้ไข";
      }

      const message = {
        type: "flex" as const,
        altText: "รายงานปัญหาเรียบร้อย",
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "✅ รายงานปัญหาเรียบร้อย",
                weight: "bold" as const,
                size: "xl" as const,
                color: "#1DB446"
              },
              {
                type: "separator" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: title,
                margin: "md" as const,
                weight: "bold" as const
              },
              {
                type: "text" as const,
                text: description,
                margin: "sm" as const,
                wrap: true,
                size: "sm" as const
              },
              {
                type: "text" as const,
                text: `🔧 ${solution}`,
                margin: "md" as const,
                wrap: true,
                color: "#666666"
              },
              {
                type: "text" as const,
                text: "📋 Ticket ID: #" + Date.now().toString().slice(-6),
                margin: "md" as const,
                size: "sm" as const,
                color: "#999999"
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "ติดต่อทีมสนับสนุน",
                  data: "contact_support_team"
                },
                style: "secondary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "กลับเมนูหลัก",
                  data: "back_to_menu"
                },
                style: "primary" as const
              }
            ],
            spacing: "sm" as const
          }
        }
      };

      await this.client.replyMessage(replyToken, message as any);
    } catch (error) {
      console.error('❌ Error in handleTechnicalReport:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาดในการส่งรายงาน"
      });
    }
  }

  /**
   * เริ่มแชทกับทีมสนับสนุน
   */
  private async startSupportChat(userId: string, replyToken: string): Promise<void> {
    try {
      const message = {
        type: "flex" as const,
        altText: "แชทกับทีมสนับสนุน",
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "💬 แชทกับทีมสนับสนุน",
                weight: "bold" as const,
                size: "xl" as const,
                color: "#1DB446"
              },
              {
                type: "separator" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: "🟢 ทีมสนับสนุนพร้อมให้บริการ",
                margin: "md" as const,
                weight: "bold" as const,
                color: "#1DB446"
              },
              {
                type: "text" as const,
                text: "คุณสามารถส่งข้อความถามปัญหาหรือข้อสงสัยได้เลย ทีมงานจะตอบกลับโดยเร็ว",
                margin: "sm" as const,
                wrap: true,
                size: "sm" as const
              },
              {
                type: "text" as const,
                text: "⏰ เวลาทำการ: จันทร์-ศุกร์ 9:00-18:00",
                margin: "md" as const,
                size: "sm" as const,
                color: "#666666"
              },
              {
                type: "text" as const,
                text: "🚀 เวลาตอบกลับโดยเฉลี่ย: 5-10 นาที",
                margin: "sm" as const,
                size: "sm" as const,
                color: "#666666"
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "💡 เคล็ดลับ: อธิบายปัญหาให้ละเอียดจะช่วยให้เราแก้ไขได้รวดเร็วขึ้น",
                wrap: true,
                size: "xs" as const,
                color: "#999999",
                margin: "md" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "กลับเมนูหลัก",
                  data: "back_to_menu"
                },
                style: "secondary" as const,
                margin: "md" as const
              }
            ]
          }
        }
      };

      await this.client.replyMessage(replyToken, message as any);
    } catch (error) {
      console.error('❌ Error in startSupportChat:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาดในการเริ่มแชท"
      });
    }
  }

  /**
   * จัดการเนื้อหาการเรียนรู้
   */
  private async handleLearningContent(userId: string, replyToken: string, topic: string): Promise<void> {
    try {
      let title = "";
      let content = "";
      let tips = "";
      let examples = "";

      switch (topic) {
        case "phishing":
          title = "🎣 การตรวจจับฟิชชิ่ง";
          content = "ฟิชชิ่ง คือการหลอกลวงให้เหยื่อเปิดเผยข้อมูลส่วนตัว";
          tips = "• ตรวจสอบ URL ให้ดี\n• อย่าใส่รหัสผ่านในลิงค์ที่ได้รับ\n• ระวังอีเมลปลอม";
          examples = "ตัวอย่าง: 'คลิกเพื่อยืนยันบัญชีธนาคาร'";
          break;
        case "financial_scam":
          title = "💰 การหลอกลวงทางการเงิน";
          content = "การหลอกให้โอนเงิน จ่ายค่าธรรมเนียม หรือให้ข้อมูลการเงิน";
          tips = "• ธนาคารไม่เคยขอรหัส OTP ทาง SMS\n• ไม่มีรางวัลฟรีที่ต้องจ่ายค่าธรรมเนียม\n• ติดต่อธนาคารโดยตรงเสมอ";
          examples = "ตัวอย่าง: 'ได้รับรางวัล 100,000 บาท กรุณาจ่ายค่าธรรมเนียม 500 บาท'";
          break;
        case "online_safety":
          title = "📱 ความปลอดภัยออนไลน์";
          content = "หลักการป้องกันตัวเองในโลกออนไลน์";
          tips = "• ใช้รหัสผ่านที่แข็งแกร่ง\n• เปิด 2FA เสมอ\n• อัปเดตแอปอย่างสม่ำเสมอ\n• ระวังไวไฟสาธารณะ";
          examples = "ตัวอย่าง: ใช้รหัสผ่านแบบ 'MyP@ssw0rd123!' แทน '123456'";
          break;
        default:
          title = "📚 เนื้อหาการเรียนรู้";
          content = "เนื้อหาการเรียนรู้ด้านความปลอดภัยไซเบอร์";
          tips = "• เรียนรู้อย่างต่อเนื่อง\n• ฝึกฝนการตรวจจับภัยคุกคาม\n• แชร์ความรู้ให้คนรอบข้าง";
          examples = "ศึกษาเพิ่มเติมจากหลากหลายแหล่งข้อมูล";
      }

      const message = {
        type: "flex" as const,
        altText: title,
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: title,
                weight: "bold" as const,
                size: "xl" as const,
                color: "#1DB446"
              },
              {
                type: "separator" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: content,
                margin: "md" as const,
                wrap: true
              },
              {
                type: "text" as const,
                text: "💡 เคล็ดลับ:",
                weight: "bold" as const,
                margin: "lg" as const,
                color: "#FF9800"
              },
              {
                type: "text" as const,
                text: tips,
                margin: "sm" as const,
                wrap: true,
                size: "sm" as const
              },
              {
                type: "text" as const,
                text: "📝 ตัวอย่าง:",
                weight: "bold" as const,
                margin: "lg" as const,
                color: "#2196F3"
              },
              {
                type: "text" as const,
                text: examples,
                margin: "sm" as const,
                wrap: true,
                size: "sm" as const,
                style: "italic" as const
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "ทำแบบทดสอบ",
                  data: "knowledge_quiz"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "เรียนหัวข้ออื่น",
                  data: "start_learning_module"
                },
                style: "secondary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "กลับเมนูหลัก",
                  data: "back_to_menu"
                },
                style: "secondary" as const
              }
            ],
            spacing: "sm" as const
          }
        }
      };

      await this.client.replyMessage(replyToken, message as any);
    } catch (error) {
      console.error('❌ Error in handleLearningContent:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาดในการโหลดเนื้อหา"
      });
    }
  }

  /**
   * ส่งเคล็ดลับป้องกันเพิ่มเติม
   */
  private async sendMoreProtectionTips(userId: string, replyToken: string): Promise<void> {
    try {
      const message = {
        type: "flex" as const,
        altText: "เคล็ดลับป้องกันเพิ่มเติม",
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "💡 เคล็ดลับป้องกันเพิ่มเติม",
                weight: "bold" as const,
                size: "xl" as const,
                color: "#1DB446"
              },
              {
                type: "separator" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: "🔐 เคล็ดลับด้านรหัสผ่าน:",
                weight: "bold" as const,
                margin: "md" as const,
                color: "#2196F3"
              },
              {
                type: "text" as const,
                text: "• ใช้รหัส 12 ตัวขึ้นไป\n• ผสมตัวเลข สัญลักษณ์ ตัวพิมพ์ใหญ่-เล็ก\n• ไม่ใช้ข้อมูลส่วนตัว\n• ใช้รหัสผ่านต่างกันแต่ละเว็บไซต์",
                margin: "sm" as const,
                wrap: true,
                size: "sm" as const
              },
              {
                type: "text" as const,
                text: "📧 เคล็ดลับด้านอีเมล:",
                weight: "bold" as const,
                margin: "md" as const,
                color: "#FF9800"
              },
              {
                type: "text" as const,
                text: "• ตรวจสอบผู้ส่งก่อนเปิด\n• ไม่คลิกลิงค์ที่น่าสงสัย\n• ระวังไฟล์แนบ\n• ตรวจสอบการสะกดคำ",
                margin: "sm" as const,
                wrap: true,
                size: "sm" as const
              },
              {
                type: "text" as const,
                text: "📱 เคล็ดลับมือถือ:",
                weight: "bold" as const,
                margin: "md" as const,
                color: "#9C27B0"
              },
              {
                type: "text" as const,
                text: "• ล็อคหน้าจอเสมอ\n• อัปเดต OS อย่างสม่ำเสมอ\n• ติดตั้งแอปจาก Store เท่านั้น\n• เปิด Find My Device",
                margin: "sm" as const,
                wrap: true,
                size: "sm" as const
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "ดูรูปแบบการหลอกลวง",
                  data: "view_more_patterns"
                },
                style: "primary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "กลับเมนูหลัก",
                  data: "back_to_menu"
                },
                style: "secondary" as const
              }
            ],
            spacing: "sm" as const
          }
        }
      };

      await this.client.replyMessage(replyToken, message as any);
    } catch (error) {
      console.error('❌ Error in sendMoreProtectionTips:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาดในการโหลดเคล็ดลับ"
      });
    }
  }

  /**
   * จัดการตรวจสอบด่วน
   */
  private async handleQuickCheck(userId: string, replyToken: string): Promise<void> {
    try {
      // เปลี่ยนสถานะให้รอข้อความ
      this.sessionManager.updateSessionState(userId, 'WAITING_FOR_MESSAGE_TO_CHECK');
      
      const message = {
        type: "flex" as const,
        altText: "ตรวจสอบด่วน",
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "⚡ ตรวจสอบด่วน",
                weight: "bold" as const,
                size: "xl" as const,
                color: "#1DB446"
              },
              {
                type: "separator" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: "📱 ส่งข้อความที่ต้องการตรวจสอบ:",
                margin: "md" as const,
                weight: "bold" as const
              },
              {
                type: "text" as const,
                text: "• ข้อความ SMS\n• ข้อความ LINE\n• ลิงค์เว็บไซต์\n• เบอร์โทรศัพท์",
                margin: "sm" as const,
                wrap: true,
                size: "sm" as const
              },
              {
                type: "text" as const,
                text: "🚀 ระบบจะวิเคราะห์และตอบกลับทันที",
                margin: "md" as const,
                wrap: true,
                color: "#666666"
              }
            ]
          }
        }
      };

      await this.client.replyMessage(replyToken, message as any);
    } catch (error) {
      console.error('❌ Error in handleQuickCheck:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาดในการเริ่มตรวจสอบด่วน"
      });
    }
  }

  /**
   * จัดการช่วยเหลือด่วน
   */
  private async handleQuickHelp(userId: string, replyToken: string): Promise<void> {
    try {
      const message = {
        type: "flex" as const,
        altText: "ช่วยเหลือด่วน",
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "🆘 ช่วยเหลือด่วน",
                weight: "bold" as const,
                size: "xl" as const,
                color: "#FF9800"
              },
              {
                type: "separator" as const,
                margin: "md" as const
              },
              {
                type: "text" as const,
                text: "📞 โทรด่วน:",
                weight: "bold" as const,
                margin: "md" as const,
                color: "#F44336"
              },
              {
                type: "text" as const,
                text: "🚨 ตำรวจ: 191\n🛡️ ThaiCERT: 1441\n🚑 แพทย์ฉุกเฉิน: 1669",
                margin: "sm" as const,
                wrap: true,
                size: "sm" as const
              },
              {
                type: "text" as const,
                text: "💡 ขั้นตอนเบื้องต้น:",
                weight: "bold" as const,
                margin: "md" as const,
                color: "#1DB446"
              },
              {
                type: "text" as const,
                text: "1. หยุดทำตามข้อความทันที\n2. ไม่โอนเงินหรือให้ข้อมูล\n3. บันทึกหลักฐาน (Screenshot)\n4. รายงานต่อเจ้าหน้าที่",
                margin: "sm" as const,
                wrap: true,
                size: "sm" as const
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "📞 โทร 191 ตำรวจ",
                  data: "call_police_191"
                },
                style: "primary" as const,
                color: "#F44336"
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "🛡️ โทร 1441 ThaiCERT",
                  data: "call_thaicert_1441"
                },
                style: "secondary" as const
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "💬 แชทกับทีมสนับสนุน",
                  data: "start_support_chat"
                },
                style: "secondary" as const
              }
            ],
            spacing: "sm" as const
          }
        }
      };

      await this.client.replyMessage(replyToken, message as any);
    } catch (error) {
      console.error('❌ Error in handleQuickHelp:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาดในการแสดงความช่วยเหลือ"
      });
    }
  }

  /**
   * จัดการตรวจสอบสำหรับผู้สูงอายุ
   */
  private async handleElderlyCheck(userId: string, replyToken: string): Promise<void> {
    try {
      // เปลี่ยนสถานะให้รอข้อความ
      this.sessionManager.updateSessionState(userId, 'WAITING_FOR_MESSAGE_TO_CHECK');
      
      const message = {
        type: "flex" as const,
        altText: "ตรวจสอบข้อความ",
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "🔍 ตรวจสอบข้อความ",
                weight: "bold" as const,
                size: "xxl" as const,
                color: "#1DB446"
              },
              {
                type: "separator" as const,
                margin: "lg" as const
              },
              {
                type: "text" as const,
                text: "📱 ส่งข้อความที่ได้รับมา",
                margin: "lg" as const,
                weight: "bold" as const,
                size: "lg" as const
              },
              {
                type: "text" as const,
                text: "อย่าเพิ่งทำตามข้อความที่ได้รับ\nให้ส่งข้อความมาให้เราตรวจสอบก่อน",
                margin: "md" as const,
                wrap: true,
                size: "lg" as const,
                color: "#FF9800"
              },
              {
                type: "text" as const,
                text: "🛡️ ระบบจะตรวจสอบให้ฟรี",
                margin: "lg" as const,
                size: "lg" as const,
                color: "#1DB446"
              }
            ]
          }
        }
      };

      await this.client.replyMessage(replyToken, message as any);
    } catch (error) {
      console.error('❌ Error in handleElderlyCheck:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาด กรุณาลองใหม่"
      });
    }
  }

  /**
   * จัดการช่วยเหลือสำหรับผู้สูงอายุ
   */
  private async handleElderlyHelp(userId: string, replyToken: string): Promise<void> {
    try {
      const message = {
        type: "flex" as const,
        altText: "ขอความช่วยเหลือ",
        contents: {
          type: "bubble" as const,
          body: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "text" as const,
                text: "🆘 ขอความช่วยเหลือ",
                weight: "bold" as const,
                size: "xxl" as const,
                color: "#FF9800"
              },
              {
                type: "separator" as const,
                margin: "lg" as const
              },
              {
                type: "text" as const,
                text: "📞 หมายเลขสำคัญ",
                margin: "lg" as const,
                weight: "bold" as const,
                size: "xl" as const,
                color: "#F44336"
              },
              {
                type: "text" as const,
                text: "🚨 ตำรวจ: 191\n🛡️ ศูนย์รับแจ้ง: 1441",
                margin: "md" as const,
                wrap: true,
                size: "xl" as const
              },
              {
                type: "text" as const,
                text: "⚠️ สิ่งที่ต้องจำ",
                margin: "lg" as const,
                weight: "bold" as const,
                size: "xl" as const,
                color: "#FF9800"
              },
              {
                type: "text" as const,
                text: "• อย่าให้เงินใคร\n• อย่าบอกรหัส ATM\n• อย่าโอนเงิน\n• ปรึกษาลูกหลานก่อน",
                margin: "md" as const,
                wrap: true,
                size: "lg" as const
              }
            ]
          },
          footer: {
            type: "box" as const,
            layout: "vertical" as const,
            contents: [
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "📞 โทรตำรวจ 191",
                  data: "call_police_191"
                },
                style: "primary" as const,
                color: "#F44336"
              },
              {
                type: "button" as const,
                action: {
                  type: "postback" as const,
                  label: "🔍 ตรวจสอบข้อความ",
                  data: "check_message_elderly"
                },
                style: "secondary" as const
              }
            ],
            spacing: "md" as const
          }
        }
      };

      await this.client.replyMessage(replyToken, message as any);
    } catch (error) {
      console.error('❌ Error in handleElderlyHelp:', error);
      await this.client.replyMessage(replyToken, {
        type: "text",
        text: "❌ เกิดข้อผิดพลาด กรุณาลองใหม่"
      });
    }
  }
}
