#!/bin/bash
# Claude Code Cue - 发布脚本

echo "🚀 Claude Code Cue 发布脚本"
echo "=================================="

# 清理之前的构建
echo "🧹 清理之前的构建文件..."
npm run clean

# 检查依赖
echo "📦 检查项目依赖..."
npm install

# 类型检查
echo "🔍 执行 TypeScript 类型检查..."
npm run typecheck
if [ $? -ne 0 ]; then
    echo "❌ TypeScript 类型检查失败"
    exit 1
fi

# 构建项目
echo "🔨 构建项目..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 项目构建失败"
    exit 1
fi

# 打包应用 - 当前平台
echo "📦 打包当前平台应用..."
npm run pack
if [ $? -ne 0 ]; then
    echo "❌ 应用打包失败"
    exit 1
fi

echo ""
echo "✅ 发布完成！"
echo ""
echo "📁 打包文件位置："
echo "   当前平台：./release/"
echo ""
echo "🎯 应用功能："
echo "   - Claude Code Hook 音效配置"
echo "   - 跨平台音效播放"
echo "   - 图形化配置界面" 
echo "   - 音效预览和管理"
echo ""
echo "📖 使用说明："
echo "   1. 运行应用程序"
echo "   2. 为各 Hook 事件配置音效"
echo "   3. 点击 '应用配置' 生成 Hook 脚本"
echo "   4. 在 Claude Code 中享受音效"
echo ""
echo "🎉 感谢使用 Claude Code Cue！"