import { Feed } from "@rowanmanning/feed-parser/lib/feed/base";

export type PodcastPreviewProps = {
  feed: Feed;
};

export const PodcastPreview: React.FC<PodcastPreviewProps> = ({ feed }) => {
  return (
    <section className="preview">
      <aside>
        <img src={feed.image?.url} alt={feed.image?.title ?? undefined} />
      </aside>
      <div>
        <h3>{feed.title}</h3>
        <p>{feed.description}</p>
        {feed.url ? <a href={feed.url}>{feed.url}</a> : null}
      </div>
    </section>
  );
};
