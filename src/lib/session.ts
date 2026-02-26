const SESSION_KEY = "selfie_session_id";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";

  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  sessionStorage.setItem(SESSION_KEY, id);
  return id;
}
