export type ParsedPropertyDescription = {
  title: string;
  paragraphs: string[];
  highlights: string[];
};

function cleanHeading(value: string) {
  return value.replace(/^(?:🏠|🏡|✨)\uFE0F?\s*/u, '').trim();
}

export function parsePropertyDescription(value: string): ParsedPropertyDescription {
  const lines = String(value || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]*•[ \t]*/g, '\n• ')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const textLines: string[] = [];
  const highlights: string[] = [];

  for (const line of lines) {
    const bullet = line.match(/^[•*-]\s*(.+)$/);
    if (bullet?.[1]) {
      highlights.push(bullet[1].trim());
    } else {
      textLines.push(line);
    }
  }

  const firstLine = textLines[0] || '';
  const hasHeading =
    /^(?:🏠|🏡|✨)/u.test(firstLine) ||
    (textLines.length > 1 && firstLine.length <= 100);

  return {
    title: hasHeading ? cleanHeading(firstLine) : '',
    paragraphs: hasHeading ? textLines.slice(1) : textLines,
    highlights,
  };
}
