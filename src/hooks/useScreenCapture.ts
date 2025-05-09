import { useState, useRef, useCallback, useEffect } from "react";

interface ScreenCaptureState {
  isCapturing: boolean;
  videoStream: MediaStream | null;
  error: string | null;
}

export function useScreenCapture() {
  const [state, setState] = useState<ScreenCaptureState>({
    isCapturing: false,
    videoStream: null,
    error: null,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameIdRef = useRef<number | null>(null);

  // 화면 공유 시작
  const startCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      setState((prevState) => ({
        ...prevState,
        isCapturing: true,
        videoStream: stream,
        error: null,
      }));

      // 비디오 스트림 설정
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
          }
        };
      }

      // 스트림 종료 감지
      stream.getVideoTracks()[0].onended = () => {
        stopCapture();
      };
    } catch (err) {
      setState((prevState) => ({
        ...prevState,
        isCapturing: false,
        videoStream: null,
        error:
          "화면 공유를 시작할 수 없습니다: " +
          (err instanceof Error ? err.message : String(err)),
      }));
    }
  }, []);

  // 화면 공유 중지
  const stopCapture = useCallback(() => {
    if (state.videoStream) {
      state.videoStream.getTracks().forEach((track) => track.stop());
    }

    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = null;
    }

    setState({
      isCapturing: false,
      videoStream: null,
      error: null,
    });

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [state.videoStream]);

  // 프레임 처리 시작
  const startFrameProcessing = useCallback(
    (callback: (imageData: ImageData) => void) => {
      if (!videoRef.current || !canvasRef.current || !state.isCapturing) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      const processFrame = () => {
        if (!video || !canvas || !ctx || !state.isCapturing) return;

        // 캔버스 크기 조정
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // 비디오 프레임 그리기
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 이미지 데이터 가져오기
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // 콜백으로 이미지 데이터 전달
        callback(imageData);

        // 다음 프레임 요청
        frameIdRef.current = requestAnimationFrame(processFrame);
      };

      frameIdRef.current = requestAnimationFrame(processFrame);

      return () => {
        if (frameIdRef.current) {
          cancelAnimationFrame(frameIdRef.current);
          frameIdRef.current = null;
        }
      };
    },
    [state.isCapturing]
  );

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (state.videoStream) {
        state.videoStream.getTracks().forEach((track) => track.stop());
      }

      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [state.videoStream]);

  return {
    videoRef,
    canvasRef,
    isCapturing: state.isCapturing,
    error: state.error,
    startCapture,
    stopCapture,
    startFrameProcessing,
  };
}
