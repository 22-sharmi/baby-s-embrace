import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Memory, MemoryInput } from "./types";

const COLLECTION = "memories";

const toDate = (v: unknown): Date => {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return new Date();
};

export function subscribeMemories(cb: (m: Memory[]) => void, onError?: (e: Error) => void) {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const items: Memory[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          content: String(data.content ?? ""),
          author: (data.author as Memory["author"]) ?? "mother",
          type: (data.type as Memory["type"]) ?? "letter",
          emotion: (data.emotion as Memory["emotion"]) ?? "happy",
          isForBaby: Boolean(data.isForBaby),
          createdAt: toDate(data.createdAt),
        };
      });
      cb(items);
    },
    (err) => onError?.(err)
  );
}

export async function createMemory(input: MemoryInput) {
  await addDoc(collection(db, COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
  });
}

export async function updateMemory(id: string, input: Partial<MemoryInput>) {
  await updateDoc(doc(db, COLLECTION, id), { ...input });
}

export async function removeMemory(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}
