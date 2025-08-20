import React, { useState } from "react";
import { HookEvent, SoundEffect, HookSoundConfig } from "../../shared/types";
import SoundSelector from "./SoundSelector";

interface SettingsModalProps {
  hookEvent: HookEvent;
  hookConfig?: HookSoundConfig;
  availableSounds: SoundEffect[];
  onSave: (config: HookSoundConfig | null) => void;
  onClose: () => void;
  onPreviewSound: (soundId: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  hookEvent,
  hookConfig,
  availableSounds,
  onSave,
  onClose,
  onPreviewSound,
}) => {
  const [localConfig, setLocalConfig] = useState<HookSoundConfig>({
    hookEventId: hookEvent.id,
    activeSoundId: hookConfig?.activeSoundId || "",
  });

  const [isDirty, setIsDirty] = useState(false);

  const handleSoundSelect = (soundId: string | null) => {
    setLocalConfig({
      ...localConfig,
      activeSoundId: soundId || "",
    });
    setIsDirty(true);
  };



  const handleSave = () => {
    if (localConfig.activeSoundId === "") {
      // 如果没有选择音效，则删除配置
      onSave(null);
    } else {
      onSave(localConfig);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (confirm("有未保存的更改，确定要放弃修改吗？")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const selectedSound = localConfig.activeSoundId 
    ? availableSounds.find(s => s.id === localConfig.activeSoundId)
    : null;

  return (
    <div className="modal-overlay">
      <div className="modal-dialog settings-modal">
        <div className="modal-header">
          <h2>配置 {hookEvent.name}</h2>
          <button className="close-btn" onClick={handleCancel}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Hook事件信息 */}
          <div className="hook-info-section">
            <h3>事件信息</h3>
            <div className="info-item">
              <span className="info-label">事件名称:</span>
              <span className="info-value">{hookEvent.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">事件描述:</span>
              <span className="info-value">{hookEvent.description}</span>
            </div>
            <div className="info-item">
              <span className="info-label">事件ID:</span>
              <span className="info-value code">{hookEvent.id}</span>
            </div>
          </div>

          {/* 配置选项 */}
          <div className="config-section">
            <h3>音效配置</h3>
            


            {/* 音效选择 */}
            <div className="config-item">
              <label className="config-label">
                <span className="label-text">选择音效</span>
                <SoundSelector
                  selectedSoundId={localConfig.activeSoundId || null}
                  availableSounds={availableSounds}
                  onSoundSelect={handleSoundSelect}
                  onPreviewSound={onPreviewSound}
                  placeholder="选择音效文件..."
                />
              </label>
            </div>

            {/* 当前选择的音效信息 */}
            {selectedSound && (
              <div className="selected-sound-info">
                <h4>当前选择的音效</h4>
                <div className="sound-details">
                  <div className="detail-item">
                    <span className="detail-label">名称:</span>
                    <span className="detail-value">{selectedSound.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">分类:</span>
                    <span className="detail-value">{selectedSound.category}</span>
                  </div>
                  {selectedSound.description && (
                    <div className="detail-item">
                      <span className="detail-label">描述:</span>
                      <span className="detail-value">{selectedSound.description}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">文件:</span>
                    <span className="detail-value code">{selectedSound.filename}</span>
                  </div>
                  <div className="preview-section">
                    <button
                      className="preview-btn large"
                      onClick={() => onPreviewSound(selectedSound.id)}
                    >
                      🔔 预览音效
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>


        </div>

        <div className="modal-footer">
          <div className="button-group">
            <button 
              className="btn secondary" 
              onClick={handleCancel}
            >
              取消
            </button>
            <button 
              className="btn primary" 
              onClick={handleSave}
              disabled={!isDirty && localConfig.activeSoundId === (hookConfig?.activeSoundId || "")}
            >
              保存配置
            </button>
          </div>
          {isDirty && (
            <div className="save-hint">
              <small>有未保存的更改</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;