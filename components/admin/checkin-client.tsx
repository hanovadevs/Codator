"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, RefreshCw, CheckCircle, AlertTriangle, XCircle, Loader2, ArrowRight, Video } from "lucide-react";

interface EventDetails {
  id: string;
  title: string;
  location: string;
}

interface CheckInClientProps {
  event: EventDetails;
}

interface ScanResult {
  status: "SUCCESS" | "ALREADY_CHECKED_IN" | "SUCCESS_OVERRIDE" | "NOT_REGISTERED" | "ERROR";
  message: string;
  memberName?: string;
  memberCodatorId?: string;
  memberId?: string;
  token?: string;
}

export default function CheckInClient({ event }: CheckInClientProps) {
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");

  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const qrCodeInstance = useRef<Html5Qrcode | null>(null);
  const scannerId = "qr-reader-viewfinder";

  useEffect(() => {
    // 1. Fetch available cameras on mount
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Default to the back camera if available, otherwise the first camera
          const backCamera = devices.find((device) =>
            device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("environment")
          );
          setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
        } else {
          setErrorMsg("No camera devices found. Please ensure camera permissions are granted.");
        }
      })
      .catch((err) => {
        console.error("Error getting cameras:", err);
        setErrorMsg("Failed to access camera. Please check permissions.");
      });

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async (cameraId: string) => {
    if (qrCodeInstance.current) {
      await stopScanner();
    }

    setErrorMsg("");
    setScanResult(null);

    const html5QrCode = new Html5Qrcode(scannerId);
    qrCodeInstance.current = html5QrCode;

    try {
      setIsScanning(true);
      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7;
            return { width: size, height: size };
          },
        },
        onScanSuccess,
        onScanFailure
      );
    } catch (err: any) {
      console.error("Failed to start scanner:", err);
      setErrorMsg(err.message || "Failed to start camera stream.");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (qrCodeInstance.current && qrCodeInstance.current.isScanning) {
      try {
        await qrCodeInstance.current.stop();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    // Pause scanning by stopping the scanner upon successful decode
    await stopScanner();
    setIsLoading(true);
    setErrorMsg("");

    try {
      // Decode URL parameters
      const url = new URL(decodedText);
      const memberId = url.searchParams.get("id");
      const token = url.searchParams.get("token");

      if (!memberId || !token) {
        throw new Error("Invalid QR Code format. Missing member ID or pass token.");
      }

      // Call Check-In API
      const response = await fetch(`/api/events/${event.id}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, token }),
      });

      const data = await response.json();

      if (response.status === 400 && data.error === "NOT_REGISTERED") {
        // Warning state: Active member but not registered
        setScanResult({
          status: "NOT_REGISTERED",
          message: data.message,
          memberName: data.memberName,
          memberCodatorId: data.memberCodatorId,
          memberId,
          token,
        });
      } else if (!response.ok) {
        throw new Error(data.error || "Check-in request failed.");
      } else {
        // Success state (Normal or Already checked in)
        setScanResult({
          status: data.status,
          message: data.message,
          memberName: data.memberName,
          memberCodatorId: data.memberCodatorId,
        });
      }
    } catch (err: any) {
      setScanResult({
        status: "ERROR",
        message: err.message || "Failed to verify pass.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onScanFailure = (error: any) => {
    // Silently ignore scan failures (e.g. frames without QR codes)
  };

  // Handle register and check-in override
  const handleOverrideCheckIn = async () => {
    if (!scanResult || !scanResult.memberId || !scanResult.token) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch(`/api/events/${event.id}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: scanResult.memberId,
          token: scanResult.token,
          overrideRegister: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Override check-in failed.");
      }

      setScanResult({
        status: "SUCCESS_OVERRIDE",
        message: data.message,
        memberName: data.memberName,
        memberCodatorId: data.memberCodatorId,
      });
    } catch (err: any) {
      setScanResult({
        status: "ERROR",
        message: err.message || "Failed to override registration.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraChange = (cameraId: string) => {
    setSelectedCameraId(cameraId);
    if (isScanning) {
      startScanner(cameraId);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    if (selectedCameraId) {
      startScanner(selectedCameraId);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 text-ink">
      {/* Event Header */}
      <div className="text-center">
        <span className="text-4xs font-bold uppercase tracking-widest text-wisteria bg-wisteria-tint/40 border border-wisteria/10 px-3 py-1 rounded-full">
          Live Attendance Check-In
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-black text-ink mt-3">
          {event.title}
        </h1>
        <p className="text-xs text-ink/65 mt-1.5 flex items-center justify-center gap-1">
          <Video className="h-3.5 w-3.5 text-wisteria" />
          <span>Location: {event.location}</span>
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-800 border border-red-200 text-center">
          {errorMsg}
        </div>
      )}

      {/* Main Scanner Container */}
      <div className="relative border border-mist/80 bg-[#13121A] rounded-3xl overflow-hidden aspect-square shadow-lg flex flex-col items-center justify-center">
        {/* Scanner Viewfinder Box */}
        <div
          id={scannerId}
          className="w-full h-full object-cover relative"
          style={{ display: isScanning ? "block" : "none" }}
        />

        {/* Viewfinder Overlay (When scanning) */}
        {isScanning && !scanResult && (
          <div className="absolute inset-0 border-[35px] border-[#13121A]/70 pointer-events-none flex items-center justify-center">
            {/* Corner Brackets */}
            <div className="relative w-44 h-44 border border-white/20">
              <div className="absolute top-0 left-0 w-5 h-5 border-t-[3px] border-l-[3px] border-wisteria" />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-[3px] border-r-[3px] border-wisteria" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-[3px] border-l-[3px] border-wisteria" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-[3px] border-r-[3px] border-wisteria" />
              
              {/* Laser Line */}
              <div className="w-full h-[2px] bg-wisteria absolute top-0 left-0 shadow-[0_0_8px_#8B7FE8] animate-[scan_2.5s_ease-in-out_infinite]" />
            </div>
          </div>
        )}

        {/* Loader during API request */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#13121A]/85 backdrop-blur-xs flex flex-col items-center justify-center text-paper gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-wisteria" />
            <span className="text-xs font-semibold tracking-wider text-paper/85">Verifying Pass...</span>
          </div>
        )}

        {/* Static State (Not scanning, no results) */}
        {!isScanning && !scanResult && !isLoading && (
          <div className="text-center p-8 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-wisteria-tint/20 text-wisteria border border-wisteria/10">
              <Camera className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-paper">Camera Standby</h3>
              <p className="text-3xs text-paper/60 max-w-xs leading-relaxed">
                Click the button below to start the camera and scan member passes.
              </p>
            </div>
            <button
              onClick={() => selectedCameraId && startScanner(selectedCameraId)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-wisteria px-5 py-2.5 text-xs font-bold text-paper hover:bg-wisteria/90 transition-all cursor-pointer"
            >
              Start Camera Check-In
            </button>
          </div>
        )}

        {/* ================= SCAN RESULT OVERLAYS ================= */}
        {scanResult && (
          <div className="absolute inset-0 bg-[#13121A]/95 p-6 flex flex-col justify-between items-center text-center">
            <div className="my-auto space-y-5 max-w-sm">
              {/* Status Icons */}
              {scanResult.status === "SUCCESS" || scanResult.status === "SUCCESS_OVERRIDE" ? (
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle className="h-8 w-8" />
                </div>
              ) : scanResult.status === "ALREADY_CHECKED_IN" ? (
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                  <CheckCircle className="h-8 w-8" />
                </div>
              ) : scanResult.status === "NOT_REGISTERED" ? (
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="h-8 w-8" />
                </div>
              ) : (
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
                  <XCircle className="h-8 w-8" />
                </div>
              )}

              {/* Status Text & Member Details */}
              <div className="space-y-2">
                <h3
                  className={`text-lg font-black tracking-tight ${
                    scanResult.status === "SUCCESS" ||
                    scanResult.status === "SUCCESS_OVERRIDE" ||
                    scanResult.status === "ALREADY_CHECKED_IN"
                      ? "text-emerald-400"
                      : scanResult.status === "NOT_REGISTERED"
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {scanResult.status === "SUCCESS" || scanResult.status === "SUCCESS_OVERRIDE"
                    ? "Check-In Confirmed!"
                    : scanResult.status === "ALREADY_CHECKED_IN"
                    ? "Already Checked In"
                    : scanResult.status === "NOT_REGISTERED"
                    ? "Not Registered"
                    : "Verification Failed"}
                </h3>

                {scanResult.memberName && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1 mt-3">
                    <span className="block text-sm font-bold text-paper">{scanResult.memberName}</span>
                    <span className="block text-4xs font-mono text-wisteria font-bold tracking-wider uppercase">
                      {scanResult.memberCodatorId}
                    </span>
                  </div>
                )}

                <p className="text-xs text-paper/70 leading-relaxed pt-1">{scanResult.message}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex gap-3 mt-4">
              {scanResult.status === "NOT_REGISTERED" && (
                <button
                  onClick={handleOverrideCheckIn}
                  className="flex-1 rounded-xl bg-amber-500 py-3 text-xs font-bold text-ink hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  Register & Check-In
                </button>
              )}
              <button
                onClick={resetScanner}
                className="flex-1 rounded-xl bg-wisteria py-3 text-xs font-bold text-paper hover:bg-wisteria/90 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Scan Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Camera Selection controls */}
      {!scanResult && cameras.length > 1 && (
        <div className="flex justify-center items-center gap-3">
          <label className="text-xs font-bold text-ink/65 flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5 text-wisteria" />
            <span>Select Camera:</span>
          </label>
          <select
            value={selectedCameraId}
            onChange={(e) => handleCameraChange(e.target.value)}
            className="rounded-lg border border-mist bg-paper px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-wisteria"
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Keyframe animation for scanning laser line */}
      <style jsx global>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
