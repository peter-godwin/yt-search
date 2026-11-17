import { useEffect, useRef, useState } from "react";
import { searchVideos } from "./api.js";
import { decode, formatDuration, formatViews, timeAgo } from "./format.js";

const SUGGESTIONS = ["lo-fi coding mix", "sourdough for beginners", "Lagos street food", "react hooks explained"];

export default function App() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [videos, setVideos] = useState([]);
  const [nextToken, setNextToken] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [active, setActive] = useState(null);

  async function run(q, token) {
    setLoading(true);
    setError("");
    try {
      const data = await searchVideos(q, token);
      setVideos((prev) => (token ? [...prev, ...data.videos] : data.videos));
      setNextToken(data.nextPageToken);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSubmitted(q);
    setVideos([]);
    setNextToken(undefined);
    run(q);
  }

  function pick(s) {
    setQuery(s);
    setSubmitted(s);
    setVideos([]);
    setNextToken(undefined);
    run(s);
  }

  return (
    <>
      <header className="top">
        <div className="top-inner">
          <h1 className="brand">Reel Finder</h1>
          <form className="search" onSubmit={onSubmit} role="search">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search YouTube videos"
              aria-label="Search YouTube videos"
            />
            <button type="submit" disabled={loading || !query.trim()}>
              Search
            </button>
          </form>
        </div>
      </header>

      <main className="wrap">
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {!submitted && !error && (
          <section className="empty">
            <h2>Find something to watch</h2>
            <p>Type a topic above, or start with one of these.</p>
            <div className="chips">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="chip" onClick={() => pick(s)}>
                  {s}
                </button>
              ))}
            </div>
          </section>
        )}

        {submitted && !loading && !error && videos.length === 0 && (
          <p className="note">No videos found for “{submitted}”. Try different keywords.</p>
        )}

        <ul className="grid">
          {videos.map((v) => (
            <li key={v.id}>
              <button className="video" onClick={() => setActive(v)}>
                <span className="thumb">
                  <img src={v.thumbnail} alt="" loading="lazy" />
                  {v.duration && <span className="badge">{formatDuration(v.duration)}</span>}
                </span>
                <span className="title">{decode(v.title)}</span>
                <span className="meta">{v.channel}</span>
                <span className="meta">
                  {[formatViews(v.views), timeAgo(v.publishedAt)].filter(Boolean).join(" • ")}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {loading && <p className="note">Loading…</p>}

        {nextToken && !loading && (
          <div className="more">
            <button className="secondary" onClick={() => run(submitted, nextToken)}>
              Load more
            </button>
          </div>
        )}
      </main>

      {active && <Player video={active} onClose={() => setActive(null)} />}
    </>
  );
}

function Player({ video, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="player"
        role="dialog"
        aria-modal="true"
        aria-label={decode(video.title)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="frame">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={decode(video.title)}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
        <div className="player-info">
          <div>
            <h2>{decode(video.title)}</h2>
            <p>{video.channel}</p>
          </div>
          <button ref={closeRef} className="secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
