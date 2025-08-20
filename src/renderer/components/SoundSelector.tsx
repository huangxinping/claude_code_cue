import React, { useState } from "react";
import { SoundEffect } from "../../shared/types";

interface SoundSelectorProps {
  selectedSoundId?: string | null;
  availableSounds: SoundEffect[];
  onSoundSelect: (soundId: string | null) => void;
  onPreviewSound: (soundId: string) => void;
  placeholder?: string;
}

const SoundSelector: React.FC<SoundSelectorProps> = ({
  selectedSoundId,
  availableSounds,
  onSoundSelect,
  onPreviewSound,
  placeholder = "选择音效...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 按分类分组音效
  const soundsByCategory = availableSounds.reduce((acc, sound) => {
    const category = sound.category || "其他";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(sound);
    return acc;
  }, {} as Record<string, SoundEffect[]>);

  // 过滤音效
  const filteredSounds = availableSounds.filter(sound =>
    sound.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sound.category && sound.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedSound = selectedSoundId 
    ? availableSounds.find(s => s.id === selectedSoundId)
    : null;

  const handleSoundSelect = (soundId: string | null) => {
    onSoundSelect(soundId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handlePreviewClick = (e: React.MouseEvent, soundId: string) => {
    e.stopPropagation();
    onPreviewSound(soundId);
  };

  return (
    <div className="sound-selector">
      <div 
        className={`selector-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="selected-text">
          {selectedSound ? selectedSound.name : placeholder}
        </span>
        <span className="dropdown-arrow">▼</span>
      </div>

      {isOpen && (
        <div className="selector-dropdown">
          <div className="dropdown-header">
            <input
              type="text"
              placeholder="搜索音效..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              autoFocus
            />
          </div>

          <div className="dropdown-content">
            {/* 无音效选项 */}
            <div 
              className={`sound-option no-sound ${!selectedSoundId ? 'selected' : ''}`}
              onClick={() => handleSoundSelect(null)}
            >
              <span className="sound-name">无音效</span>
            </div>

            {/* 分类显示音效 */}
            {searchTerm ? (
              // 搜索模式：显示过滤后的音效
              <div className="search-results">
                {filteredSounds.length > 0 ? (
                  filteredSounds.map((sound) => (
                    <div
                      key={sound.id}
                      className={`sound-option ${selectedSoundId === sound.id ? 'selected' : ''}`}
                      onClick={() => handleSoundSelect(sound.id)}
                    >
                      <div className="sound-info">
                        <span className="sound-name">{sound.name}</span>
                        <span className="sound-category">{sound.category}</span>
                      </div>
                      <button
                        className="preview-btn"
                        onClick={(e) => handlePreviewClick(e, sound.id)}
                        title="预览"
                      >
                        ▶️
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="no-results">没有找到匹配的音效</div>
                )}
              </div>
            ) : (
              // 正常模式：按分类显示
              <div className="category-results">
                {Object.entries(soundsByCategory).map(([category, sounds]) => (
                  <div key={category} className="sound-category-group">
                    <div className="category-header">{category}</div>
                    {sounds.map((sound) => (
                      <div
                        key={sound.id}
                        className={`sound-option ${selectedSoundId === sound.id ? 'selected' : ''}`}
                        onClick={() => handleSoundSelect(sound.id)}
                      >
                        <div className="sound-info">
                          <span className="sound-name">{sound.name}</span>
                          {sound.description && (
                            <span className="sound-description">{sound.description}</span>
                          )}
                        </div>
                        <button
                          className="preview-btn"
                          onClick={(e) => handlePreviewClick(e, sound.id)}
                          title="预览"
                        >
                          ▶️
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 点击外部关闭下拉框 */}
      {isOpen && (
        <div 
          className="dropdown-overlay" 
          onClick={() => {
            setIsOpen(false);
            setSearchTerm("");
          }}
        />
      )}
    </div>
  );
};

export default SoundSelector;