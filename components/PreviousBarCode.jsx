// "use client";

// import { useEffect, useRef, useState } from "react";
// import { BrowserMultiFormatReader } from "@zxing/browser";

// const DESIRED_CROP_ASPECT_RATIO = 3 / 2;
// const CROP_SIZE_FACTOR = 0.4;

// export default function PreviousBarCode() {
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
//             videoRef.current.play();
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

//       overlayDiv.style.left = `${(cropX / video.videoWidth) * 100}%`;
//       overlayDiv.style.top = `${(cropY / video.videoHeight) * 100}%`;
//       overlayDiv.style.width = `${(cropWidth / video.videoWidth) * 100}%`;
//       overlayDiv.style.height = `${(cropHeight / video.videoHeight) * 100}%`;

//       const decodeCanvas = async () => {
//         try {
//           const result = codeReader.current.decodeFromCanvas(displayCanvas);
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
//     <div className="flex flex-col items-center p-4 font-sans">
//       <h2 className="mb-4 text-xl font-bold text-gray-800">Barcode Scanner</h2>

//       {/* Camera Container */}
//       <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-xl border border-gray-300 shadow-lg">
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           muted
//           className="h-full w-full object-cover"
//         />

//         {/* Scanning Overlay */}
//         <div
//           ref={cropOverlayRef}
//           className="absolute overflow-hidden rounded-lg border-2 border-white"
//         >
//           {/* Animated scanning line */}
//           <div className="animate-scan absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-400"></div>
//         </div>
//       </div>

//       {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

//       <p className="mt-2 text-center text-sm text-gray-600">
//         Align the barcode inside the white box to scan.
//       </p>

//       <h3 className="mt-6 mb-2 text-lg font-semibold text-gray-800">
//         Cropped Scan Preview
//       </h3>

//       <canvas
//         ref={displayCroppedCanvasRef}
//         className="block h-auto min-h-[80px] max-w-full min-w-[240px] rounded-md border-2 border-blue-500 shadow-md"
//       >
//         Your browser does not support the canvas element.
//       </canvas>

//       <div className="mt-4 w-full max-w-sm rounded-lg border-2 border-dashed border-emerald-500 bg-emerald-50 p-4 text-center text-base font-medium text-emerald-900">
//         {barcodeResult ? `✅ Barcode: ${barcodeResult}` : "Waiting for scan..."}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const DESIRED_CROP_ASPECT_RATIO = 3 / 2;
// Slightly bigger overlay factor
const CROP_SIZE_FACTOR = 0.7;

export default function PreviousBarCode() {
  const videoRef = useRef(null);
  const displayCroppedCanvasRef = useRef(null);
  const cropOverlayRef = useRef(null);
  const [error, setError] = useState(null);
  const [barcodeResult, setBarcodeResult] = useState(null);
  const codeReader = useRef(new BrowserMultiFormatReader());
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    if (!scanning) return;

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
            intervalId = setInterval(captureFrameAndCrop, 150);
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

      overlayDiv.style.left = `${(cropX / video.videoWidth) * 100}%`;
      overlayDiv.style.top = `${(cropY / video.videoHeight) * 100}%`;
      overlayDiv.style.width = `${(cropWidth / video.videoWidth) * 100}%`;
      overlayDiv.style.height = `${(cropHeight / video.videoHeight) * 100}%`;

      const decodeCanvas = async () => {
        try {
          const result =
            await codeReader.current.decodeFromCanvas(displayCanvas);
          console.log("Decoded barcode:", result.getText());
          setBarcodeResult(result.getText());
          setScanning(false); // stop scanning once barcode is found
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
  }, [scanning]);

  const handleScanAgain = () => {
    setBarcodeResult(null);
    setError(null);
    setScanning(true);
  };

  return (
    <div className="flex flex-col items-center p-4 font-sans">
      <h2 className="mb-4 text-xl font-bold text-gray-800">Barcode Scanner</h2>

      {/* Show scanning UI only if scanning */}
      {scanning ? (
        <>
          {/* Smaller video container */}
          <div className="relative aspect-[3/5] w-full max-w-sm overflow-hidden rounded-xl border border-gray-300 shadow-lg">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />

            {/* Scanning Overlay */}
            <div
              ref={cropOverlayRef}
              className="absolute overflow-hidden rounded-lg border-2 border-white"
            >
              {/* Animated scanning line */}
              <div className="animate-scan absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-400"></div>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          <p className="mt-2 text-center text-sm text-gray-600">
            Align the barcode inside the white box to scan.
          </p>

          <h3 className="mt-6 mb-2 text-lg font-semibold text-gray-800">
            Cropped Scan Preview
          </h3>

          <canvas
            ref={displayCroppedCanvasRef}
            className="block h-auto min-h-[80px] max-w-full min-w-[240px] rounded-md border-2 border-blue-500 shadow-md"
          >
            Your browser does not support the canvas element.
          </canvas>
        </>
      ) : (
        // Show result only when scanning stops
        <div className="flex flex-col items-center space-y-4">
          <div className="w-full max-w-sm rounded-lg border-2 border-emerald-500 bg-emerald-50 p-4 text-center text-lg font-semibold text-emerald-900 shadow">
            ✅ Barcode: {barcodeResult}
          </div>
          <button
            onClick={handleScanAgain}
            className="rounded-lg bg-emerald-600 px-6 py-2 text-white shadow transition hover:bg-emerald-700"
          >
            Scan Again
          </button>
        </div>
      )}
    </div>
  );
}
