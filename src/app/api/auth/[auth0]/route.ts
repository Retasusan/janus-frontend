import { NextRequest } from "next/server";

type Param = { auth0: string };

// This route is intentionally not used. Auth is handled by /auth/* via middleware.
// We keep this file to avoid Next.js route resolution conflicts from stale paths.
export async function GET(_req: NextRequest, _ctx: { params: Promise<Param> }) {
	return new Response("Not Found", {
		status: 404,
		headers: { "x-info": "Use /auth/* routes handled by middleware" },
	});
}

export const POST = GET;
