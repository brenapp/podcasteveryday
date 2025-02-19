import { FeedItem } from "@rowanmanning/feed-parser/lib/feed/item/base";

export type MonthProps = {
  title: string;
  days: number;
  highlighted: Record<number, FeedItem[]>;
};

export const Month: React.FC<MonthProps> = ({ title, days, highlighted }) => {
  return (
    <div className="month">
      <h3 className="title">{title}</h3>
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
  );
};
