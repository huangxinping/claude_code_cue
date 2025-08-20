#!/bin/bash

# Claude Code Cue - 打包脚本

set -e

echo "📦 打包 Claude Code Cue..."

# 记录打包日志
PACK_LOG="logs/pack-$(date +%Y%m%d-%H%M%S).log"
mkdir -p logs

echo "⏰ 打包开始时间: $(date)" | tee $PACK_LOG

# 1. 环境检查
echo "" | tee -a $PACK_LOG
echo "🔍 环境检查..." | tee -a $PACK_LOG
echo "Node.js 版本: $(node --version)" | tee -a $PACK_LOG
echo "平台: $(uname -s)" | tee -a $PACK_LOG
echo "架构: $(uname -m)" | tee -a $PACK_LOG

# 2. 清理和构建
echo "" | tee -a $PACK_LOG
echo "🧹 清理和构建..." | tee -a $PACK_LOG
npm run clean | tee -a $PACK_LOG
npm run build | tee -a $PACK_LOG

if [ $? -ne 0 ]; then
    echo "❌ 构建失败" | tee -a $PACK_LOG
    exit 1
fi

# 3. 打包应用
echo "" | tee -a $PACK_LOG
echo "📦 开始打包..." | tee -a $PACK_LOG

# 检查是否指定了特定平台
if [ "$1" = "all" ]; then
    echo "🌍 打包所有平台..." | tee -a $PACK_LOG
    npm run pack:all 2>&1 | tee -a $PACK_LOG
else
    echo "🖥️ 打包当前平台..." | tee -a $PACK_LOG
    npm run pack 2>&1 | tee -a $PACK_LOG
fi

if [ $? -eq 0 ]; then
    echo "" | tee -a $PACK_LOG
    echo "✅ 打包成功！" | tee -a $PACK_LOG
    
    # 显示打包结果
    if [ -d "release" ]; then
        echo "📁 打包输出:" | tee -a $PACK_LOG
        ls -la release/ | tee -a $PACK_LOG
        
        # 显示文件大小
        echo "" | tee -a $PACK_LOG
        echo "💾 文件大小:" | tee -a $PACK_LOG
        for file in release/*; do
            if [ -f "$file" ]; then
                SIZE=$(du -sh "$file" | cut -f1)
                echo "  - $(basename "$file"): $SIZE" | tee -a $PACK_LOG
            fi
        done
    fi
    
    echo "" | tee -a $PACK_LOG
    echo "⏰ 打包完成时间: $(date)" | tee -a $PACK_LOG
    echo "📄 详细日志: $PACK_LOG"
    
    echo ""
    echo "🎉 打包完成！可以在 release/ 目录找到安装包"
else
    echo "❌ 打包失败" | tee -a $PACK_LOG
    exit 1
fi