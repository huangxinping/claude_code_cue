// Hook事件定义
export interface HookEvent {
  id: string;
  name: string;
  description: string;
}

// 音效文件定义
export interface SoundEffect {
  id: string;
  name: string;
  filename: string;
  filepath: string;
  category?: string;
  description?: string;
}

// 工具音效映射定义（与 claude-code-but-zelda 完全一致）
export interface ToolSoundMapping {
  success?: string;
  error?: string;
  start?: string;
  no_results?: string;
  completed?: string;
  all_complete?: string;
}

// 支持的工具类型（与 claude-code-but-zelda 保持一致）
export enum SupportedTools {
  READ = 'Read',
  WRITE = 'Write',
  EDIT = 'Edit',
  MULTI_EDIT = 'MultiEdit',
  NOTEBOOK_EDIT = 'NotebookEdit',
  GREP = 'Grep',
  GLOB = 'Glob',
  LS = 'LS',
  BASH = 'Bash',
  TASK = 'Task',
  WEB_FETCH = 'WebFetch',
  WEB_SEARCH = 'WebSearch',
  TODO_WRITE = 'TodoWrite',
  EXIT_PLAN_MODE = 'ExitPlanMode'
}

// 简单Hook事件配置
export interface SimpleHookConfig {
  userPromptSubmit: string | null;  // 用户提交输入，null表示无配置
  sessionStart: string | null;      // 会话开始，null表示无配置
  stop: string | null;              // 停止响应，null表示无配置
  notification: string | null;      // 通知提醒，null表示无配置
}

// PostToolUse工具配置（按TOOL_SOUND_MAP分类）
export interface PostToolUseConfig {
  [toolName: string]: {
    success: string | null;  // 成功音效，null表示无配置
    error: string | null;    // 失败音效，null表示无配置
  }
}

// 应用配置
export interface AppConfig {
  // 简单Hook事件配置
  simpleHooks: SimpleHookConfig;
  
  // PostToolUse工具配置
  postToolUse: PostToolUseConfig;
  
  // 版本信息
  version: string;
  
  // 全局设置
  globalSettings?: GlobalSettings;
  
  // Hook配置
  hookConfigs?: Record<string, HookSoundConfig>;
  
  // 工具音效配置
  toolSoundConfig?: ToolSoundConfig;
  
  // 结果分析配置
  resultAnalysisConfig?: ResultAnalysisConfig;
}

// 默认音效配置（基于zelda项目的音效映射）
export const DEFAULT_SOUND_CONFIG = {
  simpleHooks: {
    userPromptSubmit: null,                    // 用户提交输入（默认无配置，用户可自行选择）
    sessionStart: 'session_start',             // 会话开始
    stop: 'session_night',                     // 停止响应
    notification: null                         // 通知提醒（默认无配置，避免过度打扰）
  },
  postToolUse: {
    'Read': { success: 'file_open', error: 'error' },
    'Write': { success: 'file_create', error: 'build_error' },
    'Edit': { success: 'item_small', error: 'error' },
    'MultiEdit': { success: 'achievement', error: 'build_error' },
    'NotebookEdit': { success: 'puzzle_solved', error: 'error' },
    'Grep': { success: 'search_found', error: 'error' },
    'Glob': { success: 'search_found', error: 'error' },
    'LS': { success: 'menu_select', error: 'error' },
    'Bash': { success: 'success', error: 'damage' },
    'Task': { success: 'shrine_complete', error: 'game_over' },
    'WebFetch': { success: 'search_found', error: 'error' },
    'WebSearch': { success: 'search_complete', error: 'error' },
    'TodoWrite': { success: 'todo_complete', error: 'error' },
    'ExitPlanMode': { success: 'menu_select', error: 'error' }
  }
};

// 工具执行上下文
export interface ToolExecutionContext {
  toolName: string;
  toolInput: any;
  toolResponse: any;
  executionTime: number;
  success: boolean;
  errorMessage?: string;
}

// Hook执行结果
export interface HookExecutionResult {
  success: boolean;
  soundPlayed?: string;
  executionTime: number;
  error?: string;
}

// 全局设置
export interface GlobalSettings {
  volume: number;
  enabled: boolean;
  soundsDirectory: string;
  useIntelligentMapping?: boolean;
  enablePerformanceOptimization?: boolean;
  enableDebugMode?: boolean;
}

// Hook音效配置
export interface HookSoundConfig {
  hookEventId: string;
  activeSoundId: string;
  useToolMapping?: boolean;
  intelligentMapping?: IntelligentMappingConfig;
}

// 工具音效配置
export interface ToolSoundConfig {
  [toolName: string]: ToolSoundMapping;
}

// 工具执行状态
export enum ToolExecutionStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  START = 'start',
  NO_RESULTS = 'no_results',
  COMPLETED = 'completed',
  ALL_COMPLETE = 'all_complete'
}

// 结果分析配置
export interface ResultAnalysisConfig {
  enabled: boolean;
  successKeywords: string[];
  errorKeywords: string[];
  timeoutMs: number;
  successIndicators?: string[];
}

// 智能映射配置
export interface IntelligentMappingConfig {
  enabled: boolean;
  learningMode: boolean;
  confidenceThreshold: number;
  useDefaultForUnknownTools?: boolean;
  defaultSuccessSound?: string;
  defaultErrorSound?: string;
  enableResultAnalysis?: boolean;
  errorKeywords?: string[];
}

declare global {
  interface Window {
    electronAPI: {
      // 配置管理
      getConfig: () => Promise<AppConfig>;
      updateConfig: (config: AppConfig) => Promise<boolean>;
      
      // 音效管理
      getAvailableSounds: () => Promise<SoundEffect[]>;
      previewSound: (soundId: string) => Promise<boolean>;
      installSoundPack: () => Promise<{ success: boolean; installedCount?: number }>;
      
      // Hook管理
      applyConfiguration: (config?: AppConfig) => Promise<boolean>;
      
      // 文件操作
      selectSoundFiles: () => Promise<string[] | null>;
      openSoundsFolder: () => Promise<boolean>;
    };
  }
}