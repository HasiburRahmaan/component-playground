import { useEffect, useRef, useState } from "react";
import Frame1 from "./asset/frame-1.png";
import Frame2 from "./asset/frame-2.png";
import Frame3 from "./asset/frame-3.png";

const CameraFilter = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [frameSrc, setFrameSrc] = useState<string>(Frame1);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  useEffect(() => {
    const checkCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === "videoinput");

        setHasMultipleCameras(videoDevices.length > 1);
      } catch (error) {
        console.error("Error checking cameras:", error);
      }
    };

    checkCameras();
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isFrontCamera]);
  const startCamera = async () => {
    const constraints = {
      video: {
        facingMode: isFrontCamera ? "user" : "environment",
      },
    };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;

    if (!videoWidth || !videoHeight) {
      console.warn("Video dimensions not available.");
      return;
    }

    // Ensure a square aspect ratio by taking the smaller side
    const size = Math.min(videoWidth, videoHeight);

    // Set canvas size to square
    canvasRef.current.width = size;
    canvasRef.current.height = size;

    // Calculate cropping positions
    const offsetX = (videoWidth - size) / 2;
    const offsetY = (videoHeight - size) / 2;

    // Draw only the square portion of the video
    context.drawImage(videoRef.current, offsetX, offsetY, size, size, 0, 0, size, size);

    // Overlay the frame (also scaled to the square)
    if (frameSrc) {
      const frameImage = new Image();
      frameImage.src = frameSrc;
      frameImage.onload = () => {
        context.drawImage(frameImage, 0, 0, size, size);
        setCapturedImage(canvasRef.current?.toDataURL("image/png") || null);
      };
    } else {
      setCapturedImage(canvasRef.current?.toDataURL("image/png") || null);
    }
  };

  const reset = () => {
    setCapturedImage(null)
    startCamera()
  }

  const downloadImage = () => {
    if (!capturedImage) return;

    const link = document.createElement("a");
    link.href = capturedImage;
    link.download = "captured-image.png"; // File name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {!capturedImage ? (
        <>
          <h1 className="text-2xl font-semibold mb-4">Camera Preview</h1>

          {/* Frame Selection */}
          <div className="my-4 mb-8 flex justify-center gap-4">
            {[Frame1, Frame2, Frame3].map((frame, index) => (
              <img
                key={index}
                src={frame}
                onClick={() => setFrameSrc(frame)}
                className={`cursor-pointer w-[100px] h-[100px] object-contain border-2 ${frameSrc === frame ? "border-blue-500" : "border-gray-300"
                  }`}
                alt={`Frame ${index + 1}`}
              />
            ))}
          </div>

          {/* Video Feed with Live Frame Overlay */}
          <div className="h-[350px] w-[350px] relative">
            <video ref={videoRef} className="w-full h-full object-cover rounded-[50%] shadow-lg bg-black" autoPlay playsInline />
            <img src={frameSrc} alt="Frame" className="absolute w-full h-full top-0 left-0 object-contain pointer-events-none" />
          </div>

          {/* Capture Button */}
          <div className="flex flex-wrap justify-center gap-4">
            {hasMultipleCameras && <button
              onClick={() => setIsFrontCamera(prev => !prev)}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg mt-4"
            >
              Flip Camera
            </button>}
            <button onClick={captureImage} className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4">
              Capture Image
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Display Captured Image */}
          <img src={capturedImage} alt="Captured" className="mt-4 border  w-[400px]  aspect-square" />

          {/* Reset Button */}
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 active:scale-95"
              onClick={downloadImage}
            >
              Download
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-lg mt-4 active:scale-95"
              onClick={reset}
            >
              Reset
            </button>
          </div>
        </>
      )}

      {/* Hidden Canvas for Capturing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraFilter;
