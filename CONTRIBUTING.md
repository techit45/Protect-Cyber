# Contributing to เกราะไซเบอร์ (ProtectCyber)

ขอบคุณที่สนใจมีส่วนร่วมในโปรเจคเกราะไซเบอร์! 🙏

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

---

## 📜 Code of Conduct

### Our Pledge

เราเชื่อว่าทุกคนควรได้รับการปฏิบัติด้วยความเคารพ ไม่ว่าจะเป็น:
- 🙋 เพศ อายุ เชื้อชาติ ศาสนา
- 💼 ระดับประสบการณ์
- 🎓 การศึกษา
- 🌈 รสนิยมทางเพศ

### Our Standards

**ควรทำ ✅:**
- ใช้ภาษาที่เป็นมิตรและให้กำลังใจ
- เคารพความคิดเห็นที่แตกต่าง
- รับ feedback อย่างสร้างสรรค์
- มุ่งเน้นสิ่งที่ดีที่สุดสำหรับชุมชน

**ไม่ควรทำ ❌:**
- ใช้ภาษาหรือภาพที่ไม่เหมาะสม
- โจมตีบุคคล
- Trolling หรือ harassment
- เผยแพร่ข้อมูลส่วนตัวของผู้อื่น

---

## 🤝 How Can I Contribute?

### Reporting Bugs

