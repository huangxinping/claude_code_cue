import React from "react";
import { HookEvent, SoundEffect, HookSoundConfig } from "../../shared/types";
import SoundSelector from "./SoundSelector";

interface HookEventListProps {
  hookEvents: HookEvent[];
  hookConfigs: Record<string, HookSoundConfig>;
  availableSounds: SoundEffect[];
  onSoundSelect: (hookEventId: string, soundEffectId: string | null) => void;
  onPreviewSound: (soundId: string) => void;
  onOpenSettings: (hookEvent: HookEvent) => void;
}

const HookEventList: React.FC<HookEventListProps> = ({
  hookEvents,
  hookConfigs,
  availableSounds,
  onSoundSelect,
  onPreviewSound,
  onOpenSettings,
}) => {
  return (
    <div className="hook-event-list">
      {hookEvents.map((hookEvent) => {
        const config = hookConfigs[hookEvent.id];
        const activeSoundId = config?.activeSoundId;
        const activeSound = activeSoundId 
          ? availableSounds.find(s => s.id === activeSoundId)
          : null;

        return (
          <div 
            key={hookEvent.id} 
            className="hook-event-item"
          >
            <div className="hook-event-info">
              <div className="hook-event-header">
                <h3 className="hook-event-name">{hookEvent.name}</h3>
                <div className="hook-event-controls">
                  <button
                    className="settings-btn"
                    onClick={() => onOpenSettings(hookEvent)}
                    title="详细设置"
                  >
                    设置
                  </button>
                </div>
              </div>
              <p className="hook-event-description">{hookEvent.description}</p>
            </div>

            <div className="hook-event-sound">
              <div className="sound-status">
                {activeSound ? (
                  <div className="active-sound">
                    <span className="sound-name">{activeSound.name}</span>
                    <span className="sound-category">{activeSound.category}</span>
                    <button
                      className="preview-btn"
                      onClick={() => onPreviewSound(activeSound.id)}
                      title="预览音效"
                    >
                      ▶️
                    </button>
                  </div>
                ) : (
                  <span className="no-sound">未设置音效</span>
                )}
              </div>

              <SoundSelector
                selectedSoundId={activeSoundId}
                availableSounds={availableSounds}
                onSoundSelect={(soundId) => onSoundSelect(hookEvent.id, soundId)}
                onPreviewSound={onPreviewSound}
                placeholder="选择音效..."
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HookEventList;