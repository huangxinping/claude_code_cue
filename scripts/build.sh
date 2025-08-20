#!/bin/bash

# Claude Code Cue - 构建脚本

set -e

echo "🔨 构建 Claude Code Cue..."

# 检查环境
NODE_VERSION=$(node --version)
echo "📦 Node.js 版本: $NODE_VERSION"

# 清理之前的构建
echo "🧹 清理构建目录..."
npm run clean

# 类型检查
echo "🔍 TypeScript 类型检查..."
npm run typecheck

if [ $? -ne 0 ]; then
    echo "❌ 类型检查失败，请修复错误后重试"
    exit 1
fi

# 构建项目
echo "⚡ 构建应用..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    echo "📁 构建输出位置: dist/"
    echo ""
    echo "📊 构建统计:"
    echo "  - 主进程: dist/main/"
    echo "  - 渲染进程: dist/renderer/"
    
    # 显示构建大小
    if command -v du &> /dev/null; then
        echo ""
        echo "💾 构建大小:"
        du -sh dist/main/ 2>/dev/null || echo "  - 主进程: 计算中..."
        du -sh dist/renderer/ 2>/dev/null || echo "  - 渲染进程: 计算中..."
    fi
else
    echo "❌ 构建失败"
    exit 1
fi