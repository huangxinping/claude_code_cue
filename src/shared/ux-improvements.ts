// Claude Code Cue - 用户体验改进模块

// 1. 加载状态管理
class LoadingManagerClass {
  private loadingStates = new Map<string, boolean>();
  private callbacks = new Map<string, (() => void)[]>();
  
  setLoading(key: string, isLoading: boolean) {
    this.loadingStates.set(key, isLoading);
    
    // 触发回调
    const keyCallbacks = this.callbacks.get(key) || [];
    keyCallbacks.forEach(callback => callback());
  }
  
  isLoading(key: string): boolean {
    return this.loadingStates.get(key) || false;
  }
  
  onLoadingChange(key: string, callback: () => void) {
    if (!this.callbacks.has(key)) {
      this.callbacks.set(key, []);
    }
    this.callbacks.get(key)!.push(callback);
  }
}

// 2. 用户反馈管理
class UserFeedbackManagerClass {
  private feedbackQueue: { message: string; type: 'success' | 'error' | 'info'; duration: number }[] = [];
  private isShowing = false;
  
  showFeedback(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) {
    this.feedbackQueue.push({ message, type, duration });
    if (!this.isShowing) {
      this.processQueue();
    }
  }
  
  private async processQueue() {
    if (this.feedbackQueue.length === 0) return;
    
    this.isShowing = true;
    const feedback = this.feedbackQueue.shift()!;
    
    // 显示反馈（实际实现中会与UI组件集成）
    console.log(`[${feedback.type.toUpperCase()}] ${feedback.message}`);
    
    await new Promise(resolve => setTimeout(resolve, feedback.duration));
    
    this.isShowing = false;
    this.processQueue(); // 处理下一个
  }
}

// 3. 智能搜索过滤
class SmartSearchFilterClass {
  private searchHistory: string[] = [];
  private maxHistorySize = 20;
  
  filterItems<T>(items: T[], searchTerm: string, getSearchText: (item: T) => string): T[] {
    if (!searchTerm.trim()) return items;
    
    // 记录搜索历史
    this.addToHistory(searchTerm);
    
    const term = searchTerm.toLowerCase();
    return items.filter(item => {
      const searchText = getSearchText(item).toLowerCase();
      
      // 支持模糊搜索
      return searchText.includes(term) || 
             this.fuzzyMatch(searchText, term);
    });
  }
  
  private fuzzyMatch(text: string, pattern: string): boolean {
    let patternIdx = 0;
    for (let i = 0; i < text.length && patternIdx < pattern.length; i++) {
      if (text[i] === pattern[patternIdx]) {
        patternIdx++;
      }
    }
    return patternIdx === pattern.length;
  }
  
  private addToHistory(term: string) {
    const index = this.searchHistory.indexOf(term);
    if (index > -1) {
      this.searchHistory.splice(index, 1);
    }
    
    this.searchHistory.unshift(term);
    if (this.searchHistory.length > this.maxHistorySize) {
      this.searchHistory.pop();
    }
  }
  
  getSearchHistory(): string[] {
    return [...this.searchHistory];
  }
}

// 4. 自动保存管理
class AutoSaveManagerClass {
  private saveTimeouts = new Map<string, NodeJS.Timeout>();
  private saveDelay = 2000; // 2秒延迟
  
  scheduleAutoSave(key: string, saveFunction: () => Promise<void>) {
    // 清除之前的定时器
    const existingTimeout = this.saveTimeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // 设置新的定时器
    const timeout = setTimeout(async () => {
      try {
        await saveFunction();
        this.saveTimeouts.delete(key);
      } catch (error) {
        console.error(`自动保存失败 [${key}]:`, error);
      }
    }, this.saveDelay);
    
    this.saveTimeouts.set(key, timeout);
  }
  
  async forceSave(key: string, saveFunction: () => Promise<void>) {
    const timeout = this.saveTimeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.saveTimeouts.delete(key);
    }
    
    try {
      await saveFunction();
    } catch (error) {
      console.error(`强制保存失败 [${key}]:`, error);
    }
  }
  
  cancelAutoSave(key: string) {
    const timeout = this.saveTimeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.saveTimeouts.delete(key);
    }
  }
}

// 5. 键盘快捷键管理
class KeyboardShortcutManagerClass {
  private shortcuts = new Map<string, () => void>();
  private isListening = false;
  
  register(combination: string, callback: () => void) {
    this.shortcuts.set(combination.toLowerCase(), callback);
    if (!this.isListening) {
      this.startListening();
    }
  }
  
  unregister(combination: string) {
    this.shortcuts.delete(combination.toLowerCase());
  }
  
  private startListening() {
    this.isListening = true;
    
    document.addEventListener('keydown', (event) => {
      const combination = this.getKeyCombination(event);
      const callback = this.shortcuts.get(combination);
      
      if (callback) {
        event.preventDefault();
        callback();
      }
    });
  }
  
  private getKeyCombination(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    if (event.metaKey) parts.push('meta');
    
    parts.push(event.key.toLowerCase());
    
    return parts.join('+');
  }
}

// 6. 增强音频预览
class EnhancedAudioPreviewClass {
  private currentAudio?: HTMLAudioElement;
  
  async playPreview(audioPath: string, volume = 0.8): Promise<void> {
    // 停止之前的播放
    this.stopPreview();
    
    return new Promise((resolve, reject) => {
      this.currentAudio = new Audio(audioPath);
      this.currentAudio.volume = volume;
      
      this.currentAudio.onended = () => {
        this.cleanup();
        resolve();
      };
      
      this.currentAudio.onerror = () => {
        this.cleanup();
        reject(new Error('音频播放失败'));
      };
      
      this.currentAudio.play().catch(reject);
    });
  }
  
  stopPreview() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.cleanup();
    }
  }
  
  private cleanup() {
    if (this.currentAudio) {
      this.currentAudio.remove();
      this.currentAudio = undefined;
    }
  }
  
  isPlaying(): boolean {
    return this.currentAudio ? !this.currentAudio.paused : false;
  }
}

// 创建单例实例
export const LoadingManager = new LoadingManagerClass();
export const UserFeedbackManager = new UserFeedbackManagerClass();
export const SmartSearchFilter = new SmartSearchFilterClass();
export const AutoSaveManager = new AutoSaveManagerClass();
export const KeyboardShortcutManager = new KeyboardShortcutManagerClass();
export const EnhancedAudioPreview = new EnhancedAudioPreviewClass();

// 导出工具函数
export const UXUtils = {
  // 防抖函数
  debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
    let timeoutId: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  },
  
  // 节流函数
  throttle<T extends (...args: any[]) => void>(func: T, delay: number): T {
    let lastCall = 0;
    return ((...args: any[]) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    }) as T;
  },
  
  // 格式化文件大小
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  // 生成唯一ID
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};