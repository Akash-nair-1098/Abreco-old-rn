/**
 * Best-effort extraction of server / network error text from axios-style errors.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const e = error as any;
  if (e?.errors && typeof e.errors === 'object' && !e?.response) {
    const vals = Object.values(e.errors).flat() as unknown[];
    const first = vals.find(v => typeof v === 'string' && (v as string).trim());
    if (typeof first === 'string') return first;
  }

  const d = e?.response?.data;

  if (typeof d === 'string' && d.trim()) return d.trim();

  if (d?.detail != null) {
    if (typeof d.detail === 'string') return d.detail;
    if (Array.isArray(d.detail)) {
      const parts = d.detail.map((x: any) =>
        typeof x === 'string' ? x : x?.msg || JSON.stringify(x),
      );
      return parts.filter(Boolean).join('\n') || fallback;
    }
  }

  if (typeof d?.message === 'string' && d.message.trim()) return d.message.trim();

  if (Array.isArray(d?.errors)) {
    const joined = d.errors
      .map((x: any) => (typeof x === 'string' ? x : JSON.stringify(x)))
      .join('\n');
    if (joined.trim()) return joined.trim();
  }

  if (d?.errors && typeof d.errors === 'object') {
    const vals = Object.values(d.errors).flat() as unknown[];
    const first = vals.find(v => typeof v === 'string' && (v as string).trim());
    if (typeof first === 'string') return first;
  }

  const msg = e?.message;
  if (typeof msg === 'string' && msg.trim() && !/^Request failed/i.test(msg)) {
    return msg.trim();
  }

  return fallback;
}
