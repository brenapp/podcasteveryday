import { parseFeed } from "@rowanmanning/feed-parser";
import { Feed } from "@rowanmanning/feed-parser/lib/feed/base";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

export function usePodcastFeed(
  rss?: string,
  options?: Partial<Omit<UseQueryOptions<Feed | null>, "queryKey" | "queryFn">>
): UseQueryResult<Feed | null> {
  return useQuery({
    queryKey: ["rss", rss],
    queryFn: async () => {
      if (!rss) {
        return null;
      }

      const response = await fetch(rss);
      const xml = await response.text();
      return parseFeed(xml);
    },
    refetchOnWindowFocus: false,
    ...options,
  });
}
