/** Returns "Good morning" / "Good afternoon" / "Good evening" based on current hour */
export const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

/**
 * Given a reply text, returns two AI-rephrased variants.
 * Returns a tuple: [formal rephrasing, concise rephrasing]
 */
export const generateRephrasings = (text: string): [string, string] => {
  const trimmed = text.trim();
  const sentence =
    trimmed.endsWith(".") || trimmed.endsWith("!") || trimmed.endsWith("?")
      ? trimmed
      : trimmed + ".";
  const r1 = `Thank you for raising this. ${sentence} I hope this perspective is helpful — feel free to follow up with any questions.`;
  const words = trimmed.split(" ");
  const shortText = words.length > 18 ? words.slice(0, 18).join(" ") + "…" : trimmed;
  const endsWithPunct = [".", "!", "?", "…"].some((p) => shortText.endsWith(p));
  const r2 = `${shortText}${endsWithPunct ? "" : "."} Hope this helps the community!`;
  return [r1, r2];
};
