import { json } from "../../_shared/response";
import { clearSessionCookie } from "../../_shared/session";

export const onRequestPost = async (context: { request: Request }): Promise<Response> => {
  const response = json({ ok: true });
  response.headers.set("set-cookie", clearSessionCookie(context.request));
  return response;
};
