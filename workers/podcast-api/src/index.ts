import { parseFeed } from "@rowanmanning/feed-parser";
import { Hono } from "hono";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=60",
} as const;

type Environment = {
  readonly feeds: KVNamespace;
};
const app = new Hono<{ Bindings: Environment }>();

app.get("/api/feed", async (c) => {
  const url = c.req.query("url");

  if (!url) {
    return c.json({ error: "Missing URL" }, 400, headers);
  }

  try {
    const feedUrl = new URL(url);
    if (feedUrl.protocol !== "https:" && feedUrl.protocol !== "http:") {
      return c.json({ error: "Invalid URL" }, 400, headers);
    }

    const key = feedUrl.toString();
    const cachedFeed = await c.env.feeds.get(key, "text");
    if (cachedFeed) {
      return c.json({ data: JSON.parse(cachedFeed) }, 200, headers);
    }

    const body = await fetch(url);
    const xml = await body.text();
    const feed = parseFeed(xml);

    if (!feed) {
      return c.json({ error: "Invalid URL" }, 400, headers);
    }

    await c.env.feeds.put(key, JSON.stringify(feed), {
      expirationTtl: 60 * 60 * 30,
    });

    return c.json({ data: feed }, 200, headers);
  } catch {
    return c.json({ error: "Invalid URL" }, 400, headers);
  }
});

export default app;
