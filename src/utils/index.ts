export function formatDate(timestamp: string): string {
  if (timestamp.length < 12) return timestamp;
  const year = timestamp.slice(0, 4);
  const month = timestamp.slice(4, 6);
  const day = timestamp.slice(6, 8);
  const hour = timestamp.slice(8, 10);
  const minute = timestamp.slice(10, 12);

  return `${year}-${month}-${day} ${hour}:${minute}`;
}

export function getEra(timestamp: string): string {
  if (timestamp.length < 4) return "";
  const year = parseInt(timestamp.slice(0, 4), 10);
  if (isNaN(year)) return "";
  if (year < 1996) return "Early Web";
  if (year < 2001) return "Dot-com Era";
  if (year < 2004) return "Post Bubble";
  if (year < 2007) return "Web 2.0 Rise";
  if (year < 2010) return "Social Emergence";
  if (year < 2014) return "Mobile Shift";
  if (year < 2018) return "Modern Web";
  if (year < 2022) return "Contemporary";
  return "Current Era";
}

export function getWaybackEmbedUrl(waybackUrl: string): string {
  return waybackUrl
    .replace(/^http:\/\//, "https://")
    .replace(/\/web\/(\d{14})\//, '/web/$1if_/');
}

export function normalizeUrl(input: string): string {
  const cleaned = input.trim().toLowerCase();

  let url = cleaned;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  try {
    const parsed = new URL(url);
    let hostname = parsed.hostname;

    if (hostname.startsWith("www.")) {
      hostname = hostname.slice(4);
    }

    return hostname;
  } catch {
    let domain = cleaned.replace(/^(https?:\/\/)?/, "").replace(/www\./, "").replace(/\/.*$/, "");
    domain = domain.replace(/:.*$/, "");
    return domain;
  }
}
