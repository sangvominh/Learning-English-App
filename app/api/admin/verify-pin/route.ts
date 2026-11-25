import { getAdminPin, isUsingDefaultPin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { pin?: string };
    const provided = (body?.pin ?? "").trim();
    const ok = provided.length > 0 && provided === getAdminPin();
    return Response.json({
      ok,
      isUsingDefaultPin: isUsingDefaultPin(),
    });
  } catch {
    return Response.json(
      { ok: false, isUsingDefaultPin: isUsingDefaultPin() },
      { status: 400 }
    );
  }
}
