// Issues short-lived Vercel Blob upload tokens for listing photos (frontend-rebuild.md D2). The
// browser uploads the file straight to the Blob store, so photos never pass through a function's
// request size limit. Only signed-in users get a token, and only for an image in the listings folder.
import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getCurrentUser } from "@/lib/auth/current-user";
import { photoUploadRules } from "@/lib/listings/photos";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await getCurrentUser())) throw new Error("Please sign in again.");
        const rules = photoUploadRules(pathname);
        if (!rules) throw new Error("That file can't be uploaded.");
        return rules;
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 400 });
  }
}
