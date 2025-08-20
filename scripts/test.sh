#!/bin/bash

# Claude Code Cue - 测试脚本

set -e

echo "🧪 运行 Claude Code Cue 测试套件..."

# 创建日志目录
mkdir -p logs

# 测试配置
TEST_LOG="logs/test-$(date +%Y%m%d-%H%M%S).log"

# 记录测试开始时间
echo "⏰ 测试开始时间: $(date)" | tee $TEST_LOG

# 1. 环境检查
echo "" | tee -a $TEST_LOG
echo "🔍 环境检查..." | tee -a $TEST_LOG
echo "Node.js 版本: $(node --version)" | tee -a $TEST_LOG
echo "npm 版本: $(npm --version)" | tee -a $TEST_LOG

# 2. 依赖检查
echo "" | tee -a $TEST_LOG
echo "📦 检查项目依赖..." | tee -a $TEST_LOG
if [ ! -d "node_modules" ]; then
    echo "❌ 依赖未安装，正在安装..." | tee -a $TEST_LOG
    npm install | tee -a $TEST_LOG
else
    echo "✅ 依赖已安装" | tee -a $TEST_LOG
fi

# 3. TypeScript 类型检查
echo "" | tee -a $TEST_LOG
echo "🔍 TypeScript 类型检查..." | tee -a $TEST_LOG
if npm run typecheck 2>&1 | tee -a $TEST_LOG; then
    echo "✅ 类型检查通过" | tee -a $TEST_LOG
else
    echo "❌ 类型检查失败" | tee -a $TEST_LOG
    exit 1
fi

# 4. 构建测试
echo "" | tee -a $TEST_LOG
echo "🔨 构建测试..." | tee -a $TEST_LOG
if npm run build 2>&1 | tee -a $TEST_LOG; then
    echo "✅ 构建成功" | tee -a $TEST_LOG
else
    echo "❌ 构建失败" | tee -a $TEST_LOG
    exit 1
fi

# 5. 检查输出文件
echo "" | tee -a $TEST_LOG
echo "📁 检查构建输出..." | tee -a $TEST_LOG

REQUIRED_FILES=(
    "out/main/index.js"
    "out/preload/index.js"
    "out/renderer/index.html"
)

ALL_FILES_EXIST=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file" | tee -a $TEST_LOG
    else
        echo "❌ $file 不存在" | tee -a $TEST_LOG
        ALL_FILES_EXIST=false
    fi
done

if [ "$ALL_FILES_EXIST" = false ]; then
    echo "❌ 部分必需文件缺失" | tee -a $TEST_LOG
    exit 1
fi

# 6. 模拟功能测试
echo "" | tee -a $TEST_LOG
echo "⚙️ 模拟功能测试..." | tee -a $TEST_LOG

# 检查音效目录结构
SOUNDS_DIR="$HOME/.claude-sound-manager/sounds"
echo "🔔 检查音效目录: $SOUNDS_DIR" | tee -a $TEST_LOG
mkdir -p "$SOUNDS_DIR"
echo "✅ 音效目录准备完成" | tee -a $TEST_LOG

# 检查 Claude Code 配置目录
CLAUDE_DIR="$HOME/.claude"
echo "⚙️ 检查 Claude Code 配置目录: $CLAUDE_DIR" | tee -a $TEST_LOG
if [ -d "$CLAUDE_DIR" ]; then
    echo "✅ Claude Code 配置目录存在" | tee -a $TEST_LOG
else
    echo "⚠️ Claude Code 配置目录不存在，将在运行时创建" | tee -a $TEST_LOG
fi

# 初始化失败测试计数器
FAILED_TESTS=0

# 7. 运行核心逻辑测试
echo "" | tee -a $TEST_LOG
echo "🧪 7. 运行核心逻辑测试..." | tee -a $TEST_LOG
if node test-core-logic.js 2>&1 | tee -a $TEST_LOG; then
    echo "✅ 核心逻辑测试通过" | tee -a $TEST_LOG
else
    echo "❌ 核心逻辑测试失败" | tee -a $TEST_LOG
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# 8. 运行集成测试
echo "" | tee -a $TEST_LOG
echo "🔗 8. 运行集成测试..." | tee -a $TEST_LOG
if node integration-tests.js 2>&1 | tee -a $TEST_LOG; then
    echo "✅ 集成测试通过" | tee -a $TEST_LOG
else
    echo "❌ 集成测试失败" | tee -a $TEST_LOG
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# 9. 运行Electron主进程测试
echo "" | tee -a $TEST_LOG
echo "🔧 9. 运行Electron主进程测试..." | tee -a $TEST_LOG
if node test-electron-main.js 2>&1 | tee -a $TEST_LOG; then
    echo "✅ Electron主进程测试通过" | tee -a $TEST_LOG
else
    echo "❌ Electron主进程测试失败" | tee -a $TEST_LOG
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# 10. 运行音频播放测试
echo "" | tee -a $TEST_LOG
echo "🔊 10. 运行音频播放测试..." | tee -a $TEST_LOG
if node test-audio-playback.js 2>&1 | tee -a $TEST_LOG; then
    echo "✅ 音频播放测试通过" | tee -a $TEST_LOG
