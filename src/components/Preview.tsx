import { usePodcastFeed } from "../hooks/rss";

export type PodcastPreviewProps = {
  url: string;
};

export const PodcastPreview: React.FC<
  React.PropsWithChildren<PodcastPreviewProps>
> = ({ url, children }) => {
  const { data: feed } = usePodcastFeed(url, {});

  if (!feed) {
    return null;
  }

  return (
    <section className="preview" style={{ viewTransitionName: "preview-" + url }}>
      <aside>
        <img src={feed.image?.url} alt={feed.image?.title ?? undefined} />
      </aside>
      <div>
        <h3>{feed.title}</h3>
        <p>{feed.description}</p>
        {feed.url ? <a href={feed.url}>{feed.url}</a> : null}
        {children}
      </div>
    </section>
  );
};
