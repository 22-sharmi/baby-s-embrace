export type Role = "mother" | "father" | "aunt" | "baby";
export type Contributor = Exclude<Role, "baby">;
export type Emotion = "happy" | "excited" | "tired" | "emotional";
export type MemoryType = "text" | "image" | "audio";

export interface Memory {
  id: string;
  content: string;
  author: Contributor;
  emotion: Emotion;
  type: MemoryType;
  mediaUrl?: string;
  isForBaby: boolean;
  createdAt: Date;
}

export interface MemoryInput {
  content: string;
  author: Contributor;
  emotion: Emotion;
  type: MemoryType;
  mediaUrl?: string;
  isForBaby: boolean;
}

export const ROLE_LABEL: Record<Role, string> = {
  mother: "Mother",
  father: "Father",
  aunt: "Aunt",
  baby: "Baby",
};

export const EMOTIONS: Emotion[] = ["happy", "excited", "tired", "emotional"];
export const EMOTION_LABEL: Record<Emotion, string> = {
  happy: "Happy",
  excited: "Excited",
  tired: "Tired",
  emotional: "Emotional",
};

// Maps to design tokens defined in index.css
export const EMOTION_STYLE: Record<Emotion, { bg: string; fg: string; dot: string }> = {
  happy: {
    bg: "bg-[hsl(var(--emotion-happy))]",
    fg: "text-[hsl(var(--emotion-happy-fg))]",
    dot: "bg-[hsl(var(--emotion-happy))]",
  },
  excited: {
    bg: "bg-[hsl(var(--emotion-excited))]",
    fg: "text-[hsl(var(--emotion-excited-fg))]",
    dot: "bg-[hsl(var(--emotion-excited))]",
  },
  tired: {
    bg: "bg-[hsl(var(--emotion-tired))]",
    fg: "text-[hsl(var(--emotion-tired-fg))]",
    dot: "bg-[hsl(var(--emotion-tired))]",
  },
  emotional: {
    bg: "bg-[hsl(var(--emotion-emotional))]",
    fg: "text-[hsl(var(--emotion-emotional-fg))]",
    dot: "bg-[hsl(var(--emotion-emotional))]",
  },
};
