import { useState } from 'react';
import { useColorStore } from '../store/useColorStore';

export const ColorHistory = () => {
  const { colorHistory, colorPresets, setCurrentColor, clearHistory, removePreset, savePreset } = useColorStore();
  const [presetName, setPresetName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // 색상 선택 핸들러
  const handleColorSelect = (color: string) => {
    setCurrentColor(color);
  };

  // 프리셋 저장 핸들러
  const handleSavePreset = () => {
    if (selectedColor && presetName.trim()) {
      savePreset(presetName, selectedColor);
      setPresetName('');
      setSelectedColor('');
    }
  };

  // 프리셋 삭제 핸들러
  const handleRemovePreset = (name: string) => {
    removePreset(name);
  };

  return (
    <div className="space-y-4">
      {/* 히스토리 섹션 */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-medium">최근 사용 색상</h2>
          {colorHistory.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-sm text-red-500 hover:text-red-700"
            >
              초기화
            </button>
          )}
        </div>

        {colorHistory.length === 0 ? (
          <p className="text-gray-500 text-sm">최근 사용한 색상이 없습니다.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {colorHistory.map((color, index) => (
              <button
                key={index}
                onClick={() => handleColorSelect(color)}
                className="w-8 h-8 rounded-md border border-gray-300 hover:border-blue-500 transition-colors"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        )}
      </section>

      {/* 프리셋 섹션 */}
      <section>
        <h2 className="text-lg font-medium mb-2">색상 프리셋</h2>

        {/* 프리셋 저장 UI */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md flex-grow"
            placeholder="프리셋 이름"
          />

          <div
            className={`w-8 h-8 rounded-md border border-gray-300 ${!selectedColor && 'bg-gray-200'}`}
            style={selectedColor ? { backgroundColor: selectedColor } : {}}
            onClick={() => setSelectedColor(colorHistory[0] || '#FF0000')}
            title="색상 선택 (최근 색상 사용)"
          />

          <button
            onClick={handleSavePreset}
            disabled={!presetName.trim() || !selectedColor}
            className="px-3 py-2 bg-green-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            저장
          </button>
        </div>

        {/* 프리셋 목록 */}
        {Object.keys(colorPresets).length === 0 ? (
          <p className="text-gray-500 text-sm">저장된 프리셋이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(colorPresets).map(([name, color]) => (
              <div key={name} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-md border border-gray-300"
                  style={{ backgroundColor: color }}
                />

                <span className="flex-grow text-sm">{name}</span>

                <button
                  onClick={() => handleColorSelect(color)}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded-md"
                >
                  사용
                </button>

                <button
                  onClick={() => handleRemovePreset(name)}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded-md"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}; 