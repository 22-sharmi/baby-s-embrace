import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LogOut, Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRole } from "@/context/RoleContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { removeMemory, subscribeMemories } from "@/lib/memories";
import { ROLE_LABEL, type Memory } from "@/lib/types";
import { MemoryCard } from "@/components/MemoryCard";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Timeline() {
  const { role, setRole } = useRole();
  const navigate = useNavigate();
  const isBaby = role === "baby";

  const [memories, setMemories] = useState<Memory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Memory | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setError("Add your Firebase config in src/lib/firebase.ts to load memories.");
      setMemories([]);
      return;
    }
    const unsub = subscribeMemories(
      (m) => {
        setMemories(m);
        setError(null);
      },
      (e) => {
        setError(e.message);
        setMemories([]);
      }
    );
    return () => unsub();
  }, []);

  const visible = useMemo(() => {
    if (!memories) return [];
    if (isBaby) return memories.filter((m) => m.isForBaby);
    // Contributors see only their own memories — a private diary.
    return memories.filter((m) => m.author === role);
  }, [memories, isBaby, role]);

  const onSwitchRole = () => {
    setRole(null);
    navigate("/", { replace: true });
  };

  const onDelete = async () => {
    if (!pendingDelete) return;
    // Permission: only the author can delete their memory
    if (pendingDelete.author !== role) {
      toast.error("You can only delete your own memories");
      setPendingDelete(null);
      return;
    }
    try {
      await removeMemory(pendingDelete.id);
      toast.success("Memory removed");
    } catch (e) {
      toast.error("Couldn't delete memory");
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <div
      className="app-shell"
      style={isBaby ? { backgroundImage: "var(--gradient-baby)", backgroundAttachment: "fixed" } : undefined}
    >
      <header className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {role ? ROLE_LABEL[role] : ""}
          </p>
          {isBaby ? (
            <h1 className="mt-1 font-serif text-2xl italic">A story made for you ❤️</h1>
          ) : (
            <h1 className="mt-1 font-serif text-2xl">My little letters</h1>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onSwitchRole} aria-label="Switch role">
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      {error && (
        <div className="soft-card mb-4 border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {memories === null ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-16 text-center">
          <Heart className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 font-serif text-lg italic text-foreground/80">No memories yet ❤️</p>
          {!isBaby && (
            <p className="mt-1 text-sm text-muted-foreground">Be the first to write one.</p>
          )}
        </div>
      ) : (
        <div className="space-y-4 pb-24">
          {visible.map((m) => (
            <MemoryCard
              key={m.id}
              memory={m}
              babyMode={isBaby}
              canEdit={!isBaby && m.author === role}
              onEdit={(mem) => navigate(`/edit/${mem.id}`)}
              onDelete={(mem) => setPendingDelete(mem)}
            />
          ))}
        </div>
      )}

      {!isBaby && (
        <button
          onClick={() => navigate("/add")}
          className="fixed bottom-6 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-transform active:scale-95"
        >
          <Plus className="h-5 w-5" /> Add memory
        </button>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this memory?</AlertDialogTitle>
            <AlertDialogDescription>
              This can't be undone. The memory will be gently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
