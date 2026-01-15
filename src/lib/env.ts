export function mustGetEnv(key: string): string {
  const v = (import.meta as any).env?.[key];
  if (!v) throw new Error(`Missing env: ${key}`);
  return String(v);
}
