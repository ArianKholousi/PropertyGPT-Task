# Property Search and Map Explorer

A full-stack property listing search application built with Next.js 14+, featuring real-time updates, interactive maps, and saved searches.

## Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- SQLite (included via better-sqlite3)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npm run db:migrate
npm run db:seed
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── listings/      # Listings API
│   │   ├── stream/        # SSE realtime stream
│   │   └── saved-search/  # Saved searches API
│   ├── listing/[id]/      # Property details page
│   ├── saved-search/      # Saved search form
│   └── page.tsx           # Search page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── MiniMap.tsx       # Interactive map component
│   ├── SearchFilters.tsx # Filter controls
│   └── ...
├── db/                    # Database schema and migrations
├── lib/                   # Utilities and helpers
├── hooks/                 # Custom React hooks
└── scripts/              # Database scripts
```

## Features

### 1. Search Page (`/`)

- **Server-Side Rendered** with ISR (revalidates every 60 seconds)
- **Filterable listings** by:
  - Address search (text)
  - Price range (min/max)
  - Bedrooms and bathrooms (minimum)
- **URL-synced filters** - shareable search URLs
- **Interactive mini-map** showing all listings
- **Realtime updates** via SSE - new listings appear with visual highlights
- **Responsive design** - mobile-friendly layout

### 2. Property Details Page (`/listing/[id]`)

- **Server-Side Rendered** for SEO
- Displays full property information
- **Similar nearby** section showing properties within 5km radius
- **SEO optimized** with dynamic metadata

### 3. Saved Searches (`/saved-search`)

- Create saved searches with all filter options
- Form validation with Zod
- List of saved searches with "Apply" buttons
- Guest mode support (user_id = "guest")

### 4. Realtime Updates (SSE)

- Server-Sent Events stream at `/api/stream/listings`
- Simulates listing updates every 10-15 seconds
- New listings matching current filters are highlighted
- Connection status indicator
- Automatic reconnection on errors

### 5. Mini-Map Component

- Canvas-based map rendering
- Interactive markers with hover tooltips
- Click markers to navigate to listing details
- Synchronized selection with listing cards
- Accessible with ARIA labels

## Database

- **ORM**: Drizzle ORM
- **Database**: SQLite (development)
- **Schema**: See `db/schema.ts`
- **Migrations**: Generated with `npm run db:generate`
- **Seed Data**: From `sample-data.json` (20 Dubai property listings)

### Database Commands

```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open Drizzle Studio (optional)
npm run db:studio
```

## API Routes

### `GET /api/listings`

Query parameters:
- `q` - Address search
- `min_price`, `max_price` - Price range
- `beds_min`, `baths_min` - Minimum bedrooms/bathrooms
- `page`, `limit` - Pagination (default: page=1, limit=20, max=50)
- `sort_by` - "updated_at" or "price"
- `sort_order` - "asc" or "desc"

Returns: `{ items: Listing[], total: number }`

### `GET /api/listings/nearby`

Query parameters:
- `lat`, `lng` - Center coordinates
- `radius_km` - Search radius (default: 5)
- `limit` - Max results (default: 5, max: 20)

Returns: `{ items: Listing[] }`

### `GET /api/saved-search`

Returns saved searches for current user (guest mode: user_id="guest")

### `POST /api/saved-search`

Body: Saved search fields (name, q, minPrice, maxPrice, etc.)

Returns: Created saved search

### `GET /api/stream/listings`

Server-Sent Events stream for realtime listing updates.

Events:
- `connected` - Initial connection
- `heartbeat` - Keep-alive (every 15s)
- `listing_updated` - New/updated listing

## Caching Strategy

- **ISR**: Search and details pages revalidate every 60 seconds
- **API Cache**: `Cache-Control: public, max-age=30, s-maxage=60`
- **Client Cache**: React state for realtime updates

## Performance & SEO

- Server-Side Rendering for initial load
- Dynamic metadata for SEO (titles, descriptions, OpenGraph)

## Accessibility

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management
- Screen reader friendly


## Bonus Features Implemented

### 1. AI Assist (OpenAI with graceful fallback)

- **Listing Summaries**: Visit any listing detail page to see an AI-generated 2-sentence marketing blurb
  - Endpoint: `/api/ai/summarize?id=<listing-id>`
  - Falls back to deterministic stub if `OPENAI_API_KEY` is not set

- **Query Rewriting**: On the search page, enter a query and click "✨ Rewrite my query" to get an AI-optimized search query
  - Endpoint: `/api/ai/rewrite-query` (POST)
  - Automatically improves search queries for better results

**Setup**: Add `OPENAI_API_KEY` to your environment variables (optional - works without it using stubs)

### 2. Optimistic Saved Search UX

- Saved searches appear immediately in the UI when created (before server confirmation)
- Visual indicator shows "Saving..." state for optimistic updates
- Automatic rollback if server rejects the save
- Smooth user experience with instant feedback

### 3. E2E Testing

- Cypress test suite covering the happy path:
  - Search with filters
  - Open listing detail
  - Save search
  - Verify SSE connection

**Run tests**:
```bash
npm run test:e2e        # Run tests headlessly
npm run test:e2e:open   # Open Cypress UI
```

## License

ISC
