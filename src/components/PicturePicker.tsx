import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Image as ImageIcon, Loader2, Search, Upload, Volume2, X } from "lucide-react";
import type { Lang } from "@/lib/app-types";
import { searchPictures } from "@/lib/picture-library";
import { searchPhotos, type PhotoResult } from "@/lib/smart.functions";
import { speak } from "@/lib/speech";

export interface PickedPicture {
  emoji?: string;
  imageUrl?: string;
  labels?: Record<Lang, string>;
}

export function PicturePicker({
  lang,
  title = "Choose a picture",
  onPick,
  onClose,
}: {
  lang: Lang;
  title?: string;
  onPick: (p: PickedPicture) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"library" | "photos">("library");
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState<PhotoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const results = searchPictures(query);

  const runPhotoSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchPhotos({ data: { query: query.trim() } });
      setPhotos(res.photos);
      if (res.error) setError(res.error);
      else if (res.photos.length === 0) setError("No photos found — try another word.");
    } catch {
      setError("Photo search needs an internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const importFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => onPick({ imageUrl: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card-pop flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden p-5"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-display truncate text-xl font-bold">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-11 place-items-center rounded-full border-2 border-ink/10"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {(["library", "photos"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`font-display h-11 rounded-full px-5 text-sm font-bold ${
                tab === t ? "bg-ink text-cream" : "border-2 border-ink/10 bg-card-warm text-inksoft"
              }`}
            >
              {t === "library" ? "Picture library" : "Photo search"}
            </button>
          ))}
          <button
            onClick={() => fileRef.current?.click()}
            className="font-display ml-auto flex h-11 items-center gap-2 rounded-full border-2 border-honey/50 bg-honey/25 px-5 text-sm font-bold"
          >
            <Upload className="size-4" /> Upload photo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])}
          />
        </div>

        <div className="mb-3 flex gap-2">
          <div className="flex h-12 flex-1 items-center gap-2 rounded-2xl border-2 border-ink/10 bg-card-warm px-3">
            <Search className="size-4 text-inksoft" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && tab === "photos" && runPhotoSearch()}
              placeholder={
                tab === "library"
                  ? "Search pictures: dog, rain, pizza…"
                  : "Search photos: puppy, tractor…"
              }
              className="h-full min-w-0 flex-1 bg-transparent outline-none"
            />
          </div>
          {tab === "photos" && (
            <button
              onClick={runPhotoSearch}
              className="font-display flex h-12 items-center gap-2 rounded-2xl border-2 border-ink bg-ink px-5 font-bold text-cream"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}{" "}
              Search
            </button>
          )}
        </div>

        {error && <p className="mb-2 text-sm font-bold text-coral">{error}</p>}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {tab === "library" ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onPick({ emoji: p.emoji, labels: p.labels })}
                  className="grid place-items-center rounded-2xl border-2 border-ink/10 bg-card-warm p-3 text-center"
                >
                  <span className="text-4xl" aria-hidden>
                    {p.emoji}
                  </span>
                  <span className="font-display mt-1 text-xs font-bold">{p.labels[lang]}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Say ${p.labels[lang]}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(p.labels[lang], lang);
                    }}
                    className="mt-1 grid size-7 place-items-center rounded-full border-2 border-ink/10 bg-paper text-inksoft"
                  >
                    <Volume2 className="size-3" />
                  </span>
                </button>
              ))}
              {results.length === 0 && (
                <p className="col-span-full text-sm text-inksoft">No pictures match that word.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {photos.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onPick({ imageUrl: p.url })}
                  className="overflow-hidden rounded-2xl border-2 border-ink/10 bg-card-warm text-left"
                >
                  <img
                    src={p.thumbnail}
                    alt={p.title}
                    loading="lazy"
                    className="h-24 w-full object-cover"
                  />
                  <span className="block truncate p-2 text-xs font-bold text-inksoft">
                    {p.title}
                  </span>
                </button>
              ))}
              {photos.length === 0 && !loading && (
                <p className="col-span-full flex items-center gap-2 text-sm text-inksoft">
                  <ImageIcon className="size-4" /> Search for a word to see freely usable photos.
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
