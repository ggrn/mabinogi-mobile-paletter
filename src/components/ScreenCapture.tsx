import { useEffect, useState, useRef } from 'react';
import type { MouseEvent } from 'react';
import { useScreenCapture } from '../hooks/useScreenCapture';
import { useColorStore } from '../store/useColorStore';
import { findExactColorMatch, visualizeColorMatches } from '../utils/colorUtils';

interface SelectionArea {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  width: number;
  height: number;
}

export const ScreenCapture = () => {
  const { videoRef, isCapturing, error, startCapture, stopCapture } = useScreenCapture();
  const { currentColor } = useColorStore();
  const [matchCount, setMatchCount] = useState(0);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const processingCanvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // 영역 선택 관련 상태
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionArea, setSelectionArea] = useState<SelectionArea | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 화면 캡처 시작 핸들러
  const handleStartCapture = async () => {
    await startCapture();
  };

  // 화면 캡처 정지 핸들러
  const handleStopCapture = () => {
    stopCapture();
    setMatchCount(0);
    setSelectionArea(null);
    setIsSelecting(false);
  };

  // 영역 선택 시작
  const handleAreaSelection = () => {
    setIsSelecting(true);
    setSelectionArea(null);
  };

  // 영역 선택 취소
  const handleCancelSelection = () => {
    setIsSelecting(false);
    setSelectionArea(null);
  };

  // 마우스 다운 이벤트 핸들러
  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting || !displayCanvasRef.current) return;

    const canvas = displayCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsDragging(true);
    setDragStart({ x, y });
  };

  // 마우스 이동 이벤트 핸들러
  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !isSelecting || !displayCanvasRef.current) return;

    const canvas = displayCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // 영역 계산
    const startX = Math.min(dragStart.x, x);
    const startY = Math.min(dragStart.y, y);
    const endX = Math.max(dragStart.x, x);
    const endY = Math.max(dragStart.y, y);
    const width = endX - startX;
    const height = endY - startY;

    setSelectionArea({ startX, startY, endX, endY, width, height });
  };

  // 마우스 업 이벤트 핸들러
  const handleMouseUp = () => {
    if (!isDragging) return;

    setIsDragging(false);
    setIsSelecting(false);
  };

  // 마우스 캔버스 이탈 핸들러
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  // 색상 매칭 및 표시 처리
  useEffect(() => {
    if (!isCapturing || !videoRef.current || !displayCanvasRef.current || !processingCanvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const displayCanvas = displayCanvasRef.current;
    const processingCanvas = processingCanvasRef.current;
    const displayCtx = displayCanvas.getContext('2d');
    const processingCtx = processingCanvas.getContext('2d');

    if (!displayCtx || !processingCtx) return;

    // 프레임 처리 함수
    const processFrame = () => {
      if (!video || !displayCanvas || !processingCanvas || !displayCtx || !processingCtx || !isCapturing) {
        return;
      }

      // 캔버스 크기 조정
      if (displayCanvas.width !== video.videoWidth || displayCanvas.height !== video.videoHeight) {
        displayCanvas.width = video.videoWidth;
        displayCanvas.height = video.videoHeight;
        processingCanvas.width = video.videoWidth;
        processingCanvas.height = video.videoHeight;
      }

      // 프로세싱 캔버스에 비디오 프레임 그리기
      processingCtx.drawImage(video, 0, 0, processingCanvas.width, processingCanvas.height);

      // 이미지 데이터 가져오기
      const imageData = processingCtx.getImageData(0, 0, processingCanvas.width, processingCanvas.height);

      // 색상 매칭 수행 (선택 영역이 있으면 그 영역 내에서만 검색)
      const matches = findExactColorMatch(
        imageData,
        currentColor,
        selectionArea ? {
          x: Math.floor(selectionArea.startX),
          y: Math.floor(selectionArea.startY),
          width: Math.ceil(selectionArea.width),
          height: Math.ceil(selectionArea.height)
        } : undefined
      );

      setMatchCount(matches.length);

      // 화면에 표시할 캔버스에 비디오 프레임 그리기
      displayCtx.drawImage(video, 0, 0, displayCanvas.width, displayCanvas.height);

      // 선택 영역 표시
      if (selectionArea) {
        displayCtx.save();

        // 선택 영역 외부를 어둡게 처리 (더 나은 방법으로 처리)
        // 전체 캔버스를 덮는 반투명 레이어 대신 4개의 사각형으로 선택 영역 외부만 어둡게 처리
        const { startX, startY, width, height } = selectionArea;

        // 위쪽 영역
        displayCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        displayCtx.fillRect(0, 0, displayCanvas.width, startY);

        // 아래쪽 영역
        displayCtx.fillRect(0, startY + height, displayCanvas.width, displayCanvas.height - (startY + height));

        // 왼쪽 영역
        displayCtx.fillRect(0, startY, startX, height);

        // 오른쪽 영역
        displayCtx.fillRect(startX + width, startY, displayCanvas.width - (startX + width), height);

        // 선택 영역 테두리
        displayCtx.strokeStyle = '#00FFFF';
        displayCtx.lineWidth = 2;
        displayCtx.strokeRect(
          selectionArea.startX,
          selectionArea.startY,
          selectionArea.width,
          selectionArea.height
        );

        displayCtx.restore();
      }

      // 영역 선택 중인 경우 선택 영역 표시
      if (isDragging && isSelecting && selectionArea) {
        displayCtx.save();
        displayCtx.strokeStyle = '#FFFF00';
        displayCtx.lineWidth = 2;
        displayCtx.strokeRect(
          selectionArea.startX,
          selectionArea.startY,
          selectionArea.width,
          selectionArea.height
        );
        displayCtx.restore();
      }

      // 매치 결과 시각화
      if (matches.length > 0) {
        visualizeColorMatches(displayCtx, matches);
      }

      // 다음 프레임 요청
      animFrameRef.current = requestAnimationFrame(processFrame);
    };

    // 프레임 처리 시작
    animFrameRef.current = requestAnimationFrame(processFrame);

    // 클린업 함수
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isCapturing, currentColor, videoRef, selectionArea, isDragging, isSelecting]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-4xl bg-gray-800 rounded-lg overflow-hidden shadow-lg">
        {/* 표시용 캔버스 */}
        <canvas
          ref={displayCanvasRef}
          className="w-full h-auto"
          style={{ maxHeight: '70vh', objectFit: 'contain', cursor: isSelecting ? 'crosshair' : 'default' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />

        {/* 처리용 캔버스는 화면에 표시하지 않음 */}
        <canvas ref={processingCanvasRef} className="hidden" />

        {/* 비디오 요소는 화면에 표시하지 않음 */}
        <video ref={videoRef} className="hidden" />
      </div>

      <div className="flex justify-center gap-4">
        {!isCapturing ? (
          <button
            onClick={handleStartCapture}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            화면 공유 시작
          </button>
        ) : (
          <>
            <button
              onClick={handleStopCapture}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              화면 공유 종료
            </button>

            {!isSelecting && !selectionArea ? (
              <button
                onClick={handleAreaSelection}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                영역 선택하기
              </button>
            ) : isSelecting && !selectionArea ? (
              <button
                onClick={handleCancelSelection}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                선택 취소
              </button>
            ) : (
              <button
                onClick={handleCancelSelection}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
              >
                영역 재설정
              </button>
            )}
          </>
        )}
      </div>

      {isCapturing && (
        <div className="flex flex-col items-center">
          <p className="text-lg">
            현재 색상: <span style={{ color: currentColor }}>{currentColor}</span>
          </p>
          <p className="text-lg">
            찾은 색상 수: <span className="font-bold">{matchCount}</span>
          </p>
          {selectionArea && (
            <p className="text-sm text-gray-600">
              선택 영역: {Math.round(selectionArea.startX)}x{Math.round(selectionArea.startY)} ~ {Math.round(selectionArea.endX)}x{Math.round(selectionArea.endY)} (크기: {Math.round(selectionArea.width)}x{Math.round(selectionArea.height)})
            </p>
          )}
          {isSelecting && !selectionArea && (
            <p className="text-sm text-blue-600 animate-pulse">
              캔버스에서 드래그하여 검색할 영역을 선택하세요
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}; 