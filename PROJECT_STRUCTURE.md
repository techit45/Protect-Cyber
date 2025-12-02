# 📂 Project Structure - เกราะไซเบอร์

## Complete Directory Structure

```
ProtectCyber/
├── 📄 README.md                           # Main documentation
├── 📄 SETUP_GUIDE.md                      # Installation guide
├── 📄 API_DOCUMENTATION.md                # API reference
├── 📄 HACKATHON_PITCH.md                 # Pitch deck
├── 📄 HACKATHON_CHECKLIST.md             # Submission checklist
├── 📄 ARCHITECTURE_DIAGRAM.md             # System architecture
├── 📄 ICT_AWARD_SUBMISSION_DOCUMENT.md   # Award submission
├── 📄 QUICK_REFERENCE.md                  # Quick reference
├── 📄 CONTRIBUTING.md                     # Contribution guide
├── 📄 CHANGELOG.md                        # Version history
├── 📄 LICENSE                             # MIT License
├── 📄 SUMMARY.txt                         # Project summary
├── 📄 package.json                        # Dependencies
├── 📄 tsconfig.json                       # TypeScript config
├── 📄 .env.example                        # Environment template
├── 📄 .gitignore                          # Git ignore
├── 🔧 deploy.sh                           # Deploy script
├── 🌐 diagram.html                        # Interactive diagram
├── 🌐 index.html                          # Demo page
│
└── 📁 src/                                # Source code (38 files, 824KB)
    ├── app.ts                             # Main application
    │
    ├── 📁 services/                       # Business logic (30+ services)
    │   ├── threatDetector.ts              # Main threat detection
    │   ├── thaiThreatIntelligence.ts      # Thai threat intelligence
    │   ├── thaiCyberAI.ts                 # Thai Cyber AI
    │   ├── behavioralBiometrics.ts        # Elderly & duress detection
    │   ├── realTimeThreatDetection.ts     # Real-time orchestration
    │   ├── machineLearningDetector.ts     # ML detection
    │   ├── aiAnalyzer.ts                  # AI analysis
    │   ├── urlContentAnalyzer.ts          # URL analysis
    │   ├── sslSecurityChecker.ts          # SSL validation
    │   ├── domainReputationChecker.ts     # Domain reputation
    │   ├── educationalContent.ts          # Educational content
    │   ├── elderlyThreatTextGenerator.ts  # Elderly messages
    │   ├── elderlyUXService.ts            # Elderly UX
    │   ├── familyLinkService.ts           # Family alerts
    │   ├── feedbackLearningSystem.ts      # Feedback learning
    │   ├── lineBot.ts                     # LINE Bot SDK
    │   ├── richMenu.ts                    # Rich Menu
    │   ├── richMenuManager.ts             # Rich Menu manager
    │   ├── dynamicMenuSwitcher.ts         # Dynamic menus
    │   ├── menuPersonalization.ts         # Menu personalization
    │   ├── menuAnalytics.ts               # Menu analytics
    │   ├── messageStorage.ts              # Message storage
    │   ├── sessionManager.ts              # Session management
    │   ├── packageManager.ts              # Package management
    │   ├── packageGatedFeatures.ts        # Feature gating
    │   ├── usageCounter.ts                # Usage tracking
    │   ├── unknownThreatDetector.ts       # Unknown threats
    │   ├── unknownThreatCardGenerator.ts  # Unknown threat UI
    │   ├── advancedThreatDetector.ts      # Advanced detection
    │   ├── multilingualSupport.ts         # Multi-language
    │   └── tigerMessage.ts                # Tiger messages
    │
    ├── 📁 utils/                          # Utility functions
    │   ├── logger.ts                      # Winston logger
    │   ├── phoneNumberDetector.ts         # Phone detection
    │   ├── richMenuClient.ts              # Rich Menu client
    │   └── configLoader.ts                # Config loader
    │
    ├── 📁 data/                           # Data files
    │   ├── trustedPhoneNumbers.ts         # Trusted phones
    │   └── trustedWebsites.ts             # Trusted websites
    │
    ├── 📁 config/                         # Configuration
    │   └── trustedPhoneConfig.json        # Phone config
    │
    ├── 📁 middleware/                     # Express middleware
    │   └── (placeholder)
    │
    └── 📁 types/                          # TypeScript types
        └── (placeholder)
```

---

## 📊 File Count & Size

```
Total Files:        ~60 files
Documentation:      11 files (120KB)
Configuration:      5 files (5KB)
Demo/Scripts:       4 files (60KB)
Source Code:        38 files (824KB)
Total Size:         ~1 MB
```

---

## 🎯 Key Components

### 1. Documentation (11 files)
Professional documentation covering all aspects:
- Setup, API, Architecture
- Hackathon pitch and checklist
- Contributing guide

### 2. Source Code (38 files)
Complete backend implementation:
- 30+ service modules
- 4 utility modules
- Data and config files
- Main application

### 3. Configuration (5 files)
Everything needed to run:
- package.json with dependencies
- TypeScript configuration
- Environment template
- Git configuration

### 4. Demo & Scripts (4 files)
Ready to present:
- Interactive diagram
- Demo page
- Automated deploy script

---

## 🔑 Core Files

### Must Read First
1. `README.md` - Start here
2. `SETUP_GUIDE.md` - How to install
3. `QUICK_REFERENCE.md` - Quick commands

### For Judges
1. `HACKATHON_PITCH.md` - Pitch deck
2. `ARCHITECTURE_DIAGRAM.md` - System design
3. `diagram.html` - Interactive demo

### For Developers
1. `src/app.ts` - Main app
2. `src/services/` - Business logic
3. `API_DOCUMENTATION.md` - API reference

---

## 🚀 Development Workflow

```
1. Read README.md
2. Follow SETUP_GUIDE.md
3. Edit .env (from .env.example)
4. npm install
5. npm run dev
6. Test with curl or LINE Bot
```

---

## 📦 Dependencies

### Production
- @line/bot-sdk - LINE Bot
- express - Web framework
- axios - HTTP client
- dotenv - Environment variables
- helmet - Security
- winston - Logging
- cors - CORS support

### Development
- typescript - Type safety
- ts-node - TS execution
- nodemon - Auto restart
- eslint - Code linting
- jest - Testing
- prettier - Code formatting

---

## 🎨 Code Organization

### By Layer
```
app.ts          → Entry point
services/       → Business logic
utils/          → Helper functions
data/           → Static data
config/         → Configuration
middleware/     → Express middleware
types/          → Type definitions
```

### By Feature
```
Threat Detection:
  - threatDetector.ts
  - thaiThreatIntelligence.ts
  - machineLearningDetector.ts

Elderly Protection:
  - behavioralBiometrics.ts
  - elderlyThreatTextGenerator.ts
  - familyLinkService.ts

LINE Bot:
  - lineBot.ts
  - richMenu.ts
  - messageStorage.ts
```

---

## 🔒 Security

### What's Included ✅
- Input validation
- Error handling
- Security headers (helmet)
- CORS configuration
- Environment variables

### What's NOT Included ❌
- No hardcoded secrets
- No API keys in code
- No database credentials
- No personal data

---

## 📝 Code Quality

### Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- JSDoc comments
- Error handling

### Testing
- Unit tests ready
- Integration tests ready
- Manual test scenarios

---

Made with ❤️ by Cyber Guardian Team 🇹🇭
