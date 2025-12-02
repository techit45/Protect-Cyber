# 📂 Source Code Structure

## Overview

โฟลเดอร์นี้ประกอบด้วย source code หลักของระบบ ProtectCyber

---

## 📁 Directory Structure

```
src/
├── app.ts                  # Main application entry point
├── config/                 # Configuration files
├── data/                   # Data files (trusted lists, patterns)
├── middleware/             # Express middleware (placeholder)
├── services/               # Core business logic services (30+ files)
├── types/                  # TypeScript type definitions (placeholder)
└── utils/                  # Utility functions
```

---

## 🎯 Main Application

### `app.ts`
Main Express application with:
- LINE Bot webhook endpoint
- REST API endpoints
- Health check
- Error handling

**Key Endpoints:**
- `GET /health` - Health check
- `POST /api/analyze` - Analyze message
- `POST /api/feedback` - Submit feedback
- `GET /api/metrics` - Get metrics
- `POST /webhook/line` - LINE webhook

---

## 🔧 Core Services (30+ files)

### AI & Analysis Services
- `threatDetector.ts` - Main threat detection with OpenRouter AI
- `thaiThreatIntelligence.ts` - Thai-specific threat intelligence
- `thaiCyberAI.ts` - Thai Cyber AI integration
- `machineLearningDetector.ts` - ML-based detection
- `advancedThreatDetector.ts` - Advanced threat analysis
- `aiAnalyzer.ts` - AI analysis service
- `urlContentAnalyzer.ts` - URL content analysis

### Elderly & Protection Services
- `behavioralBiometrics.ts` - Elderly detection & duress detection
- `elderlyThreatTextGenerator.ts` - Elderly-specific messages
- `elderlyUXService.ts` - Elderly UX optimization
- `familyLinkService.ts` - Family notification system

### Real-time & Detection Services
- `realTimeThreatDetection.ts` - Real-time threat orchestration
- `unknownThreatDetector.ts` - Unknown threat detection
- `unknownThreatCardGenerator.ts` - Unknown threat UI cards

### Security Services
- `sslSecurityChecker.ts` - SSL/TLS validation
- `domainReputationChecker.ts` - Domain reputation check

### Learning & Feedback Services
- `feedbackLearningSystem.ts` - Feedback learning
- `educationalContent.ts` - Educational content generator

### LINE Bot Services
- `lineBot.ts` - LINE Bot SDK integration
- `richMenu.ts` - Rich Menu management
- `richMenuManager.ts` - Rich Menu state manager
- `dynamicMenuSwitcher.ts` - Dynamic menu switching
- `menuPersonalization.ts` - Personalized menus
- `menuAnalytics.ts` - Menu usage analytics
- `tigerMessage.ts` - Tiger-themed messages

### Storage & Session Services
- `messageStorage.ts` - In-memory message storage
- `sessionManager.ts` - Session management

### Package & Feature Services
- `packageManager.ts` - Package management
- `packageGatedFeatures.ts` - Feature gating
- `usageCounter.ts` - Usage tracking

### Multilingual Support
- `multilingualSupport.ts` - Multi-language support

---

## 📊 Data Files

### `data/`
- `trustedPhoneNumbers.ts` - Trusted phone number list
- `trustedWebsites.ts` - Trusted website list
- `thaiThreats.ts` - Thai threat patterns (if exists)

---

## ⚙️ Configuration

### `config/`
- `trustedPhoneConfig.json` - Phone number configuration
- Other config files

---

## 🛠️ Utilities

### `utils/`
- `logger.ts` - Winston logger setup
- `phoneNumberDetector.ts` - Phone number detection
- `richMenuClient.ts` - Rich Menu client
- `configLoader.ts` - Configuration loader

---

## 🎨 Architecture Patterns

### Service Layer Pattern
All business logic is organized into services:
```typescript
// Example: ThreatDetectorService
class ThreatDetectorService {
  async analyze(message: string): Promise<ThreatAnalysis> {
    // Business logic here
  }
}
```

### Dependency Injection
Services are injected where needed:
```typescript
const threatDetector = new ThreatDetectorService();
const lineBotService = new LineBotService(threatDetector);
```

### Event-Driven Architecture
Real-time detection uses events:
```typescript
realTimeDetection.on('threatDetected', (event) => {
  // Handle threat
});
```

---

## 🔑 Key Technologies

- **TypeScript** - Type-safe development
- **Express.js** - Web framework
- **LINE Bot SDK** - Chat interface
- **OpenRouter API** - AI analysis
- **Winston** - Logging
- **Axios** - HTTP client

---

## 🚀 Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

---

## 📝 Code Style

### Naming Conventions
- Files: `camelCase.ts`
- Classes: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_CASE`

### Comments
```typescript
// Business logic comments in Thai
// Technical comments in English

/**
 * วิเคราะห์ข้อความเพื่อตรวจจับภัยคุกคาม
 * Analyzes message for threat detection
 */
async function analyzeMessage(message: string) {
  // Implementation
}
```

---

## 🔒 Security Considerations

- ✅ No hardcoded API keys
- ✅ Environment variables via .env
- ✅ Input validation
- ✅ Error handling
- ✅ Rate limiting (in production)

---

## 📚 Additional Documentation

- [API Documentation](../API_DOCUMENTATION.md)
- [Setup Guide](../SETUP_GUIDE.md)
- [Architecture](../ARCHITECTURE_DIAGRAM.md)

---

Made with ❤️ by Cyber Guardian Team 🇹🇭
