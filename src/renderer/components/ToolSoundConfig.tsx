import React, { useState, useEffect } from 'react';
import { SupportedTools, SoundEffect } from '../../shared/types';
// 导入工具音效配置类型
interface ToolSoundConfig {
  [toolName: string]: {
    [state: string]: string;
  };
}

interface ToolSoundConfigProps {
  toolSoundConfig: ToolSoundConfig;
  availableSounds: SoundEffect[];
  onConfigChange: (config: ToolSoundConfig) => void;
  onPreviewSound: (soundId: string) => void;
}

// 直接使用 ToolSoundConfig 类型

/**
 * 工具音效配置组件
 * 支持每个工具的多状态音效设置
 */
export const ToolSoundConfigComponent: React.FC<ToolSoundConfigProps> = ({
  toolSoundConfig,
  availableSounds,
  onConfigChange,
  onPreviewSound
}) => {
  const [localConfig, setLocalConfig] = useState<ToolSoundConfig>(toolSoundConfig);
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // 工具状态配置定义
  const toolStatesConfig = {
    [SupportedTools.READ]: ['success', 'error'],
    [SupportedTools.WRITE]: ['success', 'error'],
    [SupportedTools.EDIT]: ['success', 'error'],
    [SupportedTools.MULTI_EDIT]: ['success', 'error'],
    [SupportedTools.NOTEBOOK_EDIT]: ['success', 'error'],
    [SupportedTools.GREP]: ['success', 'error', 'no_results'],
    [SupportedTools.GLOB]: ['success', 'error'],
    [SupportedTools.LS]: ['success', 'error'],
    [SupportedTools.BASH]: ['start', 'success', 'error'],
    [SupportedTools.TASK]: ['start', 'success', 'error'],
    [SupportedTools.WEB_FETCH]: ['success', 'error'],
    [SupportedTools.WEB_SEARCH]: ['success', 'error'],
    [SupportedTools.TODO_WRITE]: ['success', 'completed', 'all_complete'],
    [SupportedTools.EXIT_PLAN_MODE]: ['success']
  };

  // 状态显示名称映射
  const stateDisplayNames: Record<string, string> = {
    success: '成功',
    error: '失败',
    start: '开始',
    no_results: '无结果',
    completed: '已完成',
    all_complete: '全部完成'
  };

  // 工具显示名称映射
  const toolDisplayNames = {
    [SupportedTools.READ]: '文件读取',
    [SupportedTools.WRITE]: '文件写入',
    [SupportedTools.EDIT]: '文件编辑',
    [SupportedTools.MULTI_EDIT]: '批量编辑',
    [SupportedTools.NOTEBOOK_EDIT]: 'Notebook编辑',
    [SupportedTools.GREP]: '文本搜索',
    [SupportedTools.GLOB]: '文件匹配',
    [SupportedTools.LS]: '目录列表',
    [SupportedTools.BASH]: '命令执行',
    [SupportedTools.TASK]: '任务执行',
    [SupportedTools.WEB_FETCH]: '网页获取',
    [SupportedTools.WEB_SEARCH]: '网页搜索',
    [SupportedTools.TODO_WRITE]: '任务管理',
    [SupportedTools.EXIT_PLAN_MODE]: '退出计划模式'
  };

  useEffect(() => {
    setLocalConfig(toolSoundConfig);
  }, [toolSoundConfig]);

  /**
   * 处理音效配置变更
   */
  const handleSoundChange = (toolName: string, state: string, soundId: string) => {
    const newConfig = {
      ...localConfig,
      [toolName]: {
        ...localConfig[toolName],
        [state]: soundId
      } as any
    };
    
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  /**
   * 切换工具展开状态
   */
  const toggleToolExpanded = (toolName: string) => {
    const newExpanded = new Set(expandedTools);
    if (newExpanded.has(toolName)) {
      newExpanded.delete(toolName);
    } else {
      newExpanded.add(toolName);
    }
    setExpandedTools(newExpanded);
  };

  /**
   * 重置工具配置为默认值
   */
  const resetToolConfig = (toolName: string) => {
    const newConfig = { ...localConfig };
    delete newConfig[toolName];
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };



  // 过滤工具列表
  const filteredTools = Object.values(SupportedTools).filter(toolName => {
    const displayName = toolDisplayNames[toolName] || toolName;
    return displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           toolName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="tool-sound-config">
      {/* 头部控制区 */}
      <div className="config-header">
        <div className="header-title">
          <h3>🔧 工具音效配置</h3>
          <p className="header-description">
            为每个工具的不同执行状态配置专属音效，实现精准的音效反馈
          </p>
        </div>
        
        <div className="header-controls">
          {/* 搜索框 */}
          <div className="search-box">
            <input
              type="text"
              placeholder="搜索工具..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          

        </div>
      </div>



      {/* 工具配置列表 */}
      <div className="tools-list">
        {filteredTools.map(toolName => {
          const isExpanded = expandedTools.has(toolName);
          const toolConfig = localConfig[toolName] || {};
          const toolStates = toolStatesConfig[toolName] || ['success', 'error'];
          const displayName = toolDisplayNames[toolName] || toolName;
          
          return (
            <div key={toolName} className={`tool-item ${isExpanded ? 'expanded' : ''}`}>
              {/* 工具头部 */}
              <div 
                className="tool-header"
                onClick={() => toggleToolExpanded(toolName)}
              >
                <div className="tool-info">
                  <span className="tool-name">{displayName}</span>
                  <span className="tool-code">({toolName})</span>
                  <span className="tool-states-count">
                    {toolStates.length} 个状态
                  </span>
                </div>
                
                <div className="tool-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetToolConfig(toolName);
                    }}
                    className="btn-reset"
                    title="重置为默认配置"
                  >
                    重置
                  </button>
                  <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </div>
              </div>

              {/* 工具状态配置 */}
              {isExpanded && (
                <div className="tool-states">
                  {toolStates.map(state => {
                    const currentSound = (toolConfig as any)[state] || '';
                    
                    return (
                      <div key={state} className="state-config">
                        <div className="state-info">
                          <label className="state-label">
                            {stateDisplayNames[state] || state}
                          </label>
                          <span className="state-description">
                            {getStateDescription(toolName, state)}
                          </span>
                        </div>
                        
                        <div className="state-controls">
                          <select
                            value={currentSound}
                            onChange={(e) => handleSoundChange(toolName, state, e.target.value)}
                            className="sound-select"
                          >
                            <option value="">选择音效...</option>
                            {availableSounds.map(sound => (
                              <option key={sound.id} value={sound.filename}>
                                {sound.name}
                              </option>
                            ))}
                          </select>
                          
                          {currentSound && (
                            <button
                              onClick={() => {
                                // 根据文件名查找对应的音效ID
                                const sound = availableSounds.find(s => s.filename === currentSound);
                                if (sound) {
                                  onPreviewSound(sound.id);
                                }
                              }}
                              className="btn-preview"
                              title="预览音效"
                            >
                              ▶️
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="no-results">
          <p>没有找到匹配的工具</p>
        </div>
      )}
    </div>
  );
};

/**
 * 获取状态描述
 */
function getStateDescription(toolName: string, state: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    [SupportedTools.GREP]: {
      success: '找到匹配结果时',
      no_results: '没有找到匹配结果时',
      error: '搜索出错时'
    },
    [SupportedTools.BASH]: {
      start: '命令开始执行时',
      success: '命令执行成功时',
      error: '命令执行失败时'
    },
    [SupportedTools.TASK]: {
      start: '任务开始执行时',
      success: '任务执行成功时',
      error: '任务执行失败时'
    },
    [SupportedTools.TODO_WRITE]: {
      success: '创建任务成功时',
      completed: '完成单个任务时',
      all_complete: '完成所有任务时'
    }
  };

  const toolDescriptions = descriptions[toolName];
  if (toolDescriptions && toolDescriptions[state]) {
    return toolDescriptions[state];
  }

  // 默认描述
  const defaultDescriptions: Record<string, string> = {
    success: '操作成功时',
    error: '操作失败时',
    start: '操作开始时',
    no_results: '无结果时',
    completed: '完成时',
    all_complete: '全部完成时'
  };

  return defaultDescriptions[state] || '';
}

export default ToolSoundConfigComponent;