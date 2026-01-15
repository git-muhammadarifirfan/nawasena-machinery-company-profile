export function parseDesc(desc: string) {
  const lines = (desc || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const bullets: string[] = [];
  const paragraphs: string[] = [];

  for (const line of lines) {
    if (line.startsWith("- ")) bullets.push(line.slice(2).trim());
    else if (line.startsWith("• ")) bullets.push(line.slice(2).trim());
    else paragraphs.push(line);
  }

  return { bullets, paragraphs };
}
