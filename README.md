# 🎵 Sonara - Modern Music Player (Next.js + Supabase)

Sonara is an MVP-ready music player web app with:

- Next.js App Router + TypeScript
- Tailwind CSS (dark premium UI)
- Zustand state management
- Howler.js playback engine
- Web Audio API equalizer + analyzer visualizer
- WaveSurfer.js waveform rendering
- Supabase Auth, Postgres, and Storage

## 🧱 Architecture Overview

### 🖥️ Frontend layers

1. `app/` routes and layouts
- Auth and protected route groups
- Feature pages: Home, Library, Playlists, Favorites, Recently Played

2. `components/` shared UI shell
- Sidebar navigation
- Page headers
- Persistent bottom player bar

3. `features/` domain modules
- `audio`: runtime provider, engine hooks, equalizer, visualizer, waveform
- `tracks`: upload + list + search/filter hooks
- `playlists`: playlist CRUD + detail management
- `favorites`: liked tracks hooks
- `history`: recently played hooks/components
- `auth`: login/register UI

4. `stores/` state layer
- Global player queue/playback store (Zustand)
- Equalizer band/preset store (Zustand)

5. `lib/` infrastructure
- Typed Supabase browser/server/middleware clients
- Utility helpers
- Environment variable access

### 🔊 Audio architecture

- Playback uses Howler for robust audio loading/playback.
- Audio graph is built via Web Audio API from Howler nodes:
  - Source node -> 5 BiquadFilterNodes (EQ) -> AnalyserNode -> master output
- Equalizer updates are real-time through Zustand store changes.
- Visualizer reads frequency data from `AnalyserNode` via `requestAnimationFrame`.
- Waveform uses WaveSurfer as visual waveform/seek surface.
- Runtime provider centralizes playback actions and keyboard shortcuts.

### 🗃️ Data architecture

- Supabase Auth controls sessions.
- Supabase Storage stores audio + cover files.
- Supabase Postgres stores metadata and user relations.
- RLS policies restrict user-owned data writes and protected reads.

## 🗂️ Folder Structure

```text
📦sonara-app/
├── 📁 public
│   ├── 🖼️ file.svg
│   ├── 🖼️ globe.svg
│   ├── 🖼️ next.svg
│   ├── 🖼️ vercel.svg
│   └── 🖼️ window.svg
├── 📁 src
│   ├── 📁 app
│   │   ├── 📁 (app)
│   │   │   ├── 📁 favorites
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 home
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 library
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 playlists
│   │   │   │   ├── 📁 [id]
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 recently-played
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📄 error.tsx
│   │   │   ├── 📄 layout.tsx
│   │   │   └── 📄 loading.tsx
│   │   ├── 📁 (auth)
│   │   │   └── 📁 auth
│   │   │       ├── 📁 login
│   │   │       │   └── 📄 page.tsx
│   │   │       ├── 📁 register
│   │   │       │   └── 📄 page.tsx
│   │   │       ├── 📄 layout.tsx
│   │   │       └── 📄 page.tsx
│   │   ├── 📁 forgot-password
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 reset-password
│   │   │   └── 📄 page.tsx
│   │   ├── 📄 favicon.ico
│   │   ├── 🎨 globals.css
│   │   ├── 📄 layout.tsx
│   │   └── 📄 page.tsx
│   ├── 📁 components
│   │   ├── 📁 layout
│   │   │   ├── 📄 app-shell.tsx
│   │   │   ├── 📄 language-toggle.tsx
│   │   │   ├── 📄 logout-confirm-modal.tsx
│   │   │   ├── 📄 page-header.tsx
│   │   │   ├── 📄 session-panel.tsx
│   │   │   ├── 📄 sidebar-nav.tsx
│   │   │   └── 📄 theme-toggle.tsx
│   │   ├── 📁 player
│   │   │   ├── 📄 player-bar.tsx
│   │   │   └── 📄 queue-panel.tsx
│   │   ├── 📁 providers
│   │   │   ├── 📄 app-providers.tsx
│   │   │   ├── 📄 i18n-provider.tsx
│   │   │   └── 📄 theme-provider.tsx
│   │   └── 📁 ui
│   │       ├── 📄 button.tsx
│   │       ├── 📄 input.tsx
│   │       ├── 📄 slider.tsx
│   │       └── 📄 sonner.tsx
│   ├── 📁 features
│   │   ├── 📁 audio
│   │   │   ├── 📁 components
│   │   │   │   ├── 📄 audio-runtime-provider.tsx
│   │   │   │   ├── 📄 audio-visualizer.tsx
│   │   │   │   ├── 📄 equalizer-panel.tsx
│   │   │   │   └── 📄 player-waveform.tsx
│   │   │   ├── 📁 hooks
│   │   │   │   ├── 📄 use-audio-runtime.ts
│   │   │   │   ├── 📄 use-playback-shortcuts.ts
│   │   │   │   ├── 📄 use-visualizer.ts
│   │   │   │   └── 📄 use-waveform.ts
│   │   │   ├── 📁 lib
│   │   │   │   ├── 📄 audio-engine.ts
│   │   │   │   └── 📄 equalizer-presets.ts
│   │   │   └── 📁 stores
│   │   │       └── 📄 equalizer-store.ts
│   │   ├── 📁 auth
│   │   │   └── 📁 components
│   │   │       ├── 📄 auth-form.tsx
│   │   │       ├── 📄 auth-toast-content.tsx
│   │   │       ├── 📄 forgot-password-form.tsx
│   │   │       └── 📄 reset-password-form.tsx
│   │   ├── 📁 favorites
│   │   │   └── 📁 hooks
│   │   │       └── 📄 use-favorites.ts
│   │   ├── 📁 history
│   │   │   ├── 📁 components
│   │   │   │   └── 📄 recently-played-list.tsx
│   │   │   └── 📁 hooks
│   │   │       └── 📄 use-recently-played.ts
│   │   ├── 📁 playlists
│   │   │   ├── 📁 components
│   │   │   │   ├── 📄 playlist-detail-manager.tsx
│   │   │   │   └── 📄 playlist-list.tsx
│   │   │   └── 📁 hooks
│   │   │       ├── 📄 use-playlist-detail.ts
│   │   │       └── 📄 use-playlists.ts
│   │   └── 📁 tracks
│   │       ├── 📁 components
│   │       │   ├── 📄 album-grid.tsx
│   │       │   ├── 📄 track-list.tsx
│   │       │   └── 📄 upload-track-form.tsx
│   │       └── 📁 hooks
│   │           ├── 📄 use-track-upload.ts
│   │           └── 📄 use-tracks.ts
│   ├── 📁 hooks
│   │   ├── 📄 use-logout-confirm.tsx
│   │   └── 📄 use-session-user.ts
│   ├── 📁 lib
│   │   ├── 📁 supabase
│   │   │   ├── 📄 browser.ts
│   │   │   ├── 📄 error.ts
│   │   │   ├── 📄 middleware.ts
│   │   │   └── 📄 server.ts
│   │   ├── 📄 client.ts
│   │   ├── 📄 env.ts
│   │   ├── 📄 i18n.ts
│   │   ├── 📄 middleware.ts
│   │   ├── 📄 server.ts
│   │   └── 📄 utils.ts
│   ├── 📁 stores
│   │   └── 📄 player-store.ts
│   └── 📁 types
│       ├── 📄 database.ts
│       └── 📄 models.ts
├── 📁 supabase
│   └── 📄 schema.sql
├── ⚙️ .gitignore
├── ⚙️ .prettierignore
├── ⚙️ .prettierrc
├── 📝 AGENTS.md
├── 📝 README.md
├── ⚙️ components.json
├── 📄 eslint.config.mjs
├── 📄 middleware.ts
├── 📄 next.config.ts
├── ⚙️ package-lock.json
├── ⚙️ package.json
├── 📄 postcss.config.mjs
└── ⚙️ tsconfig.json
```