พบ Bug? รายงานได้ที่ [GitHub Issues](https://github.com/yourusername/protectcyber/issues)

**ข้อมูลที่ควรระบุ:**
- 📝 คำอธิบายปัญหาที่ชัดเจน
- 🔄 ขั้นตอนการทำซ้ำ (Reproduce)
- 💻 Environment (OS, Node version, etc.)
- 📷 Screenshot (ถ้ามี)
- 📊 Log files (ถ้ามี)

**Template:**
```markdown
## Bug Description
[คำอธิบายสั้นๆ]

## Steps to Reproduce
1. ...
2. ...
3. ...

## Expected Behavior
[สิ่งที่ควรเกิดขึ้น]

## Actual Behavior
[สิ่งที่เกิดขึ้นจริง]

## Environment
- OS: macOS 14.0
- Node: v18.17.0
- Version: 1.0.0

## Screenshots
[ถ้ามี]
```

### Suggesting Features

มีไอเดียใหม่? เสนอได้ที่ [GitHub Discussions](https://github.com/yourusername/protectcyber/discussions)

**ข้อมูลที่ควรระบุ:**
- 💡 ปัญหาที่ feature นี้แก้ไข
- 🎯 ผู้ใช้กลุ่มเป้าหมาย
- 📋 Use cases ตัวอย่าง
- 🔮 ทางเลือกอื่นที่พิจารณา

### Improving Documentation

- 📚 แก้ไข typos
- 📝 เพิ่มตัวอย่าง
- 🌐 แปลเป็นภาษาอื่น
- 🎨 ปรับปรุง formatting

---

## 💻 Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- Code editor (แนะนำ VS Code)

### Setup Steps

```bash
# 1. Fork repository บน GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/protectcyber.git
cd protectcyber

# 3. Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/protectcyber.git

# 4. Install dependencies
npm install

# 5. Copy .env.example
cp .env.example .env

# 6. Edit .env with your API keys
nano .env

# 7. Run development server
npm run dev

# 8. Run tests
npm test
```

### Project Structure

```
protectcyber/
├── src/
│   ├── app.ts              # Main application
│   ├── config/             # Configuration files
│   ├── middleware/         # Express middleware
│   └── ...
├── tests/                  # Test files
├── docs/                   # Documentation
├── .env.example            # Environment template
├── package.json
└── README.md
```

---

## 🎨 Coding Standards

### TypeScript Style Guide

```typescript
// ✅ Good
interface UserProfile {
  userId: string;
  name: string;
  isElderly: boolean;
}

function analyzeMessage(message: string): ThreatAnalysis {
  // Implementation
}

// ❌ Bad
interface user_profile {
  userid: string;
  Name: string;
  is_elderly: boolean;
}

function analyze_message(msg) {
  // Implementation
}
```

### Naming Conventions

- **Files**: camelCase (e.g., `threatDetector.ts`)
- **Classes**: PascalCase (e.g., `ThreatDetectorService`)
- **Functions**: camelCase (e.g., `analyzeMessage`)
- **Constants**: UPPER_CASE (e.g., `MAX_RETRIES`)
- **Interfaces**: PascalCase (e.g., `ThreatAnalysis`)

### Comments

```typescript
// ใช้ภาษาไทยสำหรับ comments ธุรกิจ logic
// ใช้ภาษาอังกฤษสำหรับ technical comments

/**
 * วิเคราะห์ข้อความเพื่อตรวจจับภัยคุกคาม
 * Analyzes message to detect cybersecurity threats
 * 
 * @param message - ข้อความที่ต้องการวิเคราะห์
 * @param options - ตัวเลือกการวิเคราะห์
 * @returns ผลการวิเคราะห์ภัยคุกคาม
 */
async function analyzeMessage(
  message: string,
  options?: AnalysisOptions
): Promise<ThreatAnalysis> {
  // Implementation
}
```

### Git Commit Messages

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: Feature ใหม่
- `fix`: แก้ Bug
- `docs`: เอกสาร
- `style`: Code style (formatting, etc.)
- `refactor`: Refactoring
- `test`: เพิ่ม/แก้ tests
- `chore`: Maintenance

**Examples:**
```bash
feat(ai): เพิ่มการตรวจจับภาษาถิ่นไทย

เพิ่มความสามารถในการวิเคราะห์ภาษาอีสาน ใต้ เหนือ
สำหรับให้ระบบเข้าใจภาษาท้องถิ่นได้ดีขึ้น

Closes #123
```

```bash
fix(line-bot): แก้ปัญหา webhook timeout

- เพิ่ม async processing
- ลด response time จาก 5s -> 1.8s
- ปรับปรุง error handling

Fixes #456
```

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] ✅ Code ทำงานถูกต้อง
- [ ] ✅ Tests ผ่านทั้งหมด
- [ ] ✅ Lint ไม่มี errors
- [ ] ✅ Documentation อัปเดตแล้ว
- [ ] ✅ Commit messages ถูกต้อง
- [ ] ✅ Branch อัปเดตจาก `main`

### Creating Pull Request

```bash
# 1. Create feature branch
git checkout -b feature/amazing-feature

# 2. Make changes
# ... edit files ...

# 3. Test changes
npm test
npm run lint

# 4. Commit changes
git add .
git commit -m "feat: เพิ่ม amazing feature"

# 5. Push to your fork
git push origin feature/amazing-feature

# 6. Create Pull Request on GitHub
```

### Pull Request Template

```markdown
## Description
[คำอธิบายการเปลี่ยนแปลง]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing done

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review done
- [ ] Comments added
- [ ] Documentation updated
- [ ] No new warnings

## Screenshots
[ถ้ามี]

## Related Issues
Closes #[issue number]
```

### Review Process

1. **Automated Checks** - CI/CD จะรัน tests อัตโนมัติ
2. **Code Review** - Maintainer จะ review code
3. **Feedback** - อาจมีการขอแก้ไข
4. **Approval** - เมื่อผ่าน review
5. **Merge** - Maintainer จะ merge

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- threatDetector.test.ts

# Run in watch mode
npm run test:watch
```

### Writing Tests

```typescript
import { analyzeMessage } from '../src/services/threatDetector';

describe('ThreatDetector', () => {
  describe('analyzeMessage', () => {
    it('should detect lottery scam', async () => {
      const message = 'ยินดีด้วย! คุณได้รับรางวัล 500,000 บาท';
      const result = await analyzeMessage(message);
      
      expect(result.riskLevel).toBe('CRITICAL');
      expect(result.threatType).toBe('lottery_scam');
      expect(result.riskScore).toBeGreaterThan(0.8);
    });
    
    it('should mark safe message as SAFE', async () => {
      const message = 'สวัสดีครับ วันนี้สบายดีไหม';
      const result = await analyzeMessage(message);
      
      expect(result.riskLevel).toBe('SAFE');
      expect(result.riskScore).toBeLessThan(0.2);
    });
  });
});
```

---

## 📚 Documentation

### Writing Documentation

- ใช้ภาษาไทยและอังกฤษควบคู่กัน
- ให้ตัวอย่างที่ชัดเจน
- ใส่ code snippets
- เพิ่ม screenshots ถ้าจำเป็น

### Documentation Locations

- `README.md` - Overview และ Quick Start
- `SETUP_GUIDE.md` - การติดตั้งละเอียด
- `API_DOCUMENTATION.md` - API Reference
- `ARCHITECTURE_DIAGRAM.md` - System Architecture
- `docs/` - เอกสารเพิ่มเติม

---

## 🏆 Recognition

Contributors ทุกคนจะได้รับการบันทึกใน:
- README.md Contributors section
- CHANGELOG.md
- GitHub Contributors page

---

## 📞 Questions?

- 💬 [GitHub Discussions](https://github.com/yourusername/protectcyber/discussions)
- 📧 Email: contribute@protectcyber.org
- 💬 Discord: [Join our server](https://discord.gg/protectcyber)

---

## 📄 License

โดยการมีส่วนร่วม คุณยอมรับว่า contributions ของคุณจะอยู่ภายใต้ [MIT License](LICENSE)

---

<div align="center">

**ขอบคุณที่ช่วยทำให้อินเทอร์เน็ตปลอดภัยขึ้นสำหรับคนไทย! 🇹🇭**

Made with ❤️ by Cyber Guardian Team

</div>
