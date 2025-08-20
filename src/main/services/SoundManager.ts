import { SoundEffect } from "../../shared/types";
import path from "path";
import fs from "fs/promises";
import { spawn } from "child_process";

export class SoundManager {
  private soundsDirectory: string;
  private supportedExtensions = ['.mp3', '.wav', '.aac', '.ogg', '.m4a'];

  constructor() {
    // 使用应用内置的音效目录
    // 使用更可靠的方法检测环境：检查是否为打包后的应用
    const isPackaged = process.env.NODE_ENV === 'production' || !process.defaultApp;
    
    if (isPackaged && process.resourcesPath) {
      // 生产环境：音效文件位于 Resources/sounds 目录
      this.soundsDirectory = path.join(process.resourcesPath, 'sounds');
    } else {
      // 开发环境：音效文件位于 src/assets/sounds 目录
      // 从编译后的 out/main 目录向上查找项目根目录
      const projectRoot = path.resolve(__dirname, '../../');
      this.soundsDirectory = path.join(projectRoot, 'src/assets/sounds');
    }
    this.ensureSoundsDirectory();
  }

  private async ensureSoundsDirectory() {
    try {
      await fs.access(this.soundsDirectory);
    } catch {
      await fs.mkdir(this.soundsDirectory, { recursive: true });
    }
  }

  getSoundsDirectory(): string {
    return this.soundsDirectory;
  }

  async getAvailableSounds(): Promise<SoundEffect[]> {
    try {
      console.log('SoundManager: 开始加载音效文件');
      console.log('SoundManager: 音效目录路径:', this.soundsDirectory);
      const isPackaged = process.env.NODE_ENV === 'production' || !process.defaultApp;
      console.log('SoundManager: 是否为生产环境:', isPackaged);
      
      await this.ensureSoundsDirectory();
      
      // 检查目录是否存在
      try {
        await fs.access(this.soundsDirectory);
        console.log('SoundManager: 音效目录访问成功');
      } catch (accessError) {
        console.error('SoundManager: 无法访问音效目录:', accessError);
        throw new Error(`音效目录不存在或无法访问: ${this.soundsDirectory}`);
      }
      
      const files = await fs.readdir(this.soundsDirectory);
      console.log('SoundManager: 找到文件数量:', files.length);
      console.log('SoundManager: 文件列表:', files.slice(0, 10)); // 只显示前10个文件
      
      const soundFiles = files.filter(file => 
        this.supportedExtensions.includes(path.extname(file).toLowerCase())
      );
      console.log('SoundManager: 音效文件数量:', soundFiles.length);

      const sounds: SoundEffect[] = [];
      for (const file of soundFiles) {
        const fullPath = path.join(this.soundsDirectory, file);
        try {
          const stats = await fs.stat(fullPath);
          
          sounds.push({
            id: this.generateSoundId(file),
            name: path.parse(file).name,
            filename: file,
            filepath: fullPath,
            category: this.getCategoryFromFilename(file),
            description: `音效文件 (${this.formatFileSize(stats.size)})`
          });
        } catch (statError) {
          console.warn(`无法获取文件状态: ${file}`, statError);
          // 即使无法获取文件状态，也添加到列表中
          sounds.push({
            id: this.generateSoundId(file),
            name: path.parse(file).name,
            filename: file,
            filepath: fullPath,
            category: this.getCategoryFromFilename(file),
            description: '音效文件'
          });
        }
      }

      console.log('SoundManager: 成功加载音效数量:', sounds.length);
      return sounds.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('SoundManager: 获取音效列表失败:', error);
      console.error('SoundManager: 错误详情:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        soundsDirectory: this.soundsDirectory,
        isProduction: process.env.NODE_ENV === 'production' || !process.defaultApp
      });
      throw error; // 重新抛出错误，让上层处理
    }
  }

  async previewSound(soundId: string): Promise<boolean> {
    try {
      const sounds = await this.getAvailableSounds();
      const sound = sounds.find(s => s.id === soundId);
      
      if (!sound) {
        console.error('音效不存在:', soundId);
        return false;
      }

      await this.playSound(sound.filepath);
      return true;
    } catch (error) {
      console.error('预览音效失败:', error);
      return false;
    }
  }

  async installSoundPack(sourceDir: string): Promise<number> {
    try {
      const files = await fs.readdir(sourceDir);
      const soundFiles = files.filter(file => 
        this.supportedExtensions.includes(path.extname(file).toLowerCase())
      );

      let installedCount = 0;
      for (const file of soundFiles) {
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(this.soundsDirectory, file);
        
        try {
          await fs.copyFile(sourcePath, targetPath);
          installedCount++;
        } catch (error) {
          console.error(`复制文件失败 ${file}:`, error);
        }
      }

      return installedCount;
    } catch (error) {
      console.error('安装音效包失败:', error);
      return 0;
    }
  }

  private async playSound(filepath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let command: string;
      let args: string[];

      // 根据平台选择音频播放命令
      switch (process.platform) {
        case 'darwin': // macOS
          command = 'afplay';
          args = [filepath];
          break;
        case 'linux':
          command = 'aplay';
          args = [filepath];
          break;
        case 'win32': // Windows
          command = 'powershell';
          args = ['-c', `(New-Object Media.SoundPlayer '${filepath}').PlaySync()`];
          break;
        default:
          reject(new Error(`不支持的平台: ${process.platform}`));
          return;
      }

      const player = spawn(command, args);
      
      player.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`音频播放失败，退出码: ${code}`));
        }
      });

      player.on('error', (error) => {
        reject(error);
      });
    });
  }

  stopAllSounds(): void {
    // 这是一个简化的实现，实际项目中可能需要跟踪所有播放的进程
    console.log('停止所有音效播放');
  }

  private generateSoundId(filename: string): string {
    // 使用文件名生成稳定的 ID，不使用时间戳
    return path.parse(filename).name;
  }

  private getCategoryFromFilename(filename: string): string {
    const name = filename.toLowerCase();
    if (name.includes('error') || name.includes('fail')) return 'error';
    if (name.includes('success') || name.includes('complete')) return 'success';
    if (name.includes('notification') || name.includes('alert')) return 'notification';
    if (name.includes('click') || name.includes('button')) return 'interaction';
    return 'general';
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}