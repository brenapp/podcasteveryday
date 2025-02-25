import { FeedItem } from "@rowanmanning/feed-parser/lib/feed/item/base";
import { useMemo, useState } from "react";

export type MonthProps = {
  title: string;
  days: number;
  highlighted: Record<number, FeedItem[]>;
};

export const Month: React.FC<MonthProps> = ({ title, days, highlighted }) => {
  const [isOpen, setIsOpen] = useState(false);

  const totalDays = useMemo(() => {
    let count = 0;

    for (const key in highlighted) {
      if (Object.hasOwn(highlighted, key)) {
        count += highlighted[key].length > 0 ? 1 : 0;
      }
    }

    return count;
  }, [highlighted]);

  return (
    <div className="month">
      <h3 className="title">
        <span>
          {title} ({totalDays}/{days} days)
        </span>
        <button className="icon-button" onClick={() => setIsOpen((o) => !o)}>
          <span>{isOpen ? "Less" : "More"}</span>
        </button>
      </h3>
      {isOpen ? (
        Object.entries(highlighted).map(([day, items]) => (
          <div key={day}>
            <h4>
              {title} {+day + 1}
            </h4>
            <ul>
              {items.map((item) => (
                <li key={item.url}>
                  <a href={item.url ?? "#"} target="_blank" rel="noreferrer">
                    {item.title}
                  </a>
                  &nbsp;
                  <em>
                    (
                    {item.published
                      ? new Date(item.published).toLocaleDateString()
                      : null}
                    )
                  </em>
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <div className="day-container">
          {Array.from({ length: days }, (_, i) => (
            <div
              key={i}
              className="day"
              data-highlighted={
                Object.hasOwn(highlighted, i) && highlighted[i].length > 0
              }
            >
              {i + 1}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
