import { useCallback, useMemo, useState } from "react";
import { Month } from "./components/Month";
import { Spinner } from "./components/Spinner";
import { PodcastPreview } from "./components/Preview";
import { FeedItem } from "@rowanmanning/feed-parser/lib/feed/item/base";
import { usePodcastFeed } from "./hooks/rss";
import { useViewTransition } from "use-view-transitions/react";

const suggestions = [
  // A Problem Squared
  "https://anchor.fm/s/eb804d78/podcast/rss",

  // Lateral with Tom Scott
  "https://feeds.megaphone.fm/lateralcast",
];

const initial = new URLSearchParams(window.location.search).get("rss") ?? "";

type Month =
  | "January"
  | "February"
  | "March"
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "November"
  | "December";

type ItemsByDate = Record<Month, Record<number, FeedItem[]>>;

const DAY_COUNTS: Record<Month, number> = {
  January: 31,
  February: 29,
  March: 31,
  April: 30,
  May: 31,
  June: 30,
  July: 31,
  August: 31,
  September: 30,
  October: 31,
  November: 30,
  December: 31,
};

const TOTAL_DAYS = Object.values(DAY_COUNTS).reduce((a, b) => a + b, 0);

export const App: React.FC = () => {
  // RSS
  const [rss, setRss] = useState<string>(initial);

  const { startViewTransition } = useViewTransition();
  const transitionRss = useCallback(
    (url: string) => {
      startViewTransition(() => {
        window.history.pushState(null, "", `?rss=${encodeURIComponent(url)}`);
        setRss(url);
      });
    },
    [startViewTransition]
  );

  // Handle back button
  useMemo(() => {
    const handlePopState = () => {
      const rss = new URLSearchParams(window.location.search).get("rss") ?? "";
      setRss(rss);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const isValid = useMemo(() => {
    try {
      const url = new URL(rss);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, [rss]);

  const onBlur = useCallback(() => {}, []);

  const { data, isFetching, isError, error } = usePodcastFeed(rss, {
    enabled: rss.length > 0,
  });

  const publishedDates = useMemo(() => {
    const counts: ItemsByDate = {
      January: {},
      February: {},
      March: {},
      April: {},
      May: {},
      June: {},
      July: {},
      August: {},
      September: {},
      October: {},
      November: {},
      December: {},
    };

    if (!data) {
      return counts;
    }

    for (const item of data.items) {
      const timestamp = item.published ?? item.updated;
      if (!timestamp) {
        continue;
      }

      const month = timestamp.toLocaleString("default", {
        month: "long",
      }) as Month;
      const date = timestamp.getDate() - 1;

      if (!counts[month][date]) {
        counts[month][date] = [];
      }

      counts[month][date].push(item);
    }

    return counts;
  }, [data]);

  const totalDays = useMemo(() => {
    let count = 0;

    for (const month in publishedDates) {
      for (const day in publishedDates[month as Month]) {
        if (publishedDates[month as Month][day].length > 0) {
          count++;
        }
      }
    }

    return count;
  }, [publishedDates]);

  const oldest = useMemo(() => {
    let oldest = Date.now();
    for (const item of data?.items ?? []) {
      const timestamp = (item.published ?? item.updated)?.getTime();
      if (timestamp && timestamp < oldest) {
        oldest = timestamp;
      }
    }

    return new Date(oldest);
  }, [data]);

  const percentage = useMemo(() => (100 * totalDays) / TOTAL_DAYS, [totalDays]);

  return (
    <>
      <header>
        <h3>Enter a Podcast RSS feed below.</h3>
        <input
          className="search"
          type="url"
          value={rss}
          placeholder="Enter RSS feed URL"
          aria-invalid={rss.length > 0 && !isValid}
          onChange={(e) => setRss(e.currentTarget.value)}
          onBlur={onBlur}
        />
      </header>
      {rss.length < 1 && !isFetching ? (
        <section>
          <h3>Or, try these!</h3>
          {suggestions.map((url) => (
            <PodcastPreview key={url} url={url}>
              <div className="actions">
                <button onClick={() => transitionRss(url)}>
                  <span>Use this feed</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>
              </div>
            </PodcastPreview>
          ))}
        </section>
      ) : null}
      <Spinner show={rss.length > 0 && isFetching} />
      {isError && !isFetching ? <p className="error">{error.message}</p> : null}
      {data ? (
        <>
          <PodcastPreview url={rss} />
          <section className="callout">
            <p>
              Since {oldest.toLocaleDateString()}, <strong>{data.title}</strong>{" "}
              has published <strong>{data.items.length}</strong> episodes. Those
              episodes have spanned {totalDays} dates out of {TOTAL_DAYS} total
              on the calendar ({((100 * totalDays) / TOTAL_DAYS).toFixed(2)}%).
            </p>
            <div className="numbers">
              <figure>
                <h2>{data.items.length}</h2>
                <figcaption>Episodes</figcaption>
              </figure>
              <figure>
                <h2>{totalDays}</h2>
                <figcaption>Total Dates</figcaption>
              </figure>
              <figure>
                <h2>{percentage.toFixed(2)}%</h2>
                <figcaption>Total Days</figcaption>
              </figure>
              <figure>
                <h2>{oldest.toLocaleDateString()}</h2>
                <figcaption>Oldest Episode</figcaption>
              </figure>
            </div>
          </section>
          <main>
            <Month
              title="January"
              days={DAY_COUNTS.January}
              highlighted={publishedDates["January"]}
            />
            <Month
              title="February"
              days={DAY_COUNTS.February}
              highlighted={publishedDates["February"]}
            />
            <Month
              title="March"
              days={DAY_COUNTS.March}
              highlighted={publishedDates["March"]}
            />
            <Month
              title="April"
              days={DAY_COUNTS.April}
              highlighted={publishedDates["April"]}
            />
            <Month
              title="May"
              days={DAY_COUNTS.May}
              highlighted={publishedDates["May"]}
            />
            <Month
              title="June"
              days={DAY_COUNTS.June}
              highlighted={publishedDates["June"]}
            />
            <Month
              title="July"
              days={DAY_COUNTS.July}
              highlighted={publishedDates["July"]}
            />
            <Month
              title="August"
              days={DAY_COUNTS.August}
              highlighted={publishedDates["August"]}
            />
            <Month
              title="September"
              days={DAY_COUNTS.September}
              highlighted={publishedDates["September"]}
            />
            <Month
              title="October"
              days={DAY_COUNTS.October}
              highlighted={publishedDates["October"]}
            />
            <Month
              title="November"
              days={DAY_COUNTS.November}
              highlighted={publishedDates["November"]}
            />
            <Month
              title="December"
              days={DAY_COUNTS.December}
              highlighted={publishedDates["December"]}
            />
          </main>
        </>
      ) : null}
    </>
  );
};

export default App;
