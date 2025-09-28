"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const DESIRED_CROP_ASPECT_RATIO = 3 / 2;
const CROP_SIZE_FACTOR = 0.4;

export default function CameraView() {
  const videoRef = useRef(null);
  const displayCroppedCanvasRef = useRef(null);
  const cropOverlayRef = useRef(null);
  const [error, setError] = useState(null);
  const [barcodeResult, setBarcodeResult] = useState(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    let intervalId = null;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            intervalId = setInterval(captureFrameAndCrop, 100);
          };
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("Unable to access the camera. Please check permissions.");
      }
    };

    const captureFrameAndCrop = () => {
      if (
        !videoRef.current ||
        !displayCroppedCanvasRef.current ||
        !cropOverlayRef.current
      )
        return;

      const video = videoRef.current;
      const displayCanvas = displayCroppedCanvasRef.current;
      const displayContext = displayCanvas.getContext("2d");

      if (!displayContext) return;

      const tempCanvas = document.createElement("canvas");
      const tempContext = tempCanvas.getContext("2d");
      if (!tempContext) return;

      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;
      tempContext.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

      let cropWidth, cropHeight;
      const videoRatio = video.videoWidth / video.videoHeight;

      if (videoRatio / DESIRED_CROP_ASPECT_RATIO > 1) {
        cropHeight = video.videoHeight * CROP_SIZE_FACTOR;
        cropWidth = cropHeight * DESIRED_CROP_ASPECT_RATIO;
      } else {
        cropWidth = video.videoWidth * CROP_SIZE_FACTOR;
        cropHeight = cropWidth / DESIRED_CROP_ASPECT_RATIO;
      }

      const MIN_CROP_WIDTH = 240;
      const MAX_CROP_WIDTH = 600;
      const MIN_CROP_HEIGHT = 80;
      const MAX_CROP_HEIGHT = 400;

      cropWidth = Math.max(MIN_CROP_WIDTH, Math.min(MAX_CROP_WIDTH, cropWidth));
      cropHeight = Math.max(
        MIN_CROP_HEIGHT,
        Math.min(MAX_CROP_HEIGHT, cropHeight),
      );

      const cropX = (video.videoWidth - cropWidth) / 2;
      const cropY = (video.videoHeight - cropHeight) / 2;

      displayCanvas.width = cropWidth;
      displayCanvas.height = cropHeight;

      displayContext.drawImage(
        tempCanvas,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight,
      );

      // Decode from the cropped canvas
      const decodeCanvas = async () => {
        try {
          const result =
            await codeReader.current.decodeFromCanvas(displayCanvas);
          console.log("Decoded barcode:", result.getText());
          setBarcodeResult(result.getText());
        } catch (err) {
          if (err instanceof Error && err.name !== "NotFoundException") {
            console.error("Decoding error:", err);
          }
        }
      };

      decodeCanvas();
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4 font-sans">
      <h2 className="text-2xl font-bold text-gray-800">
        Camera View for Barcode Scanning
      </h2>

      <div className="relative aspect-[3/2] w-full max-w-md overflow-hidden rounded-lg shadow-lg">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />

        {/* Scanning overlay */}
        <div
          ref={cropOverlayRef}
          className="pointer-events-none absolute animate-pulse overflow-hidden rounded-lg border-2 border-white"
        >
          {/* Scanning line */}
          <div className="animate-scan absolute top-0 left-0 h-[2px] w-full bg-white" />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <p className="text-center text-sm text-gray-600">
        The white box indicates the barcode scanning area.
      </p>

      <canvas
        ref={displayCroppedCanvasRef}
        className="hidden" // hide cropped debug canvas
      />

      <div className="rounded-lg border-2 border-dashed border-green-500 bg-green-50 p-4 text-center text-base font-medium text-green-800">
        ✅ Barcode: {barcodeResult ?? "No code detected yet"}
      </div>

      {/* Tailwind animation keyframes */}
      <style jsx>{`
        @keyframes scan {
          0% {
            top: 0%;
          }
          100% {
            top: 100%;
          }
        }
        .animate-scan {
          animation: scan 2s linear infinite alternate;
        }
      `}</style>
    </div>
  );
}

// "use client";

// import { useEffect, useRef, useState } from "react";
// import { BrowserMultiFormatReader } from "@zxing/browser";

// export default function CameraView() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [error, setError] = useState(null);
//   const [barcodeResult, setBarcodeResult] = useState(null);
//   const codeReader = useRef(new BrowserMultiFormatReader());

//   useEffect(() => {
//     let intervalId = null;

//     const startCamera = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { facingMode: { ideal: "environment" } },
//         });
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//           videoRef.current.onloadedmetadata = () => {
//             videoRef.current?.play();
//             intervalId = setInterval(captureFrame, 200);
//           };
//         }
//       } catch (err) {
//         console.error("Camera error:", err);
//         setError("Unable to access the camera. Please check permissions.");
//       }
//     };

//     const captureFrame = async () => {
//       if (!videoRef.current || !canvasRef.current) return;

//       const video = videoRef.current;
//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext("2d");

//       // Match canvas size to scanning box size (fixed ~300x150)
//       const cropWidth = 300;
//       const cropHeight = 150;

//       canvas.width = cropWidth;
//       canvas.height = cropHeight;

//       // Copy the center portion of the video into the canvas
//       const sx = (video.videoWidth - cropWidth) / 2;
//       const sy = (video.videoHeight - cropHeight) / 2;

//       ctx.drawImage(
//         video,
//         sx,
//         sy,
//         cropWidth,
//         cropHeight,
//         0,
//         0,
//         cropWidth,
//         cropHeight,
//       );

//       try {
//         const result = await codeReader.current.decodeFromCanvas(canvas);
//         setBarcodeResult(result.getText());
//       } catch (err) {
//         if (err instanceof Error && err.name !== "NotFoundException") {
//           console.error("Decoding error:", err);
//         }
//       }
//     };

//     startCamera();

//     return () => {
//       if (videoRef.current?.srcObject) {
//         const tracks = videoRef.current.srcObject.getTracks();
//         tracks.forEach((track) => track.stop());
//       }
//       if (intervalId) clearInterval(intervalId);
//     };
//   }, []);

//   return (
//     <div className="flex flex-col items-center space-y-4 font-sans">
//       <h2 className="text-2xl font-bold text-gray-800">
//         Camera View for Barcode Scanning
//       </h2>

//       <div className="relative aspect-[3/2] w-full max-w-md overflow-hidden rounded-lg shadow-lg">
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           muted
//           className="h-full w-full object-cover"
//         />

//         {/* Overlay scanning box */}
//         <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
//           <div className="relative h-[150px] w-[300px] rounded-lg border-2 border-white">
//             {/* Scanning line */}
//             <div className="animate-scan absolute top-0 left-0 h-[2px] w-full bg-white" />
//           </div>
//         </div>
//       </div>

//       {error && <p className="text-sm text-red-500">{error}</p>}

//       <div className="rounded-lg border-2 border-dashed border-green-500 bg-green-50 p-4 text-center text-base font-medium text-green-800">
//         ✅ Barcode: {barcodeResult ?? "No code detected yet"}
//       </div>

//       {/* Hidden canvas only for decoding */}
//       <canvas ref={canvasRef} className="hidden" />

//       {/* Tailwind custom animation */}
//       <style jsx>{`
//         @keyframes scan {
//           0% {
//             top: 0%;
//           }
//           100% {
//             top: 100%;
//           }
//         }
//         .animate-scan {
//           animation: scan 2s linear infinite alternate;
//         }
//       `}</style>
//     </div>
//   );
// }
