/**
 * RGB 값을 Hex 코드로 변환
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

/**
 * Hex 코드를 RGB 값으로 변환
 */
export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * 주어진 ImageData에서 특정 색상(HEX)과 정확히 일치하는 픽셀의 위치를 찾음
 * @param imageData 이미지 데이터
 * @param targetHex 찾을 HEX 색상 코드
 * @param restrictArea 검색 제한 영역 (x, y, width, height)
 * @returns 일치하는 픽셀의 좌표 배열 [{x, y}, ...]
 */
export function findExactColorMatch(
  imageData: ImageData,
  targetHex: string,
  restrictArea?: { x: number; y: number; width: number; height: number }
): Array<{ x: number; y: number }> {
  const matches: Array<{ x: number; y: number }> = [];
  const {
    r: targetR,
    g: targetG,
    b: targetB,
  } = hexToRgb(targetHex) || { r: 0, g: 0, b: 0 };

  if (!hexToRgb(targetHex)) return matches;

  const { width, height, data } = imageData;

  // 검색 영역 범위 설정
  const startX = restrictArea ? Math.max(0, restrictArea.x) : 0;
  const startY = restrictArea ? Math.max(0, restrictArea.y) : 0;
  const endX = restrictArea
    ? Math.min(width, restrictArea.x + restrictArea.width)
    : width;
  const endY = restrictArea
    ? Math.min(height, restrictArea.y + restrictArea.height)
    : height;

  // ImageData는 [R,G,B,A,R,G,B,A,...] 형태의 1차원 배열이므로 4바이트씩 처리
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];

      // 정확히 일치하는 색상만 찾음
      if (r === targetR && g === targetG && b === targetB) {
        matches.push({ x, y });
      }
    }
  }

  return matches;
}

/**
 * 이미지의 특정 위치(x, y)의 색상을 HEX 코드로 반환
 */
export function getPixelColor(
  imageData: ImageData,
  x: number,
  y: number
): string {
  if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) {
    return "#000000"; // 범위를 벗어나면 검은색 반환
  }

  const index = (y * imageData.width + x) * 4;
  const r = imageData.data[index];
  const g = imageData.data[index + 1];
  const b = imageData.data[index + 2];

  return rgbToHex(r, g, b);
}

/**
 * Canvas에 색상 매치 결과를 시각화 - 매칭된 픽셀만 깜빡이게 표시
 */
export function visualizeColorMatches(
  ctx: CanvasRenderingContext2D,
  matches: Array<{ x: number; y: number }>
): void {
  // 시간에 따라 깜빡이는 효과를 위한 계산
  const blinkSpeed = 100; // 밀리초 단위, 깜빡임 속도
  const now = Date.now();
  const isVisible = Math.floor(now / blinkSpeed) % 2 === 0; // 500ms마다 토글

  // 결과가 없으면 그냥 종료
  if (matches.length === 0) return;

  ctx.save();

  // 깜빡임 효과가 보이는 단계에서만 픽셀 표시
  if (isVisible) {
    // 매치된 각 픽셀 위치에 직접 색상 표시
    matches.forEach(({ x, y }) => {
      // 픽셀 강조를 위해 더 밝고 눈에 띄는 색상으로 픽셀 그리기
      ctx.fillStyle = "#FF00FF"; // 밝은 마젠타색 (눈에 잘 띔)

      // 정확한 픽셀 위치에 약간 확대된 픽셀 점 그리기 (너무 작으면 안 보임)
      ctx.fillRect(x - 1, y - 1, 3, 3);
    });
  }

  ctx.restore();
}
