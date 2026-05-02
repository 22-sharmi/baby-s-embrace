import { Pencil, Trash2, Baby, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EMOTION_LABEL, EMOTION_STYLE, ROLE_LABEL, type Memory } from "@/lib/types";

interface Props {
  memory: Memory;
  canEdit: boolean;
  babyMode?: boolean;
  onEdit?: (m: Memory) => void;
  onDelete?: (m: Memory) => void;
}

const formatDate = (d: Date) =>
  d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export function MemoryCard({ memory, canEdit, babyMode, onEdit, onDelete }: Props) {
  const style = EMOTION_STYLE[memory.emotion];
  return (
    <article className="soft-card overflow-hidden transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5">
      <div className={`h-1.5 w-full ${style.dot}`} />

      {memory.type === "image" && memory.mediaUrl && (
        <div className="px-5 pt-5">
          <img
            src={memory.mediaUrl}
            alt={memory.content || "Memory image"}
            loading="lazy"
            className="w-full rounded-2xl object-cover"
          />
        </div>
      )}

      <div className="p-5">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {ROLE_LABEL[memory.author]}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${style.bg} ${style.fg}`}
            >
              {EMOTION_LABEL[memory.emotion]}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{formatDate(memory.createdAt)}</span>
        </header>

        {memory.type === "audio" && memory.mediaUrl && (
          <audio
            controls
            preload="metadata"
            src={memory.mediaUrl}
            className="mt-3 w-full"
          />
        )}

        {memory.content && (
          <p
            className={`mt-3 whitespace-pre-wrap leading-relaxed ${
              babyMode ? "font-serif text-[17px] text-foreground/90" : "text-foreground/90"
            }`}
          >
            {memory.content}
          </p>
        )}

        <footer className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            {memory.isForBaby ? (
              <>
                <Baby className="h-3.5 w-3.5" /> Baby
              </>
            ) : (
              <>
                <Users className="h-3.5 w-3.5" /> Private
              </>
            )}
          </span>

          {canEdit && (
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit?.(memory)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete?.(memory)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </footer>
      </div>
    </article>
  );
}
