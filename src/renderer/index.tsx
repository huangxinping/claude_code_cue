import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// 等待DOM加载完成
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("找不到根容器元素");
  }

  // 创建React根节点
  const root = createRoot(container);
  
  // 渲染应用
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

// 错误处理
window.addEventListener("error", (event) => {
  console.error("应用发生错误:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("未处理的Promise错误:", event.reason);
});

// 防止拖拽文件到窗口导致页面跳转
document.addEventListener("dragover", (e) => {
  e.preventDefault();
});

document.addEventListener("drop", (e) => {
  e.preventDefault();
});