// Single-user local auth shim. Replace with NextAuth/Auth.js when deploying.
export type User = { id: string };

export function getCurrentUser(): User {
  return { id: "local" };
}
