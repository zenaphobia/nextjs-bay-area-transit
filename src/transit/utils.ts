import { transit_realtime } from "gtfs-realtime-bindings";

export async function fetchFeed(url: string) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const feed = transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
  console.debug({ feed });
  return feed;
}

export function getColorByLine(
  line: string | undefined,
  token: "bg" | "text" | "border" | "content" = "bg",
): string {
  if (!line) {
    if (token === "bg") return "bg-foreground";
    if (token === "text") return "text-foreground";
    if (token === "content") return "text-background";
    return "border-foreground";
  }

  if (line.startsWith("Blue")) {
    if (token === "bg") return "bg-blueline";
    if (token === "text") return "text-blueline";
    if (token === "content") return "text-blueline-content";
    return "border-blueline";
  } else if (line.startsWith("Red")) {
    if (token === "bg") return "bg-redline";
    if (token === "text") return "text-redline";
    if (token === "content") return "text-redline-content";
    return "border-redline";
  } else if (line.startsWith("Yellow")) {
    if (token === "bg") return "bg-yellowline";
    if (token === "text") return "text-yellowline";
    if (token === "content") return "text-yellowline-content";
    return "border-yellowline";
  } else if (line.startsWith("Green")) {
    if (token === "bg") return "bg-greenline";
    if (token === "text") return "text-greenline";
    if (token === "content") return "text-greenline-content";
    return "border-greenline";
  } else if (line.startsWith("Orange")) {
    if (token === "bg") return "bg-orangeline";
    if (token === "text") return "text-orangeline";
    if (token === "content") return "text-orangeline-content";
    return "border-orangeline";
  } else {
    if (token === "bg") return "bg-grayline";
    if (token === "text") return "text-grayline";
    if (token === "content") return "text-grayline-content";
    return "border-grayline";
  }
}
