"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const DESIRED_CROP_ASPECT_RATIO = 3 / 2;
const CROP_SIZE_FACTOR = 0.4;

export default function BarCodeScanner() {
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
            videoRef.current.play();
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
      const overlayDiv = cropOverlayRef.current;

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

      cropWidth = Math.min(cropWidth, video.videoWidth);
      cropHeight = Math.min(cropHeight, video.videoHeight);

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

      overlayDiv.style.position = "absolute";
      overlayDiv.style.left = `${(cropX / video.videoWidth) * 100}%`;
      overlayDiv.style.top = `${(cropY / video.videoHeight) * 100}%`;
      overlayDiv.style.width = `${(cropWidth / video.videoWidth) * 100}%`;
      overlayDiv.style.height = `${(cropHeight / video.videoHeight) * 100}%`;
      overlayDiv.style.border = "2px solid white";
      overlayDiv.style.borderRadius = "0.5rem";
      overlayDiv.style.pointerEvents = "none";
      overlayDiv.style.boxSizing = "border-box";

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
    <div className="flex flex-col items-center font-sans">
      <h2 className="mb-4 text-xl font-bold text-gray-800">
        Camera View for Barcode Scanning
      </h2>

      <div className="relative w-full max-w-md overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
        <div ref={cropOverlayRef}></div>
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <p className="mt-2 text-center text-sm text-gray-600">
        Camera active. The white border indicates the barcode scanning area.
      </p>

      <h3 className="mt-6 mb-2 text-lg font-semibold text-gray-800">
        Cropped Barcode Scan Area:
      </h3>

      <canvas
        ref={displayCroppedCanvasRef}
        className="block h-auto min-h-[80px] max-w-full min-w-[240px] rounded-md border-2 border-blue-500 shadow-md"
      >
        Your browser does not support the canvas element.
      </canvas>

      <p className="mt-2 text-xs text-gray-400">
        This canvas updates every 0.1 seconds with the focused area.
      </p>

      <div className="mt-4 mb-8 w-full max-w-md rounded-md border-2 border-dashed border-emerald-500 bg-emerald-50 p-4 text-center text-base font-medium text-emerald-900">
        ✅ Barcode: {barcodeResult}
      </div>
    </div>
  );
}

// "use client";

// import { useEffect, useRef, useState } from "react";
// import { BrowserMultiFormatReader } from "@zxing/browser";

// // Aspect ratio and crop size factor
// const DESIRED_CROP_ASPECT_RATIO = 3 / 2;
// const CROP_SIZE_FACTOR = 0.4;

// export default function BarCodeScanner() {
//   const videoRef = useRef(null);
//   const displayCroppedCanvasRef = useRef(null);
//   const cropOverlayRef = useRef(null);
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
//             intervalId = setInterval(captureFrameAndCrop, 100);
//           };
//         }
//       } catch (err) {
//         console.error("Camera error:", err);
//         setError("Unable to access the camera. Please check permissions.");
//       }
//     };

//     const captureFrameAndCrop = () => {
//       if (
//         !videoRef.current ||
//         !displayCroppedCanvasRef.current ||
//         !cropOverlayRef.current
//       )
//         return;

//       const video = videoRef.current;
//       const displayCanvas = displayCroppedCanvasRef.current;
//       const displayContext = displayCanvas.getContext("2d");
//       const overlayDiv = cropOverlayRef.current;

//       if (!displayContext) return;

//       const tempCanvas = document.createElement("canvas");
//       const tempContext = tempCanvas.getContext("2d");
//       if (!tempContext) return;

//       tempCanvas.width = video.videoWidth;
//       tempCanvas.height = video.videoHeight;
//       tempContext.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

//       let cropWidth, cropHeight;
//       const videoRatio = video.videoWidth / video.videoHeight;

//       if (videoRatio / DESIRED_CROP_ASPECT_RATIO > 1) {
//         cropHeight = video.videoHeight * CROP_SIZE_FACTOR;
//         cropWidth = cropHeight * DESIRED_CROP_ASPECT_RATIO;
//       } else {
//         cropWidth = video.videoWidth * CROP_SIZE_FACTOR;
//         cropHeight = cropWidth / DESIRED_CROP_ASPECT_RATIO;
//       }

//       cropWidth = Math.min(cropWidth, video.videoWidth);
//       cropHeight = Math.min(cropHeight, video.videoHeight);

//       const MIN_CROP_WIDTH = 240;
//       const MAX_CROP_WIDTH = 600;
//       const MIN_CROP_HEIGHT = 80;
//       const MAX_CROP_HEIGHT = 400;

//       cropWidth = Math.max(MIN_CROP_WIDTH, Math.min(MAX_CROP_WIDTH, cropWidth));
//       cropHeight = Math.max(
//         MIN_CROP_HEIGHT,
//         Math.min(MAX_CROP_HEIGHT, cropHeight),
//       );

//       const cropX = (video.videoWidth - cropWidth) / 2;
//       const cropY = (video.videoHeight - cropHeight) / 2;

//       displayCanvas.width = cropWidth;
//       displayCanvas.height = cropHeight;

//       displayContext.drawImage(
//         tempCanvas,
//         cropX,
//         cropY,
//         cropWidth,
//         cropHeight,
//         0,
//         0,
//         cropWidth,
//         cropHeight,
//       );

//       overlayDiv.style.position = "absolute";
//       overlayDiv.style.left = `${(cropX / video.videoWidth) * 100}%`;
//       overlayDiv.style.top = `${(cropY / video.videoHeight) * 100}%`;
//       overlayDiv.style.width = `${(cropWidth / video.videoWidth) * 100}%`;
//       overlayDiv.style.height = `${(cropHeight / video.videoHeight) * 100}%`;
//       overlayDiv.className =
//         "border-2 border-white rounded-lg pointer-events-none box-border";

//       const decodeCanvas = async () => {
//         try {
//           const result =
//             await codeReader.current.decodeFromCanvas(displayCanvas);
//           console.log("Decoded barcode:", result.getText());
//           setBarcodeResult(result.getText());
//         } catch (err) {
//           if (err instanceof Error && err.name !== "NotFoundException") {
//             console.error("Decoding error:", err);
//           }
//         }
//       };

//       decodeCanvas();
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
//     <div className="flex flex-col items-center font-sans">
//       <h2 className="text-2xl font-bold text-gray-800">
//         Camera View for Barcode Scanning
//       </h2>

//       <div className="relative w-full max-w-md overflow-hidden">
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           muted
//           className="h-full w-full object-cover"
//         />
//         <div ref={cropOverlayRef}></div>
//       </div>

//       {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

//       <p className="text-center text-sm text-gray-600">
//         Camera active. The white border indicates the barcode scanning area.
//       </p>

//       <h3 className="text-xl font-semibold text-gray-800">
//         Cropped Barcode Scan Area:
//       </h3>

//       <canvas
//         ref={displayCroppedCanvasRef}
//         className="block h-auto min-h-[80px] w-full min-w-[240px] rounded-lg border-2 border-blue-500 shadow-md"
//       >
//         Your browser does not support the canvas element.
//       </canvas>

//       <p className="text-xs text-gray-400">
//         This canvas updates every 0.1 seconds with the focused area.
//       </p>

//       <div className="rounded-lg border-2 border-dashed border-green-500 bg-green-50 p-4 text-center text-base font-medium text-green-800">
//         ✅ Barcode: {barcodeResult}
//       </div>
//     </div>
//   );
// }
