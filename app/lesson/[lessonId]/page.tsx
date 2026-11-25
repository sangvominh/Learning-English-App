import { Suspense } from "react";
import { LessonSessionClient } from "@/components/LessonSessionClient";

async function LessonLoader({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  return <LessonSessionClient lessonId={lessonId} />;
}

export default function LessonPage(props: PageProps<"/lesson/[lessonId]">) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FFFBF2]">
          <div className="rounded-3xl bg-white p-6 text-center shadow-sm border-2 border-amber-100">
            <p className="text-3xl mb-2">🐝</p>
            <p className="font-bold text-slate-600">Đang tải bài học...</p>
          </div>
        </div>
      }
    >
      <LessonLoader params={props.params} />
    </Suspense>
  );
}
