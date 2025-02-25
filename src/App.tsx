import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { Month } from "./components/Month";
import { Spinner } from "./components/Spinner";
import { parseFeed } from "@rowanmanning/feed-parser";
import { PodcastPreview } from "./components/Preview";
import { FeedItem } from "@rowanmanning/feed-parser/lib/feed/item/base";

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
  const isValid = useMemo(() => {
    try {
      const url = new URL(rss);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, [rss]);

  const onBlur = useCallback(() => {}, []);

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["rss", rss],
    queryFn: async () => {
      if (!isValid) {
        return null;
      }

      const response = await fetch(rss);
      const xml = await response.text();
      return parseFeed(xml);
    },
    enabled: isValid,
    refetchOnWindowFocus: false,
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

  return (
    <>
      <header>
        <h2>Podcast Every Day</h2>
        <p>To begin, enter the RSS feed of a podcast below.</p>
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
      <Spinner show={rss.length > 0 && isFetching} />
      {isError && !isFetching ? <p className="error">{error.message}</p> : null}
      {data ? (
        <>
          <PodcastPreview feed={data} />
          <section className="callout-section">
            <p>
              Since {oldest.toLocaleDateString()}, <strong>{data.title}</strong>{" "}
              has published <strong>{data.items.length}</strong> episodes. Those
              episodes have spanned {totalDays} days out of {TOTAL_DAYS} total
              on the calendar ({((100 * totalDays) / TOTAL_DAYS).toFixed(2)}%).
            </p>
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
