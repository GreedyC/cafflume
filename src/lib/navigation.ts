export function safeAppDestination(
  value: string | null,
  origin: string
) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001F\u007F]/u.test(value)
  ) {
    return "/";
  }

  try {
    const destination = new URL(value, origin);
    const isKnownPath =
      destination.pathname === "/" ||
      /^\/(?:beans|brews|cuppings)(?:\/|$)/u.test(destination.pathname);
    if (destination.origin !== origin || !isKnownPath) {
      return "/";
    }
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return "/";
  }
}
