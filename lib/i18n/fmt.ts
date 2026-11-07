/** Fill {placeholders}: fmt("Hello {name}", { name: "Ana" }) → "Hello Ana". */
export function fmt(s: string, vars: Record<string, string | number> = {}): string {
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/** Number → word where the language has one ("Ten places"), else the digit. */
export function countWord(words: string[], n: number, capitalise = true): string {
  const w = words[n] ?? String(n);
  return capitalise ? w.charAt(0).toUpperCase() + w.slice(1) : w;
}