## 🛢️ Database Schema and Supabase Definitions

Full SQL is in: `supabase/schema.sql`

### 📋 Core tables

- `users`
- `tracks`
- `playlists`
- `playlist_tracks`
- `favorites`
- `recently_played`
- `equalizer_presets`

### 🏷️ Track metadata fields

`tracks` stores:

- `title`
- `artist`
- `album`
- `duration`
- `genre`
- `cover_url`
- `audio_url`

### 🪣 Storage buckets

- `track-audio` (public read, owner-folder write)
- `track-covers` (public read, owner-folder write)

### 🔒 RLS strategy

- User-owned tables (`playlists`, `favorites`, `recently_played`, `equalizer_presets`, `users`) enforce `auth.uid()` ownership.
- `tracks` allows authenticated read, owner write/update/delete.
- `playlist_tracks` policies enforce ownership by joining parent playlist.
- Storage policies restrict writes to folder prefix = `auth.uid()`.

## ✅ Implemented Product Flows

1. Auth flow
- Register/sign-in with Supabase email/password
- Protected routes redirect to `/auth` if unauthenticated
- Logout from sidebar

2. Upload flow
- Upload audio + optional cover
- Duration extracted from uploaded audio metadata
- Files uploaded to Supabase Storage
- Metadata inserted into `tracks`

3. Playlist flow
- Create playlists
- Edit playlist name/description
- Delete playlists
- Add/remove tracks from playlist

4. Favorites flow
- Toggle favorite per track
- Favorites page lists favorited tracks

5. Recently played flow
- On track start, upsert into `recently_played`
- Recently Played page sorted by latest `played_at`

6. Player flow
- Play/pause/next/previous
- Seek bar + current time/duration
- Volume, shuffle, repeat modes
- Queue panel with track selection
- Keyboard shortcuts:
  - `Space`: play/pause
  - `Ctrl/Cmd + ArrowRight`: next
  - `Ctrl/Cmd + ArrowLeft`: previous
  - `M`: mute/unmute

7. Audio visualization flow
- WaveSurfer waveform display + seeking
- Real-time canvas frequency bars from `AnalyserNode`
- Visualizer pauses frequency updates when audio is paused

8. Equalizer flow
- 5-band EQ: 60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz
- Gain range: -12dB to +12dB
- Presets: Flat, Pop, Rock, Jazz, Classical, Bass Boost
- Reset button
- Real-time effect on currently playing track

## 🌱 Environment Variables

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

## 🚀 Step-by-Step Setup

1. Install dependencies

```bash
npm install
```

2. Create Supabase project
- Enable Email auth provider
- Copy project URL and anon key

3. Configure environment

```bash
cp .env.example .env.local
```

Fill in real values.

4. Apply database and storage SQL
- Open Supabase SQL Editor
- Run `supabase/schema.sql`

5. Run the app

```bash
npm run dev
```

6. Open app
- Visit `http://localhost:3000`
- Register a user
- Upload tracks in Library
- Create playlists and start playback

7. Production checks

```bash
npm run lint
npm run build
```

Both commands pass in this implementation.
