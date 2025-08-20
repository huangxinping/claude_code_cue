# GitHub Actions 自动化构建和发布

本项目配置了完整的 GitHub Actions 工作流，实现自动化构建、测试和发布。

## 🚀 工作流说明

### 1. 自动发布 (`build-and-release.yml`)

**触发条件**: 推送版本标签时自动触发

```bash
# 创建并推送版本标签
git tag v1.0.0
git push origin v1.0.0
```

**功能**:
- ✅ 自动构建 macOS、Windows、Linux 三个平台的安装包
- ✅ 自动创建 GitHub Release
- ✅ 自动上传安装包到 Release 页面
- ✅ 生成详细的发布说明

### 2. 手动发布 (`manual-release.yml`)

**触发方式**: GitHub 网页手动触发

1. 进入项目的 GitHub 页面
2. 点击 "Actions" 标签
3. 选择 "Manual Release" 工作流
4. 点击 "Run workflow" 按钮
5. 填写版本号和选择构建平台

**优势**:
- 🎯 可选择特定平台构建
- 🔧 可设置预发布版本
- ⚡ 无需创建 Git 标签

### 3. 持续集成 (`ci.yml`)

**触发条件**: 推送代码到 main/develop 分支或创建 Pull Request

**功能**:
- ✅ TypeScript 类型检查
- ✅ 构建测试
- ✅ 跨平台兼容性测试
- ✅ 代码质量检查
- ✅ 安全性审计

## 📦 发布流程

### 方式一：标签自动发布（推荐）

```bash
# 1. 确保代码已提交
git add .
git commit -m "feat: 新功能或修复"
git push origin main

# 2. 创建版本标签
git tag v1.0.0
git push origin v1.0.0

# 3. GitHub Actions 自动构建和发布
# 等待 10-15 分钟，检查 Actions 页面的构建状态
```

### 方式二：手动发布

1. 访问 GitHub 项目页面
2. 点击 "Actions" → "Manual Release"
3. 点击 "Run workflow"
4. 填写参数：
   - **Version**: `v1.0.0`
   - **Prerelease**: 是否为预发布版本
   - **Platforms**: 选择构建平台
5. 点击 "Run workflow" 开始构建

## 🔧 配置说明

### 版本号规范

使用语义化版本号：`v主版本.次版本.修订版本`

- `v1.0.0` - 正式版本
- `v1.1.0` - 新功能版本
- `v1.0.1` - 修复版本
- `v2.0.0` - 重大更新版本

### 构建平台

| 平台 | 输出文件 | 说明 |
|------|----------|------|
| macOS | `.dmg` | macOS 安装包 |
| Windows | `.exe` | Windows 安装程序 |
| Linux | `.AppImage` | Linux 便携应用 |

### 构建时间

- **单平台**: 约 5-8 分钟
- **全平台**: 约 10-15 分钟
- **并行构建**: 三个平台同时进行

## 📋 使用检查清单

### 首次设置

- [ ] 确保项目已推送到 GitHub
- [ ] 检查 `package.json` 中的版本号
- [ ] 验证构建脚本 `npm run build` 和 `npm run pack` 正常工作
- [ ] 确保 GitHub 仓库有 Actions 权限

### 发布前检查

- [ ] 代码已提交并推送到主分支
- [ ] 本地构建测试通过
- [ ] 更新 README.md 或 CHANGELOG.md
- [ ] 确认版本号符合语义化规范

### 发布后验证

- [ ] 检查 Actions 页面构建状态
- [ ] 验证 Release 页面的安装包
- [ ] 下载并测试安装包
- [ ] 确认发布说明内容正确

## 🛠️ 故障排除

### 构建失败

1. **检查 Actions 日志**:
   - 进入 "Actions" 页面
   - 点击失败的工作流
   - 查看详细错误信息

2. **常见问题**:
   - 依赖安装失败：检查 `package.json`
   - 类型检查失败：运行 `npm run typecheck`
   - 构建失败：运行 `npm run build`

3. **本地测试**:
   ```bash
   npm ci
   npm run typecheck
   npm run build
   npm run pack
   ```

### 发布失败

1. **权限问题**: 确保仓库有 Actions 写权限
2. **标签冲突**: 删除已存在的标签后重新创建
3. **文件路径**: 检查构建产物路径是否正确

## 💡 最佳实践

1. **版本管理**:
   - 使用语义化版本号
   - 为重要版本创建 Release Notes
   - 保持版本号与功能更新同步

2. **测试策略**:
   - 发布前在本地测试构建
   - 使用手动发布测试新功能
   - 重要版本使用预发布标记

3. **发布频率**:
   - 小修复：及时发布
   - 新功能：集中发布
   - 重大更新：充分测试后发布

## 🎯 下一步

配置完成后，您可以：

1. **推送代码**到 GitHub
2. **创建第一个版本标签** `v1.0.0`
3. **观察 Actions 自动构建**
4. **在 Release 页面下载安装包**
5. **分享给用户使用**

现在您的项目已经具备了专业的自动化构建和发布能力！🎉