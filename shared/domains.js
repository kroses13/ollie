export const DISTRACTION_DOMAINS = Object.freeze([
  Object.freeze({ service: "YouTube", hostname: "youtube.com" }),
  Object.freeze({ service: "YouTube", hostname: "youtu.be" }),
  Object.freeze({ service: "X", hostname: "x.com" }),
  Object.freeze({ service: "X", hostname: "twitter.com" }),
  Object.freeze({ service: "Reddit", hostname: "reddit.com" }),
  Object.freeze({ service: "Instagram", hostname: "instagram.com" }),
  Object.freeze({ service: "TikTok", hostname: "tiktok.com" }),
]);

export function normalizeHostname(hostname) {
  if (typeof hostname !== "string") {
    return "";
  }

  return hostname.trim().toLowerCase().replace(/\.$/, "");
}

export function hostnameMatchesDomain(hostname, domain) {
  const normalizedHostname = normalizeHostname(hostname);
  const normalizedDomain = normalizeHostname(domain);
  if (!normalizedHostname || !normalizedDomain) {
    return false;
  }

  return (
    normalizedHostname === normalizedDomain ||
    normalizedHostname.endsWith(`.${normalizedDomain}`)
  );
}

export function classifyDistractionUrl(url) {
  if (typeof url !== "string" || !/^https?:/i.test(url)) {
    return { hostname: "", isDistracting: false, service: null };
  }

  try {
    const hostname = normalizeHostname(new URL(url).hostname);
    const match = DISTRACTION_DOMAINS.find((entry) =>
      hostnameMatchesDomain(hostname, entry.hostname),
    );

    return {
      hostname,
      isDistracting: Boolean(match),
      service: match?.service ?? null,
    };
  } catch {
    return { hostname: "", isDistracting: false, service: null };
  }
}
