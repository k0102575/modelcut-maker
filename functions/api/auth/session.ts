import type { SessionResponse } from "../../../shared/contracts";
import { json } from "../../_shared/response";
import { readSession } from "../../_shared/session";
import type { Env } from "../../_shared/jobs";

export const onRequestGet = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const user = context.env.SESSION_SECRET
    ? await readSession(context.request, context.env.SESSION_SECRET)
    : null;

  return json({
    authenticated: Boolean(user),
    user,
  } satisfies SessionResponse);
};
