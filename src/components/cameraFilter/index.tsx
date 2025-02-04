import { useEffect, useRef, useState } from "react"
import Frame1 from './asset/frame.png'

const CameraFilter = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  // @ts-ignore
  const [frameSrc, setFrameSrc] = useState<string | null>(Frame1);
  useEffect(() => {

    const startCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      try {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }

    }
    startCamera()

    return () => {
      if (videoRef?.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }

  }, []);

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    // Draw the captured image
    context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

    // Load and overlay the PNG frame
    const frameImage = new Image();
    frameImage.src = Frame1;
    frameImage.onload = () => {
      context.drawImage(frameImage, 0, 0, videoWidth, videoHeight);
      if (canvasRef.current) {
        setCapturedImage(canvasRef.current.toDataURL("image/png"));
      }
    };
  };

  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-semibold mb-4">Camera Preview</h1>
        <div className="w-[200px] h-[300px] relative">
          <video
            ref={videoRef}
            className="w-full max-w-md rounded-lg shadow-lg bg-black"
            autoPlay
            playsInline
          ></video>
          {
            frameSrc && <img src={frameSrc} alt="Frame" className="absolute w-full h-full top-0 left-0 object-cover pointer-events-none" />
          }
        </div>

        <button onClick={captureImage} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          Capture Image
        </button>
        <canvas ref={canvasRef} className="hidden" />
        {capturedImage && <img src={capturedImage} alt="Captured" className="mt-4 border rounded-lg w-[300px]" />}
      </div>
    </div>
  )
}

export default CameraFilter