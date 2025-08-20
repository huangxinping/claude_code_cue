#!/bin/bash

# Claude Code Cue - 开发启动脚本

set -e

echo "🚀 启动 Claude Code Cue 开发环境..."

# 检查 Node.js 版本
NODE_VERSION=$(node --version)
echo "📦 Node.js 版本: $NODE_VERSION"

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📥 安装项目依赖..."
    npm install
fi

# 清理之前的构建
echo "🧹 清理构建缓存..."
npm run clean

# 类型检查
echo "🔍 进行 TypeScript 类型检查..."
npm run typecheck

# 启动开发环境
echo "⚡ 启动开发服务器..."
echo "  - 渲染进程开发服务器将在 http://localhost:3000 启动"
echo "  - 主进程将在渲染进程准备好后启动"
echo ""
echo "📝 开发日志将输出到 logs/ 目录"

# 创建日志目录
mkdir -p logs

# 启动开发环境（并行启动渲染进程和主进程）
npm run dev 2>&1 | tee logs/dev-$(date +%Y%m%d-%H%M%S).log