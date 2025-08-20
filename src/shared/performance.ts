// Claude Code Cue - 性能优化模块

// 1. 音效文件缓存优化
class SoundCache {
  private cache = new Map<string, ArrayBuffer>();
  private maxCacheSize = 50; // 最大缓存50个音效
  
  async getSound(filepath: string): Promise<ArrayBuffer> {
    if (this.cache.has(filepath)) {
      return this.cache.get(filepath)!;
    }
    
    const buffer = await this.loadSoundFile(filepath);
    
    // 缓存管理 - LRU策略
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(filepath, buffer);
    return buffer;
  }
  
  private async loadSoundFile(_filepath: string): Promise<ArrayBuffer> {
    // 模拟文件加载
    return new ArrayBuffer(0);
  }
  
  clearCache() {
    this.cache.clear();
  }
}

// 2. 文件扫描优化
class OptimizedFileScanner {
  private scanCache = new Map<string, { files: string[], timestamp: number }>();
  private cacheExpiry = 5 * 60 * 1000; // 5分钟缓存
  
  async scanDirectory(_dirPath: string): Promise<string[]> {
    const now = Date.now();
    const cached = this.scanCache.get(_dirPath);
    
    // 检查缓存是否有效
    if (cached && (now - cached.timestamp) < this.cacheExpiry) {
      return cached.files;
    }
    
    // 扫描文件（模拟）
    const files = await this.performDirectoryScan(_dirPath);
    
    // 更新缓存
    this.scanCache.set(_dirPath, {
      files,
      timestamp: now
    });
    
    return files;
  }
  
  private async performDirectoryScan(_dirPath: string): Promise<string[]> {
    // 模拟文件扫描
    return [];
  }
  
  invalidateCache(dirPath?: string) {
    if (dirPath) {
      this.scanCache.delete(dirPath);
    } else {
      this.scanCache.clear();
    }
  }
}

// 3. UI渲染优化
interface VirtualListProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
}

class VirtualList {
  private visibleRange = { start: 0, end: 0 };
  
  calculateVisibleRange(scrollTop: number, props: VirtualListProps) {
    const { itemHeight, containerHeight, items } = props;
    
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + 1, items.length);
    
    this.visibleRange = { start, end };
    return this.visibleRange;
  }
  
  getVisibleItems(items: any[]) {
    return items.slice(this.visibleRange.start, this.visibleRange.end);
  }
}

// 4. 配置保存防抖优化
class DebouncedConfigSaver {
  private saveTimeout?: NodeJS.Timeout;
  private pendingConfig: any = null;
  private saveDelay = 500; // 500ms防抖
  
  scheduleConfigSave(config: any, saveFunction: (config: any) => Promise<void>) {
    this.pendingConfig = config;
    
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(async () => {
      if (this.pendingConfig) {
        await saveFunction(this.pendingConfig);
        this.pendingConfig = null;
      }
    }, this.saveDelay);
  }
  
  async forceSave(saveFunction: (config: any) => Promise<void>) {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = undefined;
    }
    
    if (this.pendingConfig) {
      await saveFunction(this.pendingConfig);
      this.pendingConfig = null;
    }
  }
}

// 5. 内存监控和清理
class MemoryMonitor {
  private cleanupTasks: (() => void)[] = [];
  private monitorInterval?: NodeJS.Timeout;
  
  startMonitoring() {
    this.monitorInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 30000); // 每30秒检查一次
  }
  
  stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
  }
  
  addCleanupTask(task: () => void) {
    this.cleanupTasks.push(task);
  }
  
  private checkMemoryUsage() {
    if (process.memoryUsage) {
      const usage = process.memoryUsage();
      const heapUsedMB = usage.heapUsed / 1024 / 1024;
      
      // 如果内存使用超过100MB，执行清理
      if (heapUsedMB > 100) {
        this.performCleanup();
      }
    }
  }
  
  private performCleanup() {
    console.log('🧹 执行内存清理...');
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.error('清理任务失败:', error);
      }
    });
  }
}

// 6. 组件级性能优化工具
export const PerformanceUtils = {
  // React组件防抖hook
  debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
    let timeoutId: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  },
  
  // 组件节流
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
  
  // 深度比较优化
  shallowEqual(obj1: any, obj2: any): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) {
      return false;
    }
    
    for (let key of keys1) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
    
    return true;
  }
};

// 导出优化模块
export {
  SoundCache,
  OptimizedFileScanner,
  VirtualList,
  DebouncedConfigSaver,
  MemoryMonitor
};

// 性能监控工具
export const PerformanceMonitor = {
  // 测量函数执行时间
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  },
  
  // 测量同步函数执行时间
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  }
};