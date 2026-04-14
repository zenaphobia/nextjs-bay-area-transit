import { transit_realtime } from "gtfs-realtime-bindings";

export async function fetchFeed(url: string) {
  const res = await fetch(url);
  // console.log({ res });
  const buffer = await res.arrayBuffer();
  // console.log({ buffer });
  const feed = transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
  console.log({ feed });
  return feed;
}

export function getColorByLine(
  line: string,
  token: "bg" | "text" = "bg",
): string {
  if (line.startsWith("Blue")) {
    return token === "bg" ? "bg-blueline" : "text-blueline";
  } else if (line.startsWith("Red")) {
    return token === "bg" ? "bg-redline" : "text-redline";
  } else if (line.startsWith("Yellow")) {
    return token === "bg" ? "bg-yellowline" : "text-yellowline";
  } else if (line.startsWith("Green")) {
    return token === "bg" ? "bg-greenline" : "text-greenline";
  } else if (line.startsWith("Orange")) {
    return token === "bg" ? "bg-orangeline" : "text-orangeline";
  } else {
    return token === "bg" ? "bg-grayline" : "text-grayline";
  }
}
