import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
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
import {
  EMOTIONS,
  EMOTION_LABEL,
  EMOTION_STYLE,
  type Contributor,
  type Emotion,
  type MemoryType,
} from "@/lib/types";

export default function MemoryForm() {
  const { role } = useRole();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [content, setContent] = useState("");
  const [type, setType] = useState<MemoryType>("letter");
  const [emotion, setEmotion] = useState<Emotion>("happy");
  const [isForBaby, setIsForBaby] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    const unsub = subscribeMemories((list) => {
      const m = list.find((x) => x.id === id);
      if (m) {
        setContent(m.content);
        setType(m.type);
        setEmotion(m.emotion);
        setIsForBaby(m.isForBaby);
        setLoading(false);
      }
    });
    return () => unsub();
  }, [id, isEdit]);

  if (!role || role === "baby") {
    navigate("/timeline", { replace: true });
    return null;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Please write something first");
      return;
    }
    setSaving(true);
    try {
      if (isEdit && id) {
        await updateMemory(id, { content: content.trim(), type, emotion, isForBaby });
        toast.success("Memory updated");
      } else {
        await createMemory({
          content: content.trim(),
          author: role as Contributor,
          type,
          emotion,
          isForBaby,
        });
        toast.success("Memory saved ❤️");
      }
      navigate("/timeline");
    } catch (err) {
      toast.error("Couldn't save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

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
            <Label htmlFor="content" className="text-xs uppercase tracking-wider text-muted-foreground">
              Your words
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Dear little one…"
              rows={8}
              className="mt-2 resize-none border-none bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="soft-card p-4">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as MemoryType)}>
                <SelectTrigger className="mt-2 border-none bg-transparent px-0 shadow-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="letter">Letter</SelectItem>
                  <SelectItem value="feeling">Feeling</SelectItem>
                </SelectContent>
              </Select>
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
            disabled={saving}
            className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : isEdit ? "Save changes" : "Save memory"}
          </Button>
        </form>
      )}
    </div>
  );
}
