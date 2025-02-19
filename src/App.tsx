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

  const { data, isFetching } = useQuery({
    queryKey: ["rss", rss],
    queryFn: async () => {
      if (!isValid) {
        return;
      }

      const response = await fetch(rss);
      const xml = await response.text();
      return parseFeed(xml);
    },
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
      const date = timestamp.getDate();

      if (!counts[month][date]) {
        counts[month][date] = [];
      }

      counts[month][date].push(item);
    }

    return counts;
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
      {data ? (
        <>
          <PodcastPreview feed={data} />
          <main>
            <Month
              title="January"
              days={31}
              highlighted={publishedDates["January"]}
            />
            <Month
              title="February"
              days={29}
              highlighted={publishedDates["February"]}
            />
            <Month
              title="March"
              days={31}
              highlighted={publishedDates["March"]}
            />
            <Month
              title="April"
              days={30}
              highlighted={publishedDates["April"]}
            />
            <Month title="May" days={31} highlighted={publishedDates["May"]} />
            <Month
              title="June"
              days={30}
              highlighted={publishedDates["June"]}
            />
            <Month
              title="July"
              days={31}
              highlighted={publishedDates["July"]}
            />
            <Month
              title="August"
              days={31}
              highlighted={publishedDates["August"]}
            />
            <Month
              title="September"
              days={30}
              highlighted={publishedDates["September"]}
            />
            <Month
              title="October"
              days={31}
              highlighted={publishedDates["October"]}
            />
            <Month
              title="November"
              days={30}
              highlighted={publishedDates["November"]}
            />
            <Month
              title="December"
              days={31}
              highlighted={publishedDates["December"]}
            />
          </main>
        </>
      ) : null}
    </>
  );
};

export default App;