else
    echo "❌ 音频播放测试失败" | tee -a $TEST_LOG
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# 11. 运行配置持久化测试
echo "" | tee -a $TEST_LOG
echo "💾 11. 运行配置持久化测试..." | tee -a $TEST_LOG
if node test-config-persistence.js 2>&1 | tee -a $TEST_LOG; then
    echo "✅ 配置持久化测试通过" | tee -a $TEST_LOG
else
    echo "❌ 配置持久化测试失败" | tee -a $TEST_LOG
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# 12. 运行错误处理测试
echo "" | tee -a $TEST_LOG
echo "🚨 12. 运行错误处理测试..." | tee -a $TEST_LOG
if node test-error-handling.js 2>&1 | tee -a $TEST_LOG; then
    echo "✅ 错误处理测试通过" | tee -a $TEST_LOG
else
    echo "❌ 错误处理测试失败" | tee -a $TEST_LOG
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# 13. 运行性能和内存测试
echo "" | tee -a $TEST_LOG
echo "⚡ 13. 运行性能和内存测试..." | tee -a $TEST_LOG
if node test-performance-memory.js 2>&1 | tee -a $TEST_LOG; then
    echo "✅ 性能和内存测试通过" | tee -a $TEST_LOG
else
    echo "❌ 性能和内存测试失败" | tee -a $TEST_LOG
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# 14. 运行端到端测试
echo "" | tee -a $TEST_LOG
echo "🎭 14. 运行端到端测试..." | tee -a $TEST_LOG
if node test-e2e.js 2>&1 | tee -a $TEST_LOG; then
    echo "✅ 端到端测试通过" | tee -a $TEST_LOG
else
    echo "❌ 端到端测试失败" | tee -a $TEST_LOG
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# 15. 运行增强功能测试
echo "" | tee -a $TEST_LOG
echo "✨ 15. 运行增强功能测试..." | tee -a $TEST_LOG
if node test-enhanced-features.js 2>&1 | tee -a $TEST_LOG; then
    echo "✅ 增强功能测试通过" | tee -a $TEST_LOG
else
    echo "❌ 增强功能测试失败" | tee -a $TEST_LOG
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# 16. 运行音效加载测试
echo "" | tee -a $TEST_LOG
echo "🔔 16. 运行音效加载测试..." | tee -a $TEST_LOG
if node test-sound-loading.js 2>&1 | tee -a $TEST_LOG; then
    echo "✅ 音效加载测试通过" | tee -a $TEST_LOG
else
    echo "❌ 音效加载测试失败" | tee -a $TEST_LOG
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# 17. 运行音效验证测试
echo "" | tee -a $TEST_LOG
echo "🎵 17. 运行音效验证测试..." | tee -a $TEST_LOG
if node test-sounds.js 2>&1 | tee -a $TEST_LOG; then
    echo "✅ 音效验证测试通过" | tee -a $TEST_LOG
else
    echo "❌ 音效验证测试失败" | tee -a $TEST_LOG
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# 18. 运行音效诊断
echo "" | tee -a $TEST_LOG
echo "🔍 18. 运行音效诊断..." | tee -a $TEST_LOG
if node diagnose-sound-loading.js 2>&1 | tee -a $TEST_LOG; then
    echo "✅ 音效诊断通过" | tee -a $TEST_LOG
else
    echo "❌ 音效诊断失败" | tee -a $TEST_LOG
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# 19. 性能检查
echo "" | tee -a $TEST_LOG
echo "⚡ 性能检查..." | tee -a $TEST_LOG

# 检查构建大小
if command -v du &> /dev/null; then
    MAIN_SIZE=$(du -sh out/main/ 2>/dev/null | cut -f1)
    RENDERER_SIZE=$(du -sh out/renderer/ 2>/dev/null | cut -f1)
    echo "📊 构建大小:" | tee -a $TEST_LOG
    echo "  - 主进程: $MAIN_SIZE" | tee -a $TEST_LOG
    echo "  - 渲染进程: $RENDERER_SIZE" | tee -a $TEST_LOG
fi

# 20. 测试总结
echo "" | tee -a $TEST_LOG
echo "📋 测试总结:" | tee -a $TEST_LOG
echo "✅ 环境检查通过" | tee -a $TEST_LOG
echo "✅ 依赖安装正常" | tee -a $TEST_LOG
echo "✅ TypeScript 类型检查通过" | tee -a $TEST_LOG
echo "✅ 构建成功" | tee -a $TEST_LOG
echo "✅ 输出文件完整" | tee -a $TEST_LOG
echo "✅ 功能模块准备就绪" | tee -a $TEST_LOG

echo "" | tee -a $TEST_LOG
if [ $FAILED_TESTS -eq 0 ]; then
    echo "🎉 所有测试通过！" | tee -a $TEST_LOG
else
    echo "❌ 有 $FAILED_TESTS 个测试失败" | tee -a $TEST_LOG
fi
echo "⏰ 测试完成时间: $(date)" | tee -a $TEST_LOG
echo "📄 详细日志: $TEST_LOG" | tee -a $TEST_LOG

# 根据测试结果退出
if [ $FAILED_TESTS -gt 0 ]; then
    exit 1
fi

echo ""
echo "🚀 下一步可以运行："
echo "  - npm run dev     # 启动开发环境"
echo "  - npm run pack    # 打包应用"