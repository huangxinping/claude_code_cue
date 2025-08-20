import { ToolExecutionContext, ResultAnalysisConfig, ToolExecutionStatus } from "../../shared/types";

/**
 * 工具执行结果分析器
 * 负责分析工具执行结果，判断成功/失败状态
 */
export class ResultAnalyzer {
  private config: ResultAnalysisConfig;

  constructor(config: ResultAnalysisConfig) {
    this.config = config;
  }

  /**
   * 更新分析配置
   */
  updateConfig(config: ResultAnalysisConfig): void {
    this.config = config;
  }

  /**
   * 分析工具执行结果
   * @param context 工具执行上下文
   * @returns 执行状态
   */
  analyzeToolExecution(context: ToolExecutionContext): ToolExecutionStatus {
    if (!this.config.enabled) {
      return context.success ? ToolExecutionStatus.SUCCESS : ToolExecutionStatus.ERROR;
    }

    // 如果已经明确标记为失败
    if (!context.success || context.errorMessage) {
      return ToolExecutionStatus.ERROR;
    }

    // 分析响应内容
    const responseText = this.extractResponseText(context.toolResponse);
    
    // 检查错误关键词
    if (this.containsErrorKeywords(responseText)) {
      return ToolExecutionStatus.ERROR;
    }

    // 检查成功指标
    if (this.containsSuccessIndicators(responseText)) {
      return ToolExecutionStatus.SUCCESS;
    }

    // 特殊情况处理
    return this.analyzeSpecialCases(context, responseText);
  }

  /**
   * 提取响应文本内容
   */
  private extractResponseText(response: any): string {
    if (typeof response === 'string') {
      return response.toLowerCase();
    }

    if (typeof response === 'object' && response !== null) {
      // 尝试提取常见的文本字段
      const textFields = ['message', 'output', 'result', 'content', 'data', 'text'];
      
      for (const field of textFields) {
        if (response[field] && typeof response[field] === 'string') {
          return response[field].toLowerCase();
        }
      }

      // 如果没有找到文本字段，将整个对象转换为字符串
      return JSON.stringify(response).toLowerCase();
    }

    return String(response).toLowerCase();
  }

  /**
   * 检查是否包含错误关键词
   */
  private containsErrorKeywords(text: string): boolean {
    return this.config.errorKeywords.some(keyword => 
      text.includes(keyword.toLowerCase())
    );
  }

  /**
   * 检查是否包含成功指标
   */
  private containsSuccessIndicators(text: string): boolean {
    return this.config.successIndicators?.some(indicator => 
      text.includes(indicator.toLowerCase())
    ) || false;
  }

  /**
   * 分析特殊情况
   */
  private analyzeSpecialCases(context: ToolExecutionContext, responseText: string): ToolExecutionStatus {
    const { toolName, toolResponse } = context;

    switch (toolName) {
      case 'Grep':
      case 'Glob':
        // 搜索工具：如果没有结果，返回 NO_RESULTS
        if (this.isEmptySearchResult(toolResponse, responseText)) {
          return ToolExecutionStatus.NO_RESULTS;
        }
        break;

      case 'TodoWrite':
        // Todo工具：检查是否完成所有任务
        if (this.isAllTodosComplete(responseText)) {
          return ToolExecutionStatus.ALL_COMPLETE;
        }
        if (this.isTodoCompleted(responseText)) {
          return ToolExecutionStatus.COMPLETED;
        }
        break;

      case 'Bash':
      case 'Task':
        // 执行工具：检查退出码
        if (this.hasNonZeroExitCode(toolResponse)) {
          return ToolExecutionStatus.ERROR;
        }
        break;
    }

    // 默认返回成功
    return ToolExecutionStatus.SUCCESS;
  }

  /**
   * 检查是否为空搜索结果
   */
  private isEmptySearchResult(response: any, text: string): boolean {
    // 检查常见的空结果指标
    const emptyIndicators = [
      'no matches found',
      'no results',
      'not found',
      '0 matches',
      'empty result',
      'no files found'
    ];

    if (emptyIndicators.some(indicator => text.includes(indicator))) {
      return true;
    }

    // 检查响应对象
    if (typeof response === 'object' && response !== null) {
      // 检查结果数组是否为空
      if (Array.isArray(response.results) && response.results.length === 0) {
        return true;
      }
      if (Array.isArray(response.matches) && response.matches.length === 0) {
        return true;
      }
      if (typeof response.count === 'number' && response.count === 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * 检查是否完成了所有Todo
   */
  private isAllTodosComplete(text: string): boolean {
    const allCompleteIndicators = [
      'all tasks completed',
      'all todos completed',
      'all items completed',
      '100% complete',
      'everything done'
    ];

    return allCompleteIndicators.some(indicator => text.includes(indicator));
  }

  /**
   * 检查是否完成了单个Todo
   */
  private isTodoCompleted(text: string): boolean {
    const completedIndicators = [
      'task completed',
      'todo completed',
      'item completed',
      'marked as completed',
      'status: completed'
    ];

    return completedIndicators.some(indicator => text.includes(indicator));
  }

  /**
   * 检查是否有非零退出码
   */
  private hasNonZeroExitCode(response: any): boolean {
    if (typeof response === 'object' && response !== null) {
      const exitCode = response.exitCode || response.exit_code || response.code;
      if (typeof exitCode === 'number' && exitCode !== 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * 获取分析统计信息
   */
  getAnalysisStats(): {
    totalAnalyzed: number;
    successCount: number;
    errorCount: number;
    noResultsCount: number;
  } {
    // 这里可以添加统计逻辑
    return {
      totalAnalyzed: 0,
      successCount: 0,
      errorCount: 0,
      noResultsCount: 0
    };
  }

  /**
   * 重置分析统计
   */
  resetStats(): void {
    // 重置统计数据
  }
}