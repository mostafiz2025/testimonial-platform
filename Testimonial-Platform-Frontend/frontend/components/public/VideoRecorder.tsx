"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Circle, RotateCcw, Square, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const MAX_SECONDS = 120;
const MAX_BYTES = 100 * 1024 * 1024;

interface Props {
  color: string;
  value: File | null;
  onChange: (file: File | null) => void;
}

function pickMime() {
  const types = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
  return types.find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) ?? "";
}

/** Record from the webcam in the browser, or upload an existing video file */
export function VideoRecorder({ color, value, onChange }: Props) {
  const liveRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [state, setState] = useState<"idle" | "ready" | "recording">("idle");
  const [seconds, setSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => stopStream, [stopStream]);

  useEffect(() => {
    if (!value) return setPreviewUrl(null);
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  async function openCamera() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      return toast.error("Recording is not supported in this browser. Please upload a video instead.");
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
      streamRef.current = stream;
      setState("ready");
      // the <video> mounts after the state change
      requestAnimationFrame(() => {
        if (liveRef.current) {
          liveRef.current.srcObject = stream;
          liveRef.current.play().catch(() => undefined);
        }
      });
    } catch {
      toast.error("Could not access your camera / microphone. Please allow access or upload a video.");
    }
  }

  function startRecording() {
    if (!streamRef.current) return;
    const mime = pickMime();
    const rec = new MediaRecorder(streamRef.current, mime ? { mimeType: mime } : undefined);
    chunksRef.current = [];
    rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    rec.onstop = () => {
      const type = rec.mimeType || mime || "video/webm";
      const ext = type.includes("mp4") ? "mp4" : "webm";
      const file = new File(chunksRef.current, `testimonial.${ext}`, { type });
      stopStream();
      setState("idle");
      if (file.size > MAX_BYTES) return toast.error("Video is too large (max 100 MB). Please record a shorter one.");
      onChange(file);
    };
    recorderRef.current = rec;
    rec.start(1000);
    setSeconds(0);
    setState("recording");
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= MAX_SECONDS) rec.state !== "inactive" && rec.stop();
        return s + 1;
      });
    }, 1000);
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("video/")) return toast.error("Please choose a video file");
    if (f.size > MAX_BYTES) return toast.error("Video is too large (max 100 MB)");
    onChange(f);
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  // ---- recorded / uploaded video preview ----
  if (value && previewUrl) {
    return (
      <div className="space-y-3">
        <video src={previewUrl} controls className="aspect-video w-full rounded-2xl bg-black" />
        <Button type="button" variant="outline" onClick={() => onChange(null)}>
          <RotateCcw /> Record again
        </Button>
      </div>
    );
  }

  // ---- live camera ----
  if (state !== "idle") {
    return (
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-2xl bg-black">
          <video ref={liveRef} muted playsInline className="aspect-video w-full -scale-x-100 object-cover" />
          {state === "recording" && (
            <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
              <span className="size-2 animate-pulse rounded-full bg-red-500" /> {mm}:{ss}
            </span>
          )}
        </div>
        {state === "ready" ? (
          <div className="flex gap-2">
            <Button type="button" onClick={startRecording} style={{ backgroundColor: color }} className="text-white">
              <Circle className="fill-white" /> Start recording
            </Button>
            <Button type="button" variant="ghost" onClick={() => { stopStream(); setState("idle"); }}>Cancel</Button>
          </div>
        ) : (
          <Button type="button" onClick={stopRecording} className="bg-red-600 text-white hover:bg-red-700">
            <Square className="fill-white" /> Stop ({MAX_SECONDS - seconds}s left)
          </Button>
        )}
      </div>
    );
  }

  // ---- start screen ----
  return (
    <div className="space-y-3 rounded-2xl border border-dashed p-6 text-center">
      <Camera className="mx-auto size-9 text-neutral-400" />
      <p className="text-sm text-neutral-600">Record up to 2 minutes right from your browser.</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" onClick={openCamera} style={{ backgroundColor: color }} className="text-white">
          <Camera /> Open camera
        </Button>
        <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-4xl border bg-white px-3 text-sm font-medium hover:bg-neutral-50">
          <Upload className="size-4" /> Upload a video
          <input type="file" accept="video/*" className="hidden" onChange={onUpload} />
        </label>
      </div>
    </div>
  );
}
