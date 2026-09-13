import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  RotateCw,
  ShieldCheck,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from "lucide-react";
import { motion } from "motion/react";

export function LocalPhotoEditor({
  initialPhotoUrl,
  onSave,
  onCancel,
}: {
  initialPhotoUrl?: string;
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(initialPhotoUrl ?? null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // in degrees: 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Load image object whenever imageSrc changes
  useEffect(() => {
    if (!imageSrc) {
      imageRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
    };
  }, [imageSrc]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageSrc(reader.result);
        setZoom(1);
        setRotation(0);
        setPan({ x: 0, y: 0 });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!imageSrc) return;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({
      x: dragStart.current.panX + dx,
      y: dragStart.current.panY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore pointer capture errors
      }
    }
  };

  const rotate90 = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const resetAdjustments = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  const handleExport = () => {
    if (!imageRef.current) return;
    const img = imageRef.current;
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear and draw circular crop
    ctx.clearRect(0, 0, size, size);
    ctx.save();

    // Center coordinates
    ctx.translate(size / 2, size / 2);
    ctx.translate(pan.x, pan.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Compute aspect ratio draw dimensions
    const imgRatio = img.naturalWidth / img.naturalHeight;
    let drawWidth = size;
    let drawHeight = size;
    if (imgRatio > 1) {
      drawHeight = size;
      drawWidth = size * imgRatio;
    } else {
      drawWidth = size;
      drawHeight = size / imgRatio;
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();

    // Export as high-quality local JPEG
    const finalDataUrl = canvas.toDataURL("image/jpeg", 0.85);
    onSave(finalDataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="card-pop max-h-[92vh] w-full max-w-md overflow-y-auto p-5"
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="size-5 text-honey" />
            <h2 className="font-display text-xl font-bold">Student Photo Editor</h2>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full border-2 border-ink/10 hover:bg-card-warm"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* COPPA & FERPA Compliance Notice */}
        <div className="mb-4 flex items-start gap-2.5 rounded-2xl border-2 border-leaf/30 bg-leaf/10 p-3 text-xs leading-relaxed text-leaf">
          <ShieldCheck className="size-5 shrink-0 text-leaf" />
          <div>
            <p className="font-bold">100% On-Device & COPPA/FERPA Compliant</p>
            <p className="opacity-90">
              Student photos are processed and stored solely in this browser on this device. No
              pictures are ever uploaded to any cloud or external server.
            </p>
          </div>
        </div>

        {!imageSrc ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="grid min-h-56 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-ink/25 bg-card-warm p-6 text-center transition-colors hover:border-honey hover:bg-paper"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <div className="grid size-16 place-items-center rounded-full bg-honey/20 text-honey shadow-inner">
              <Upload className="size-8 text-ink" />
            </div>
            <p className="font-display mt-3 text-base font-bold">
              Click or drag student photo here
            </p>
            <p className="text-xs font-bold text-inksoft">Supports PNG, JPG, WebP</p>
          </div>
        ) : (
          <div>
            {/* Interactive Crop / Pan Viewport */}
            <div className="relative mx-auto mb-4 size-64 overflow-hidden rounded-full border-4 border-honey bg-ink/10 shadow-[3px_3px_0_#3A2E28]">
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="size-full cursor-grab active:cursor-grabbing select-none touch-none"
                title="Drag to reposition photo"
              >
                <img
                  src={imageSrc}
                  alt="Edit preview"
                  draggable={false}
                  className="pointer-events-none absolute size-full object-cover transition-transform"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
                    transformOrigin: "center center",
                  }}
                />
              </div>

              {/* Viewport guide overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-ink/20" />
            </div>

            <p className="text-center text-xs font-bold text-inksoft mb-4">
              Drag photo to reposition inside circular badge
            </p>

            {/* Controls: Zoom, Rotate, Reset */}
            <div className="mb-4 space-y-3 rounded-2xl border-2 border-ink/10 bg-card-warm p-3">
              {/* Zoom control */}
              <div className="flex items-center gap-3">
                <ZoomOut className="size-4 text-inksoft shrink-0" />
                <input
                  type="range"
                  min="0.6"
                  max="2.5"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-paper accent-honey"
                />
                <ZoomIn className="size-4 text-inksoft shrink-0" />
                <span className="w-10 text-right text-xs font-bold text-inksoft">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Rotate and Reset buttons */}
              <div className="flex items-center justify-between border-t border-ink/10 pt-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={rotate90}
                  className="flex items-center gap-1.5 rounded-xl border border-ink/15 bg-paper px-3 py-1.5 text-ink hover:bg-honey transition-colors"
                >
                  <RotateCw className="size-3.5" /> Rotate 90°
                </button>

                <button
                  type="button"
                  onClick={resetAdjustments}
                  className="flex items-center gap-1.5 rounded-xl border border-ink/15 bg-paper px-3 py-1.5 text-inksoft hover:text-ink hover:bg-paper"
                >
                  <RefreshCw className="size-3.5" /> Reset
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-coral underline hover:text-ink"
                >
                  Change file
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="font-display flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-ink bg-ink text-base font-bold text-cream shadow-[2px_2px_0_#FFC63F] hover:opacity-95"
              >
                <Check className="size-4" /> Save Photo
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageSrc(null);
                  onSave("");
                }}
                className="font-display flex h-12 items-center justify-center rounded-2xl border-2 border-ink/15 bg-paper px-4 text-xs font-bold text-coral hover:bg-coral/10"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
