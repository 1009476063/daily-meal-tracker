import { createSupabaseServerClient } from "./supabase-server";

export interface AuthUser {
  id: string;
  email: string;
}

/**
 * Extract and verify the authenticated user from the request.
 * Returns the user on success, or an error Response on failure.
 */
export async function getAuthUser(request: Request): Promise<{ user: AuthUser } | { error: Response }> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return { error: Response.json({ error: "未登录，请先登录" }, { status: 401 }) };
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return { error: Response.json({ error: "无效的认证令牌" }, { status: 401 }) };
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return { error: Response.json({ error: "认证已过期，请重新登录" }, { status: 401 }) };
    }
    return { user: { id: data.user.id, email: data.user.email ?? "" } };
  } catch (err) {
    console.error("[getAuthUser]", err);
    return { error: Response.json({ error: "认证服务异常" }, { status: 500 }) };
  }
}

/**
 * Verify the authenticated user matches the expected user_id.
 */
export async function requireAuth(request: Request, expectedUserId?: string): Promise<{ user: AuthUser } | { error: Response }> {
  const result = await getAuthUser(request);
  if ("error" in result) return result;

  if (expectedUserId && result.user.id !== expectedUserId) {
    return { error: Response.json({ error: "无权操作其他用户的数据" }, { status: 403 }) };
  }

  return result;
}
