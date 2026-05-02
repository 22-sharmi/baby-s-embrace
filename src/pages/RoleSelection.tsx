import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useRole } from "@/context/RoleContext";
import type { Role } from "@/lib/types";

const options: { role: Role; label: string; emoji: string; sub: string }[] = [
  { role: "mother", label: "Mother", emoji: "🌷", sub: "Carrying every heartbeat" },
  { role: "father", label: "Father", emoji: "🌿", sub: "Counting the days" },
  { role: "aunt", label: "Aunt", emoji: "🌼", sub: "Already in love" },
  { role: "baby", label: "Baby", emoji: "👶", sub: "A story made for you" },
];

export default function RoleSelection() {
  const { setRole } = useRole();
  const navigate = useNavigate();

  const choose = (r: Role) => {
    setRole(r);
    navigate("/timeline", { replace: true });
  };

  return (
    <div className="app-shell flex flex-col">
      <header className="mt-6 text-center">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Heart className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-3xl font-semibold">Little Letters</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Memories from the months of waiting, kept safe for one day.
        </p>
        <p className="mt-8 font-serif text-lg italic text-foreground/80">Enter as</p>
      </header>

      <div className="mt-6 grid gap-3">
        {options.map((o) => (
          <button
            key={o.role}
            onClick={() => choose(o.role)}
            className="soft-card group flex items-center gap-4 p-5 text-left transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] active:scale-[0.99]"
          >
            <span className="text-3xl">{o.emoji}</span>
            <span className="flex-1">
              <span className="block text-lg font-semibold">{o.label}</span>
              <span className="block text-xs text-muted-foreground">{o.sub}</span>
            </span>
            <span className="text-muted-foreground transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
