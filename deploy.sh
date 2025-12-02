#!/bin/bash

# 🚀 Deploy Script สำหรับ ProtectCyber
# สคริปต์นี้ใช้สำหรับ deploy โปรเจคไป GitHub

set -e  # หยุดทำงานถ้ามี error

echo "🛡️ เกราะไซเบอร์ - Deployment Script"
echo "======================================"
echo ""

# ตรวจสอบว่าอยู่ใน Github-Deploy directory หรือไม่
if [[ ! -f "package.json" ]]; then
    echo "❌ Error: กรุณารันสคริปต์ในโฟลเดอร์ Github-Deploy"
    exit 1
fi

# ตรวจสอบว่ามี git หรือไม่
if ! command -v git &> /dev/null; then
    echo "❌ Error: ไม่พบ git กรุณาติดตั้งก่อน"
    exit 1
fi

# ตรวจสอบว่า git init แล้วหรือยัง
if [[ ! -d ".git" ]]; then
    echo "📦 เริ่มต้น Git Repository..."
    git init
    echo "✅ Git initialized"
fi

# ตรวจสอบว่ามีการเปลี่ยนแปลงหรือไม่
if [[ -n $(git status -s) ]]; then
    echo ""
    echo "📝 การเปลี่ยนแปลงที่ตรวจพบ:"
    git status -s
    echo ""
    
    # ถาม user ว่าจะ commit หรือไม่
    read -p "ต้องการ commit การเปลี่ยนแปลงหรือไม่? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Add all files
        echo "📦 Adding files..."
        git add .
        
        # ขอ commit message
        read -p "Commit message (Enter สำหรับ default): " commit_msg
        
        if [[ -z "$commit_msg" ]]; then
            commit_msg="Update: Hackathon submission $(date +%Y-%m-%d)"
        fi
        
        # Commit
        echo "💾 Committing..."
        git commit -m "$commit_msg"
        echo "✅ Committed successfully"
    fi
else
    echo "✅ ไม่มีการเปลี่ยนแปลง"
fi

# ตรวจสอบว่ามี remote repository หรือไม่
if ! git remote | grep -q "origin"; then
    echo ""
    echo "🌐 ยังไม่มี remote repository"
    read -p "URL ของ GitHub repository (เช่น https://github.com/username/repo.git): " repo_url
    
    if [[ -n "$repo_url" ]]; then
        git remote add origin "$repo_url"
        echo "✅ เพิ่ม remote repository แล้ว"
    else
        echo "⚠️ ไม่ได้เพิ่ม remote repository"
    fi
fi

# แสดง remote repository
echo ""
echo "📡 Remote Repository:"
git remote -v

# ถาม user ว่าจะ push หรือไม่
echo ""
read -p "ต้องการ push ไป GitHub หรือไม่? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # ตรวจสอบ branch
    current_branch=$(git branch --show-current)
    
    if [[ -z "$current_branch" ]]; then
        echo "📌 สร้าง branch main..."
        git branch -M main
        current_branch="main"
    fi
    
    echo "🚀 Pushing to $current_branch..."
    
    # ถามว่าจะ force push หรือไม่
    read -p "ต้องการ force push หรือไม่? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push -u origin $current_branch --force
    else
        git push -u origin $current_branch
    fi
    
    echo ""
    echo "✅ Push สำเร็จ!"
    echo ""
    echo "🎉 Deployment Complete!"
    echo ""
    echo "📍 Repository URL:"
    git remote get-url origin
    echo ""
    echo "🌐 ดู Repository บน GitHub:"
    repo_url=$(git remote get-url origin)
    # แปลง git URL เป็น https URL
    https_url=$(echo $repo_url | sed 's/\.git$//' | sed 's/git@github\.com:/https:\/\/github.com\//')
    echo "$https_url"
else
    echo "⏭️ ข้าม push ไป GitHub"
fi

echo ""
echo "======================================"
echo "✅ สคริปต์เสร็จสิ้น"
echo ""
echo "📝 Next Steps:"
echo "   1. ตรวจสอบ Repository บน GitHub"
echo "   2. อัปเดต README.md ให้ URL ถูกต้อง"
echo "   3. ตั้งค่า GitHub Pages (ถ้าต้องการ)"
echo "   4. เพิ่ม Contributors และ License"
echo ""
echo "🏆 Good luck กับการแข่งขัน Hackathon!"
echo ""
