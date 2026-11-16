# Reel Finder

A small YouTube search app built with React (Vite) and the YouTube Data API v3.

## Get an API key
1. Go to Google Cloud Console and create a project.
2. Enable **YouTube Data API v3**.
3. Create an API key under Credentials.
4. Restrict it: *HTTP referrers* (your localhost and production domain) and *API restrictions* (YouTube Data API v3 only).

## Run locally
```bash
npm install
cp .env.example .env     # then paste your key
npm run dev
```

## Build
```bash
npm run build            # static output in dist/
```

## Deploy (Devopness)
This is a static site: build command `npm run build`, publish directory `dist`.
Set `VITE_YOUTUBE_API_KEY` as a build-time environment variable (Vite inlines it at build).

## Notes
- The key ships to the browser, so referrer restrictions are essential.
- Quota: each search costs 100 units (default 10,000/day), the video details lookup costs 1.
