import { contextBridge, ipcRenderer } from "electron";
import { AppConfig } from "../shared/types";

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld("electronAPI", {
  // 配置管理
  getConfig: () => ipcRenderer.invoke("getConfig"),
  updateConfig: (config: AppConfig) => ipcRenderer.invoke("updateConfig", config),
  
  // 音效管理
  getAvailableSounds: () => ipcRenderer.invoke("getAvailableSounds"),
  previewSound: (soundId: string) => ipcRenderer.invoke("previewSound", soundId),
  installSoundPack: () => ipcRenderer.invoke("installSoundPack"),
  
  // Hook管理
  applyConfiguration: () => ipcRenderer.invoke("applyConfiguration"),
  
  // 文件操作
  selectSoundFiles: () => ipcRenderer.invoke("selectSoundFiles"),
  openSoundsFolder: () => ipcRenderer.invoke("openSoundsFolder"),
});