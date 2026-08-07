import { Eye } from "lucide-react";
import { LessonVisual } from "@/components/lesson/LessonVisual";
import type { LessonVisualKind } from "@/lib/lesson-meta";

export function DiagramCard({ kind }: { kind: LessonVisualKind }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Eye size={14} /> Veja acontecendo
      </div>
      <LessonVisual kind={kind} />
    </div>
  );
}
