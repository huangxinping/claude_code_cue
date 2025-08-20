import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import path from "path";
import { AppConfig } from "../shared/types";
import { SoundManager } from "./services/SoundManager";
import { HookManager } from "./services/HookManager";
import { ConfigManager } from "./services/ConfigManager";

let mainWindow: BrowserWindow | null = null;
const isMac = process.platform === "darwin";

// 初始化服务
const soundManager = new SoundManager();
const hookManager = new HookManager();
const configManager = new ConfigManager();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 825,
    minHeight: 600,
    title: "Claude Code Cue",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    // 使用 macOS 隐藏式标题栏，仅在 macOS 启用
    ...(isMac ? { titleBarStyle: "hiddenInset" as const } : {}),
    autoHideMenuBar: true,
    show: false, // 窗口准备好后再显示
  });

  // 窗口准备好后显示
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  // 禁用默认的Web行为，使应用更像原生桌面应用
  mainWindow.webContents.on("before-input-event", (event, input) => {
    // 禁用F12开发者工具快捷键（生产环境）
    if (app.isPackaged && input.key === "F12") {
      event.preventDefault();
    }
  });

  // 禁用右键菜单（生产环境）
  if (app.isPackaged) {
    mainWindow.webContents.on("context-menu", (event) => {
      event.preventDefault();
    });
  }

  // 禁用拖拽文件到窗口
  mainWindow.webContents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== "http://localhost:5173" && !app.isPackaged) {
      event.preventDefault();
    } else if (app.isPackaged && !navigationUrl.startsWith("file://")) {
      event.preventDefault();
    }
  });

  // 禁用新窗口打开
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  } else {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// IPC handlers

// 配置管理
ipcMain.handle("getConfig", async () => {
  try {
    return await configManager.getConfig();
  } catch (error) {
    console.error("获取配置失败:", error);
    return configManager.getDefaultConfig();
  }
});

ipcMain.handle("updateConfig", async (_, config: AppConfig) => {
  try {
    return await configManager.saveConfig(config);
  } catch (error) {
    console.error("保存配置失败:", error);
    return false;
  }
});

// 音效管理
ipcMain.handle("getAvailableSounds", async () => {
  try {
    return await soundManager.getAvailableSounds();
  } catch (error) {
    console.error("获取音效列表失败:", error);
    return [];
  }
});

ipcMain.handle("previewSound", async (_, soundId: string) => {
  try {
    return await soundManager.previewSound(soundId);
  } catch (error) {
    console.error("预览音效失败:", error);
    return false;
  }
});

ipcMain.handle("installSoundPack", async () => {
  try {
    if (!mainWindow) return { success: false };
    
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
      title: "选择音效包文件夹",
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false };
    }

    const sourceDir = result.filePaths[0];
    const installedCount = await soundManager.installSoundPack(sourceDir);
    
    return { 
      success: installedCount > 0, 
      installedCount 
    };
  } catch (error) {
    console.error("安装音效包失败:", error);
    return { success: false };
  }
});

// Hook管理
ipcMain.handle("applyConfiguration", async (_, config?: AppConfig) => {
  try {
    // 如果传入了配置，使用传入的配置；否则从存储中获取
    const finalConfig = config || await configManager.getConfig();
    return await hookManager.generateHookScripts(finalConfig);
  } catch (error) {
    console.error("应用配置失败:", error);
    return false;
  }
});

// 文件操作
ipcMain.handle("selectSoundFiles", async () => {
  try {
    if (!mainWindow) return null;

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openFile", "multiSelections"],
      title: "选择音效文件",
      filters: [
        { name: "音频文件", extensions: ["mp3", "wav", "aac", "ogg"] },
        { name: "所有文件", extensions: ["*"] },
      ],
    });

    if (result.canceled) {
      return null;
    }

    return result.filePaths;
  } catch (error) {
    console.error("选择音效文件失败:", error);
    return null;
  }
});

ipcMain.handle("openSoundsFolder", async () => {
  try {
    const soundsDir = soundManager.getSoundsDirectory();
    await shell.openPath(soundsDir);
    return true;
  } catch (error) {
    console.error("打开音效文件夹失败:", error);
    return false;
  }
});

// 应用关闭时的清理工作
app.on("before-quit", () => {
  // 停止所有正在播放的音效
  soundManager.stopAllSounds();
});