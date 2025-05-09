import { useState, useEffect } from 'react';
import { useColorStore } from '../store/useColorStore';

interface ColorInputProps {
  onColorChange?: (color: string) => void;
}

export const ColorInput = ({ onColorChange }: ColorInputProps) => {
  const { currentColor, setCurrentColor, addToHistory } = useColorStore();
  const [inputValue, setInputValue] = useState(currentColor);
  const [isValid, setIsValid] = useState(true);

  // 입력값 변경 시 유효성 검사
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // HEX 색상 유효성 검사 (#RRGGBB 형식)
    const isValidHex = /^#[0-9A-F]{6}$/i.test(value);
    setIsValid(isValidHex);
  };

  // 입력 적용
  const handleApply = () => {
    if (isValid) {
      setCurrentColor(inputValue);
      addToHistory(inputValue);
      onColorChange?.(inputValue);
    }
  };

  // Enter 키로 적용
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      handleApply();
    }
  };

  // 스토어의 currentColor가 변경될 때 입력값 동기화
  useEffect(() => {
    setInputValue(currentColor);
  }, [currentColor]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={`px-3 py-2 border ${isValid ? 'border-gray-300' : 'border-red-500'
            } rounded-md w-36`}
          placeholder="#FF0000"
        />

        <button
          onClick={handleApply}
          disabled={!isValid}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          적용
        </button>

        <div
          className="w-8 h-8 rounded-md border border-gray-300"
          style={{ backgroundColor: isValid ? inputValue : '#CCCCCC' }}
        />
      </div>

      {!isValid && (
        <p className="text-red-500 text-sm">
          유효한 HEX 색상 코드를 입력하세요 (예: #FF0000)
        </p>
      )}
    </div>
  );
}; 