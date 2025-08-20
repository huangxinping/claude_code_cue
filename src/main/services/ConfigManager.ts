import { 
  AppConfig, 
  GlobalSettings, 
  HookSoundConfig, 
  ToolSoundConfig, 
  SupportedTools,
  ResultAnalysisConfig,
  IntelligentMappingConfig 
} from "../../shared/types";
import { app } from "electron";
import path from "path";
import fs from "fs/promises";

export class ConfigManager {
  private configPath: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.configPath = path.join(userDataPath, 'config.json');
  }

  async getConfig(): Promise<AppConfig> {
    try {
      const configData = await fs.readFile(this.configPath, 'utf-8');
      const config = JSON.parse(configData) as AppConfig;
      
      // 验证配置结构
      return this.validateConfig(config);
    } catch (error) {
      console.log('配置文件不存在或损坏，使用默认配置');
      const defaultConfig = this.getDefaultConfig();
      await this.saveConfig(defaultConfig);
      return defaultConfig;
    }
  }

  async saveConfig(config: AppConfig): Promise<boolean> {
    try {
      // 确保配置目录存在
      const configDir = path.dirname(this.configPath);
      await fs.mkdir(configDir, { recursive: true });

      // 验证并保存配置
      const validatedConfig = this.validateConfig(config);
      await fs.writeFile(this.configPath, JSON.stringify(validatedConfig, null, 2), 'utf-8');
      
      return true;
    } catch (error) {
      console.error('保存配置失败:', error);
      return false;
    }
  }

  /**
   * 获取默认配置
   * 包含完整的工具音效映射和智能配置选项
   */
  getDefaultConfig(): AppConfig {
    const defaultGlobalSettings: GlobalSettings = {
      volume: 0.8,
      enabled: true,
      soundsDirectory: '',
      useIntelligentMapping: true, // 默认启用智能工具音效映射
      enablePerformanceOptimization: true, // 启用性能优化
      enableDebugMode: false // 默认关闭调试模式
    };

    // 默认智能映射配置
    const defaultIntelligentMapping: IntelligentMappingConfig = {
      enabled: true,
      learningMode: false,
      confidenceThreshold: 0.8,
      useDefaultForUnknownTools: true,
      defaultSuccessSound: "success.wav",
      defaultErrorSound: "error.wav",
      enableResultAnalysis: true,
      errorKeywords: ["error", "failed", "exception", "not found", "permission denied", "timeout"]
    };

    const defaultHookConfigs: Record<string, HookSoundConfig> = {
      "postToolUse": {
        hookEventId: "postToolUse",
        activeSoundId: "", // 默认未选择音效
        useToolMapping: false, // 默认为基础配置，由前端动态调整
        intelligentMapping: defaultIntelligentMapping
      },
      "userPromptSubmit": {
        hookEventId: "userPromptSubmit",
        activeSoundId: "", // 默认未选择音效
        useToolMapping: false
      },
      "sessionStart": {
        hookEventId: "sessionStart",
        activeSoundId: "", // 默认未选择音效
        useToolMapping: false
      },
      "stop": {
        hookEventId: "stop",
        activeSoundId: "", // 默认未选择音效
        useToolMapping: false
      }
    };
    
    // 完整的工具音效配置（与 claude-code-but-zelda 完全一致）
    const defaultToolSoundConfig: ToolSoundConfig = {
      [SupportedTools.READ]: { "success": "file_open.wav", "error": "error.wav" },
      [SupportedTools.WRITE]: { "success": "file_create.wav", "error": "build_error.wav" },
      [SupportedTools.EDIT]: { "success": "item_small.wav", "error": "error.wav" },
      [SupportedTools.MULTI_EDIT]: { "success": "achievement.wav", "error": "build_error.wav" },
      [SupportedTools.NOTEBOOK_EDIT]: { "success": "puzzle_solved.wav", "error": "error.wav" },
      [SupportedTools.GREP]: { "success": "search_found.wav", "no_results": "search_complete.wav", "error": "error.wav" },
      [SupportedTools.GLOB]: { "success": "search_found.wav", "error": "error.wav" },
      [SupportedTools.LS]: { "success": "menu_select.wav", "error": "error.wav" },
      [SupportedTools.BASH]: { "start": "item_small.wav", "success": "success.wav", "error": "damage.wav" },
      [SupportedTools.TASK]: { "start": "session_start.wav", "success": "shrine_complete.wav", "error": "game_over.wav" },
      [SupportedTools.WEB_FETCH]: { "success": "search_found.wav", "error": "error.wav" },
      [SupportedTools.WEB_SEARCH]: { "success": "search_complete.wav", "error": "error.wav" },
      [SupportedTools.TODO_WRITE]: { "success": "todo_complete.wav", "completed": "heart_get.wav", "all_complete": "achievement.wav" },
      [SupportedTools.EXIT_PLAN_MODE]: { "success": "menu_select.wav" }
    };

    // 默认结果分析配置
    const defaultResultAnalysisConfig: ResultAnalysisConfig = {
      enabled: true,
      successKeywords: ["success", "completed", "done", "finished", "ok", "created", "updated"],
      errorKeywords: ["error", "failed", "exception", "not found", "permission denied", "timeout", "invalid", "forbidden"],
      successIndicators: ["success", "completed", "done", "finished", "ok", "created", "updated"],
      timeoutMs: 5000
    };

    return {
      simpleHooks: {
        userPromptSubmit: null,
        sessionStart: 'session_start',
        stop: 'session_night',
        notification: null
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
      },
      globalSettings: defaultGlobalSettings,
      hookConfigs: defaultHookConfigs,
      toolSoundConfig: defaultToolSoundConfig,
      resultAnalysisConfig: defaultResultAnalysisConfig,
      version: "1.0.0"
    };
  }

  /**
   * 验证和修复配置数据
   * 确保配置结构完整且有效
   */
  private validateConfig(config: any): AppConfig {
    const defaultConfig = this.getDefaultConfig();
    
    const validatedConfig: AppConfig = {
      simpleHooks: config.simpleHooks || defaultConfig.simpleHooks,
      postToolUse: config.postToolUse || defaultConfig.postToolUse,
      globalSettings: this.validateGlobalSettings(config.globalSettings),
      hookConfigs: defaultConfig.hookConfigs,
      toolSoundConfig: this.validateToolSoundConfig(config.toolSoundConfig),
      resultAnalysisConfig: this.validateResultAnalysisConfig(config.resultAnalysisConfig),
      version: config.version || defaultConfig.version
    };

    // 验证Hook配置
    if (config.hookConfigs && typeof config.hookConfigs === 'object') {
      const hookConfigs: Record<string, HookSoundConfig> = {};
      for (const [key, hookConfig] of Object.entries(config.hookConfigs)) {
        if (this.isValidHookConfig(hookConfig)) {
          hookConfigs[key] = this.validateHookSoundConfig(hookConfig as any);
        }
      }
      if (Object.keys(hookConfigs).length > 0) {
        validatedConfig.hookConfigs = hookConfigs;
      }
    }

    return validatedConfig;
  }



  /**
   * 验证全局设置
   */
  private validateGlobalSettings(settings: any): GlobalSettings {
    const defaultSettings: GlobalSettings = {
      volume: 0.8,
      enabled: true,
      soundsDirectory: '',
      useIntelligentMapping: true,
      enablePerformanceOptimization: true,
      enableDebugMode: false
    };
    
    return {
      volume: typeof settings?.volume === 'number' ? settings.volume : defaultSettings.volume,
      enabled: typeof settings?.enabled === 'boolean' ? settings.enabled : defaultSettings.enabled,
      soundsDirectory: typeof settings?.soundsDirectory === 'string' ? settings.soundsDirectory : defaultSettings.soundsDirectory,
      useIntelligentMapping: typeof settings?.useIntelligentMapping === 'boolean' ? settings.useIntelligentMapping : defaultSettings.useIntelligentMapping,
      enablePerformanceOptimization: typeof settings?.enablePerformanceOptimization === 'boolean' ? settings.enablePerformanceOptimization : defaultSettings.enablePerformanceOptimization,
      enableDebugMode: typeof settings?.enableDebugMode === 'boolean' ? settings.enableDebugMode : defaultSettings.enableDebugMode
    };
  }

  /**
   * 验证工具音效配置
   */
  private validateToolSoundConfig(toolConfig: any): ToolSoundConfig {
    const defaultToolSoundConfig: ToolSoundConfig = {
      [SupportedTools.READ]: { "success": "file_open.wav", "error": "error.wav" },
      [SupportedTools.WRITE]: { "success": "file_create.wav", "error": "build_error.wav" },
      [SupportedTools.EDIT]: { "success": "item_small.wav", "error": "error.wav" },
      [SupportedTools.MULTI_EDIT]: { "success": "achievement.wav", "error": "build_error.wav" },
      [SupportedTools.NOTEBOOK_EDIT]: { "success": "puzzle_solved.wav", "error": "error.wav" },
      [SupportedTools.GREP]: { "success": "search_found.wav", "no_results": "search_complete.wav", "error": "error.wav" },
      [SupportedTools.GLOB]: { "success": "search_found.wav", "error": "error.wav" },
      [SupportedTools.LS]: { "success": "menu_select.wav", "error": "error.wav" },
      [SupportedTools.BASH]: { "start": "item_small.wav", "success": "success.wav", "error": "damage.wav" },
      [SupportedTools.TASK]: { "start": "session_start.wav", "success": "shrine_complete.wav", "error": "game_over.wav" },
      [SupportedTools.WEB_FETCH]: { "success": "search_found.wav", "error": "error.wav" },
      [SupportedTools.WEB_SEARCH]: { "success": "search_complete.wav", "error": "error.wav" },
      [SupportedTools.TODO_WRITE]: { "success": "todo_complete.wav", "completed": "heart_get.wav", "all_complete": "achievement.wav" },
      [SupportedTools.EXIT_PLAN_MODE]: { "success": "menu_select.wav" }
    };

    if (!toolConfig || typeof toolConfig !== 'object') {
      return defaultToolSoundConfig;
    }
    
    const validatedConfig: ToolSoundConfig = {};
    
    // 验证每个工具的配置
    for (const toolName of Object.values(SupportedTools)) {
      if (toolConfig[toolName] && typeof toolConfig[toolName] === 'object') {
        validatedConfig[toolName] = { ...toolConfig[toolName] };
      } else {
        validatedConfig[toolName] = defaultToolSoundConfig[toolName] || {};
      }
    }
    
    return validatedConfig;
  }

  /**
   * 验证结果分析配置
   */
  private validateResultAnalysisConfig(config: any): ResultAnalysisConfig {
    const defaultResultAnalysisConfig: ResultAnalysisConfig = {
      enabled: true,
      successKeywords: ["success", "completed", "done", "finished", "ok", "created", "updated"],
      errorKeywords: ["error", "failed", "exception", "not found", "permission denied", "timeout", "invalid", "forbidden"],
      successIndicators: ["success", "completed", "done", "finished", "ok", "created", "updated"],
      timeoutMs: 5000
    };
    
    if (!config || typeof config !== 'object') {
      return defaultResultAnalysisConfig;
    }
    
    return {
      enabled: typeof config.enabled === 'boolean' ? config.enabled : defaultResultAnalysisConfig.enabled,
      successKeywords: Array.isArray(config.successKeywords) ? config.successKeywords : defaultResultAnalysisConfig.successKeywords,
      errorKeywords: Array.isArray(config.errorKeywords) ? config.errorKeywords : defaultResultAnalysisConfig.errorKeywords,
      successIndicators: Array.isArray(config.successIndicators) ? config.successIndicators : defaultResultAnalysisConfig.successIndicators,
      timeoutMs: typeof config.timeoutMs === 'number' ? config.timeoutMs : defaultResultAnalysisConfig.timeoutMs
    };
  }

  /**
   * 验证Hook音效配置
   */
  private validateHookSoundConfig(config: any): HookSoundConfig {
    const defaultIntelligentMapping: IntelligentMappingConfig = {
      enabled: true,
      learningMode: false,
      confidenceThreshold: 0.8,
      useDefaultForUnknownTools: true,
      defaultSuccessSound: "success.wav",
      defaultErrorSound: "error.wav",
      enableResultAnalysis: true,
      errorKeywords: ["error", "failed", "exception", "not found", "permission denied", "timeout"]
    };
    
    return {
      hookEventId: config.hookEventId || '',
      activeSoundId: config.activeSoundId || '',
      useToolMapping: typeof config.useToolMapping === 'boolean' ? config.useToolMapping : false,
      intelligentMapping: config.intelligentMapping || defaultIntelligentMapping
    };
  }

  /**
   * 获取支持的工具列表
   */
  getSupportedTools(): string[] {
    return Object.values(SupportedTools);
  }

  /**
   * 获取工具的默认音效配置
   */
  getDefaultToolSoundMapping(toolName: string): any {
    const defaultToolSoundConfig: ToolSoundConfig = {
      [SupportedTools.READ]: { "success": "file_open.wav", "error": "error.wav" },
      [SupportedTools.WRITE]: { "success": "file_create.wav", "error": "build_error.wav" },
      [SupportedTools.EDIT]: { "success": "item_small.wav", "error": "error.wav" },
      [SupportedTools.MULTI_EDIT]: { "success": "achievement.wav", "error": "build_error.wav" },
      [SupportedTools.NOTEBOOK_EDIT]: { "success": "puzzle_solved.wav", "error": "error.wav" },
      [SupportedTools.GREP]: { "success": "search_found.wav", "no_results": "search_complete.wav", "error": "error.wav" },
      [SupportedTools.GLOB]: { "success": "search_found.wav", "error": "error.wav" },
      [SupportedTools.LS]: { "success": "menu_select.wav", "error": "error.wav" },
      [SupportedTools.BASH]: { "start": "item_small.wav", "success": "success.wav", "error": "damage.wav" },
      [SupportedTools.TASK]: { "start": "session_start.wav", "success": "shrine_complete.wav", "error": "game_over.wav" },
      [SupportedTools.WEB_FETCH]: { "success": "search_found.wav", "error": "error.wav" },
      [SupportedTools.WEB_SEARCH]: { "success": "search_complete.wav", "error": "error.wav" },
      [SupportedTools.TODO_WRITE]: { "success": "todo_complete.wav", "completed": "heart_get.wav", "all_complete": "achievement.wav" },
      [SupportedTools.EXIT_PLAN_MODE]: { "success": "menu_select.wav" }
    };
    return defaultToolSoundConfig[toolName] || {};
  }

  private isValidHookConfig(config: any): boolean {
    return config &&
           typeof config === 'object' &&
           typeof config.hookEventId === 'string';
  }

  async resetConfig(): Promise<boolean> {
    try {
      const defaultConfig = this.getDefaultConfig();
      return await this.saveConfig(defaultConfig);
    } catch (error) {
      console.error('重置配置失败:', error);
      return false;
    }
  }

  async backupConfig(): Promise<string | null> {
    try {
      const config = await this.getConfig();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = this.configPath.replace('.json', `_backup_${timestamp}.json`);
      
      await fs.writeFile(backupPath, JSON.stringify(config, null, 2), 'utf-8');
      return backupPath;
    } catch (error) {
      console.error('备份配置失败:', error);
      return null;
    }
  }

  async importConfig(configPath: string): Promise<boolean> {
    try {
      const configData = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configData);
      const validatedConfig = this.validateConfig(config);
      
      return await this.saveConfig(validatedConfig);
    } catch (error) {
      console.error('导入配置失败:', error);
      return false;
    }
  }

  getConfigPath(): string {
    return this.configPath;
  }
}