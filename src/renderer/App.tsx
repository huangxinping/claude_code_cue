import { useState, useEffect, useRef } from "react";
import { SoundEffect, AppConfig, DEFAULT_SOUND_CONFIG } from "../shared/types";
import { ConfirmDialog } from "./components/ConfirmDialog";
import "./App.css";

function App() {
  const [config, setConfig] = useState<AppConfig>({
    simpleHooks: { ...DEFAULT_SOUND_CONFIG.simpleHooks },
    postToolUse: { ...DEFAULT_SOUND_CONFIG.postToolUse },
    version: "3.0.0"
  });
  const [availableSounds, setAvailableSounds] = useState<SoundEffect[]>([]);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 简单Hook事件名称映射
  const SIMPLE_HOOK_EVENTS = {
    'userPromptSubmit': '用户提交输入',
    'sessionStart': '会话开始', 
    'stop': '停止响应',
    'notification': '通知提醒'
  };

  // PostToolUse工具名称映射
  const TOOL_DISPLAY_NAMES = {
    'Read': '文件读取',
    'Write': '文件写入',
    'Edit': '文件编辑',
    'MultiEdit': '批量编辑',
    'NotebookEdit': 'Notebook编辑',
    'Grep': '文本搜索',
    'Glob': '文件匹配',
    'LS': '目录列表',
    'Bash': '命令执行',
    'Task': '任务执行',
    'WebFetch': '网页获取',
    'WebSearch': '网页搜索',
    'TodoWrite': '任务管理',
    'ExitPlanMode': '退出计划模式'
  };

  // 设置通知的辅助函数
  const showNotification = (
    message: string,
    type: "success" | "error",
    duration = 3000
  ) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setNotification({ message, type });
    setIsNotificationVisible(true);

    timeoutRef.current = setTimeout(() => {
      setIsNotificationVisible(false);
      setTimeout(() => {
        setNotification(null);
        timeoutRef.current = null;
      }, 300);
    }, duration);
  };

  // 初始化数据
  useEffect(() => {
    loadConfig();
    loadAvailableSounds();
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * 加载配置，支持配置迁移
   */
  /**
   * 创建默认配置
   */
  const createDefaultConfig = (): AppConfig => {
    return {
      simpleHooks: { ...DEFAULT_SOUND_CONFIG.simpleHooks },
      postToolUse: { ...DEFAULT_SOUND_CONFIG.postToolUse },
      version: '3.0.0'
    };
  };

  /**
   * 加载配置
   */
  const loadConfig = async () => {
    try {
      console.log('[App] 开始加载配置...');
      const loadedConfig = await window.electronAPI.getConfig();
      console.log('[App] 加载的配置:', loadedConfig);
      
      // 检查是否为新版统一配置
      const unifiedConfig = loadedConfig as AppConfig;
      if (unifiedConfig && unifiedConfig.simpleHooks && unifiedConfig.postToolUse && unifiedConfig.version === '3.0.0') {
        // 已经是新版配置，直接使用
        console.log('[App] 使用现有的统一配置');
        setConfig(unifiedConfig);
      } else {
        // 使用默认配置（全新设计）
        console.log('[App] 使用默认配置（全新设计）');
        const defaultConfig = createDefaultConfig();
        console.log('[App] 默认配置:', defaultConfig);
        console.log('[App] 默认simpleHooks:', defaultConfig.simpleHooks);
        console.log('[App] 默认postToolUse:', defaultConfig.postToolUse);
        setConfig(defaultConfig);
        await window.electronAPI.updateConfig(defaultConfig);
        showNotification('已应用默认音效配置', 'success');
      }
    } catch (error) {
      console.error("[App] 加载配置失败:", error);
      // 使用默认配置
      const defaultConfig = createDefaultConfig();
      console.log('[App] 错误时使用默认配置:', defaultConfig);
      setConfig(defaultConfig);
      showNotification("加载配置失败，使用默认配置", "error");
    }
  };

  /**
   * 加载可用音效
   */
  const loadAvailableSounds = async () => {
    try {
      const sounds = await window.electronAPI.getAvailableSounds();
      setAvailableSounds(sounds);
    } catch (error) {
      console.error("加载音效失败:", error);
      showNotification("加载音效失败", "error");
    }
  };

  /**
   * 处理简单Hook事件音效选择
   */
  const handleSimpleHookSoundSelect = async (hookName: keyof typeof SIMPLE_HOOK_EVENTS, soundId: string) => {
    const newConfig = { ...config };
    newConfig.simpleHooks[hookName] = soundId === '' ? null : soundId;
    
    setConfig(newConfig);
    await window.electronAPI.updateConfig(newConfig);
    
    const hookDisplayName = SIMPLE_HOOK_EVENTS[hookName];
    const message = soundId === '' 
      ? `已为 ${hookDisplayName} 取消音效配置` 
      : `已为 ${hookDisplayName} 设置音效`;
    showNotification(message, "success", 2000);
  };

  /**
   * 处理PostToolUse工具音效选择
   */
  const handleToolSoundSelect = async (toolName: string, state: 'success' | 'error', soundId: string) => {
    const newConfig = { ...config };
    
    if (!newConfig.postToolUse[toolName]) {
      newConfig.postToolUse[toolName] = {
        success: DEFAULT_SOUND_CONFIG.postToolUse[toolName as keyof typeof DEFAULT_SOUND_CONFIG.postToolUse]?.success || null,
        error: DEFAULT_SOUND_CONFIG.postToolUse[toolName as keyof typeof DEFAULT_SOUND_CONFIG.postToolUse]?.error || null
      };
    }
    
    newConfig.postToolUse[toolName][state] = soundId === '' ? null : soundId;
    
    setConfig(newConfig);
    await window.electronAPI.updateConfig(newConfig);
    
    const toolDisplayName = TOOL_DISPLAY_NAMES[toolName as keyof typeof TOOL_DISPLAY_NAMES] || toolName;
    const stateDisplayName = state === 'success' ? '成功' : '失败';
    const message = soundId === '' 
      ? `已为 ${toolDisplayName} ${stateDisplayName} 取消音效配置` 
      : `已为 ${toolDisplayName} ${stateDisplayName} 设置音效`;
    showNotification(message, 'success', 2000);
  };

  /**
   * 预览音效
   */
  const handlePreviewSound = async (soundId: string) => {
    try {
      await window.electronAPI.previewSound(soundId);
    } catch (error) {
      console.error("预览音效失败:", error);
      showNotification("预览音效失败", "error");
    }
  };

  /**
   * 刷新音效列表
   */
  const handleRefreshSounds = async () => {
    await loadAvailableSounds();
    showNotification("音效列表已刷新", "success", 2000);
  };

  /**
   * 安装音效包
   */
  const handleInstallSoundPack = async () => {
    try {
      const result = await window.electronAPI.installSoundPack();
      if (result.success) {
        await loadAvailableSounds();
        showNotification(`成功安装 ${result.installedCount || 0} 个音效文件`, "success");
      } else {
        showNotification("安装音效包失败", "error");
      }
    } catch (error) {
      console.error("安装音效包失败:", error);
      showNotification("安装音效包失败", "error");
    }
  };

  /**
   * 重置为默认配置
   */
  const handleResetToDefault = async () => {
    setConfirmDialog({
      isOpen: true,
      title: "重置为默认配置",
      message: "确定要将所有音效配置重置为默认值吗？此操作不可撤销。",
      onConfirm: async () => {
        try {
          const defaultConfig = createDefaultConfig();
          setConfig(defaultConfig);
          await window.electronAPI.updateConfig(defaultConfig);
          showNotification('已重置为默认配置', 'success');
          setConfirmDialog(null);
        } catch (error) {
          console.error('重置配置失败:', error);
          showNotification('重置配置失败', 'error');
          setConfirmDialog(null);
        }
      }
    });
  };

  /**
   * 应用配置
   */
  const handleApplyConfiguration = async () => {
    setConfirmDialog({
      isOpen: true,
      title: "应用配置",
      message: "确定要将当前配置应用到Claude Code吗？这将更新Hook脚本配置。",
      onConfirm: async () => {
        try {
          const success = await window.electronAPI.applyConfiguration(config);
          if (success) {
            showNotification('配置已成功应用到Claude Code', 'success', 3000);
          } else {
            showNotification('应用配置失败', 'error');
          }
          setConfirmDialog(null);
        } catch (error) {
          console.error('应用配置失败:', error);
          showNotification('应用配置失败', 'error');
          setConfirmDialog(null);
        }
      }
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-title">
          <h1>🔔 Claude Code Cue</h1>
          <span className="subtitle">为 Claude Code 配置智能音效通知</span>
        </div>
        <div className="header-actions">
          <button 
            className="action-btn refresh-btn" 
            onClick={handleRefreshSounds}
            title="刷新音效列表"
          >
            刷新音效
          </button>
          <button 
            className="action-btn install-btn" 
            onClick={handleInstallSoundPack}
            title="从文件夹中导入自定义音效"
          >
            安装音效包
          </button>
          <button 
            className="action-btn reset-btn" 
            onClick={handleResetToDefault}
            title="重置为默认配置"
          >
            重置默认
          </button>
          <button 
            className="action-btn primary apply-btn" 
            onClick={handleApplyConfiguration}
            title="应用配置到Claude Code"
          >
            应用配置
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* 浮动通知组件 */}
        {notification && (
          <div
            className={`notification-floating ${
              notification.type === "error"
                ? "notification-error"
                : "notification-success"
            } ${isNotificationVisible ? "fade-in" : "fade-out"}`}
          >
            {notification.message}
          </div>
        )}

        {/* 统一配置内容 */}
        <div className="unified-config">
          <br></br>
          {/* <h2>音效配置</h2> */}
          {/* <p className="config-description">
            为Claude Code的Hook事件配置音效。所有配置都有默认值，您可以根据需要进行调整。
          </p> */}
          
          {/* 简单Hook事件配置 */}
          <section className="simple-hooks-section">
            <div className="hook-configs-grid">
              {Object.entries(SIMPLE_HOOK_EVENTS).map(([hookName, displayName]) => (
                <div key={hookName} className="hook-config-item-half">
                  <label className="hook-label">当{displayName}时：</label>
                  <div className="sound-controls">
                    <select
                      value={config.simpleHooks[hookName as keyof typeof config.simpleHooks] || ''}
                      onChange={(e) => handleSimpleHookSoundSelect(hookName as keyof typeof SIMPLE_HOOK_EVENTS, e.target.value)}
                      className="sound-select"
                    >
                      <option value="">无音效</option>
                      {availableSounds.map(sound => (
                        <option key={sound.id} value={sound.id}>{sound.name}</option>
                      ))}
                    </select>
                    <button
                      className="preview-btn"
                      onClick={() => {
                        const soundId = config.simpleHooks[hookName as keyof typeof config.simpleHooks];
                        if (soundId) handlePreviewSound(soundId);
                      }}
                      title="预览音效"
                      disabled={!config.simpleHooks[hookName as keyof typeof config.simpleHooks]}
                    >
                      ▶️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* PostToolUse工具配置 */}
          <section className="post-tool-use-section">
            <br></br>
            <h3>当执行工具特定行为时：</h3>
            <div className="tool-configs">
              {Object.entries(TOOL_DISPLAY_NAMES).map(([toolName, displayName]) => (
                <div key={toolName} className="tool-config-item">
                  <h4 className="tool-name">{displayName} ({toolName})</h4>
                  <div className="tool-states-inline">
                    <div className="state-config-half">
                      <label className="state-label">✅ 成功：</label>
                      <div className="sound-controls">
                        <select
                          value={config.postToolUse[toolName]?.success || ''}
                          onChange={(e) => handleToolSoundSelect(toolName, 'success', e.target.value)}
                          className="sound-select"
                        >
                          <option value="">无音效</option>
                          {availableSounds.map(sound => (
                            <option key={sound.id} value={sound.id}>{sound.name}</option>
                          ))}
                        </select>
                        <button
                          className="preview-btn"
                          onClick={() => {
                            const soundId = config.postToolUse[toolName]?.success;
                            if (soundId) handlePreviewSound(soundId);
                          }}
                          title="预览音效"
                          disabled={!config.postToolUse[toolName]?.success}
                        >
                          ▶️
                        </button>
                      </div>
                    </div>
                    <div className="state-config-half">
                      <label className="state-label">❌ 失败：</label>
                      <div className="sound-controls">
                        <select
                          value={config.postToolUse[toolName]?.error || ''}
                          onChange={(e) => handleToolSoundSelect(toolName, 'error', e.target.value)}
                          className="sound-select"
                        >
                          <option value="">无音效</option>
                          {availableSounds.map(sound => (
                            <option key={sound.id} value={sound.id}>{sound.name}</option>
                          ))}
                        </select>
                        <button
                          className="preview-btn"
                          onClick={() => {
                            const soundId = config.postToolUse[toolName]?.error;
                            if (soundId) handlePreviewSound(soundId);
                          }}
                          title="预览音效"
                          disabled={!config.postToolUse[toolName]?.error}
                        >
                          ▶️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* 确认对话框 */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}

export default App;