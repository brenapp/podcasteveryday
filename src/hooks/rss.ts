import { type Feed } from "@rowanmanning/feed-parser/lib/feed/base";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

export type ApiResponse =
  | {
      error: string;
      data: undefined;
    }
  | {
      error: undefined;
      data: Feed;
    };

const BASE_URL = import.meta.env.DEV
  ? "http://localhost:8787"
  : "https://podcast-api.bren.app";

function getFeed(url: string) {
  const requestUrl = new URL("/api/feed", BASE_URL);
  requestUrl.searchParams.set("url", url);
  return fetch(requestUrl).then(
    (response) => response.json() as Promise<ApiResponse>
  );
}

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

      const response = await getFeed(rss);
      if (response.error) {
        throw new Error(response.error);
      }

      return response.data ?? null;
    },
    refetchOnWindowFocus: false,
    ...options,
  });
}
