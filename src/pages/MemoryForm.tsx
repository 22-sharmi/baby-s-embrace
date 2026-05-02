import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, ImageIcon, Loader2, Mic, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRole } from "@/context/RoleContext";
import { createMemory, subscribeMemories, updateMemory } from "@/lib/memories";
import { uploadToCloudinary } from "@/lib/cloudinary";
import {
  EMOTIONS,
  EMOTION_LABEL,
  EMOTION_STYLE,
  type Contributor,
  type Emotion,
  type MemoryType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_IMAGE_MB = 10;
const MAX_AUDIO_MB = 20;

export default function MemoryForm() {
  const { role } = useRole();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [content, setContent] = useState("");
  const [emotion, setEmotion] = useState<Emotion>("happy");
  const [isForBaby, setIsForBaby] = useState(true);
  const [type, setType] = useState<MemoryType>("text");
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(undefined);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [notFound, setNotFound] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEdit) return;
    const unsub = subscribeMemories((list) => {
      const m = list.find((x) => x.id === id);
      if (m) {
        if (m.author !== role) {
          setNotFound(true);
          return;
        }
        setContent(m.content);
        setEmotion(m.emotion);
        setIsForBaby(m.isForBaby);
        setType(m.type);
        setMediaUrl(m.mediaUrl);
        setLoading(false);
      }
    });
    return () => unsub();
  }, [id, isEdit, role]);

  // Cleanup local object URLs
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!role || role === "baby") {
    navigate("/timeline", { replace: true });
    return null;
  }

  if (notFound) {
    navigate("/timeline", { replace: true });
    return null;
  }

  const switchType = (next: MemoryType) => {
    if (next === type) return;
    setType(next);
    setPendingFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(undefined);
    // Keep existing remote mediaUrl in edit mode if matches; otherwise clear
    setMediaUrl(undefined);
  };

  const onPickFile = (kind: "image" | "audio", file: File | null) => {
    if (!file) return;
    const maxMb = kind === "image" ? MAX_IMAGE_MB : MAX_AUDIO_MB;
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`File too large. Max ${maxMb}MB.`);
      return;
    }
    setPendingFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setMediaUrl(undefined);
  };

  const clearMedia = () => {
    setPendingFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(undefined);
    setMediaUrl(undefined);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (audioInputRef.current) audioInputRef.current.value = "";
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (type === "text" && !content.trim()) {
      toast.error("Please write something first");
      return;
    }
    if (type !== "text" && !pendingFile && !mediaUrl) {
      toast.error(`Please choose ${type === "image" ? "an image" : "an audio file"}`);
      return;
    }

    setSaving(true);
    try {
      let finalMediaUrl = mediaUrl;
      if (pendingFile && type !== "text") {
        setUploading(true);
        finalMediaUrl = await uploadToCloudinary(pendingFile, type);
        setUploading(false);
      }

      const payload = {
        content: content.trim(),
        author: role as Contributor,
        emotion,
        type,
        mediaUrl: finalMediaUrl,
        isForBaby,
      };

      if (isEdit && id) {
        await updateMemory(id, payload);
        toast.success("Memory updated");
      } else {
        await createMemory(payload);
        toast.success("Memory saved ❤️");
      }
      navigate("/timeline");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Couldn't save. Please try again.";
      toast.error(msg);
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  const TypeButton = ({
    value,
    icon: Icon,
    label,
  }: {
    value: MemoryType;
    icon: typeof FileText;
    label: string;
  }) => (
    <button
      type="button"
      onClick={() => switchType(value)}
      className={cn(
        "flex flex-1 flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-colors",
        type === value
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-muted-foreground hover:bg-accent"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );

  const showImagePreview = type === "image" && (previewUrl || mediaUrl);
  const showAudioPreview = type === "audio" && (previewUrl || mediaUrl);

  return (
    <div className="app-shell">
      <header className="mb-5 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-serif text-2xl">{isEdit ? "Edit memory" : "New memory"}</h1>
      </header>

      {loading ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="soft-card p-4">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Memory type
            </Label>
            <div className="mt-2 flex gap-2">
              <TypeButton value="text" icon={FileText} label="Text" />
              <TypeButton value="image" icon={ImageIcon} label="Image" />
              <TypeButton value="audio" icon={Mic} label="Audio" />
            </div>
          </div>

          {type === "image" && (
            <div className="soft-card p-4">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Image
              </Label>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPickFile("image", e.target.files?.[0] ?? null)}
              />
              {showImagePreview ? (
                <div className="relative mt-3">
                  <img
                    src={previewUrl ?? mediaUrl}
                    alt="Preview"
                    className="w-full rounded-2xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearMedia}
                    aria-label="Remove image"
                    className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 shadow"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-10 text-sm text-muted-foreground hover:bg-accent"
                >
                  <Upload className="h-5 w-5" />
                  Choose an image
                </button>
              )}
            </div>
          )}

          {type === "audio" && (
            <div className="soft-card p-4">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Audio
              </Label>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => onPickFile("audio", e.target.files?.[0] ?? null)}
              />
              {showAudioPreview ? (
                <div className="mt-3 space-y-2">
                  <audio
                    controls
                    src={previewUrl ?? mediaUrl}
                    className="w-full"
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={clearMedia}>
                    <X className="mr-1 h-4 w-4" /> Remove
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  className="mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-10 text-sm text-muted-foreground hover:bg-accent"
                >
                  <Mic className="h-5 w-5" />
                  Choose an audio file
                </button>
              )}
            </div>
          )}

          <div className="soft-card p-4">
            <Label htmlFor="content" className="text-xs uppercase tracking-wider text-muted-foreground">
              {type === "text" ? "Your words" : "Caption (optional)"}
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={type === "text" ? "Dear little one…" : "Add a few words…"}
              rows={type === "text" ? 8 : 3}
              className="mt-2 resize-none border-none bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="soft-card p-4">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Emotion
            </Label>
            <Select value={emotion} onValueChange={(v) => setEmotion(v as Emotion)}>
              <SelectTrigger className="mt-2 border-none bg-transparent px-0 shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMOTIONS.map((e) => (
                  <SelectItem key={e} value={e}>
                    <span className="inline-flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${EMOTION_STYLE[e].dot}`} />
                      {EMOTION_LABEL[e]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="soft-card flex items-center justify-between p-4">
            <div>
              <p className="font-semibold">Visible to baby ❤️</p>
              <p className="text-xs text-muted-foreground">
                Baby mode will only show memories you mark for them.
              </p>
            </div>
            <Switch checked={isForBaby} onCheckedChange={setIsForBaby} />
          </div>

          <Button
            type="submit"
            disabled={saving || uploading}
            className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {uploading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Uploading…
              </span>
            ) : saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Save memory"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
