const BASE = "https://www.googleapis.com/youtube/v3";
const KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

async function get(path, params) {
  if (!KEY) throw new Error("Missing API key. Add VITE_YOUTUBE_API_KEY to your .env file.");
  const url = new URL(`${BASE}/${path}`);
  Object.entries({ ...params, key: KEY }).forEach(([k, v]) => {
    if (v !== undefined && v !== "") url.searchParams.set(k, v);
  });
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Request failed (${res.status})`);
  return data;
}

export async function searchVideos(query, pageToken) {
  const search = await get("search", {
    part: "snippet",
    type: "video",
    maxResults: 12,
    safeSearch: "moderate",
    q: query,
    pageToken,
  });

  const ids = search.items.map((i) => i.id.videoId).join(",");
  const details = ids
    ? await get("videos", { part: "contentDetails,statistics", id: ids })
    : { items: [] };
  const byId = Object.fromEntries(details.items.map((d) => [d.id, d]));

  const videos = search.items.map((item) => {
    const d = byId[item.id.videoId];
    return {
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnail:
        item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      duration: d?.contentDetails?.duration,
      views: d?.statistics?.viewCount,
    };
  });

  return { videos, nextPageToken: search.nextPageToken };
}
