export interface AuthUser {
  username: string;
  role: "super_admin" | "company_admin" | "terminal";
  company_id?: string | null;
}

export function saveAuth(token: string, user: AuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem("facepulse_token", token);
  localStorage.setItem("facepulse_user", JSON.stringify(user));
}

export function getAuth(): { token: string | null; user: AuthUser | null } {
  if (typeof window === "undefined") return { token: null, user: null };
  const token = localStorage.getItem("facepulse_token");
  const userStr = localStorage.getItem("facepulse_user");
  let user: AuthUser | null = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch {
      user = null;
    }
  }
  return { token, user };
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("facepulse_token");
  localStorage.removeItem("facepulse_user");
}
