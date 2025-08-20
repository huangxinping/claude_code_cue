import { contextBridge, ipcRenderer } from 'electron';
import { AppConfig, SoundEffect } from '../shared/types';

// 为渲染进程暴露安全的API
contextBridge.exposeInMainWorld('electronAPI', {
  // 配置管理
  getConfig: (): Promise<AppConfig> => ipcRenderer.invoke('getConfig'),
  updateConfig: (config: AppConfig): Promise<boolean> => ipcRenderer.invoke('updateConfig', config),

  // 音效管理
  getAvailableSounds: (): Promise<SoundEffect[]> => ipcRenderer.invoke('getAvailableSounds'),
  previewSound: (soundId: string): Promise<boolean> => ipcRenderer.invoke('previewSound', soundId),
  installSoundPack: (): Promise<{ success: boolean; installedCount?: number }> => ipcRenderer.invoke('installSoundPack'),

  // Hook管理
  applyConfiguration: (config?: AppConfig): Promise<boolean> => ipcRenderer.invoke('applyConfiguration', config),

  // 文件操作
  selectSoundFiles: (): Promise<string[] | null> => ipcRenderer.invoke('selectSoundFiles'),
  openSoundsFolder: (): Promise<boolean> => ipcRenderer.invoke('openSoundsFolder'),
});

// 类型声明已在 shared/types.ts 中定义