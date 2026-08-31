# EMERO Website

A modern, database-driven, CMS-managed website for the EMERO emergency response ecosystem.

## Tech Stack

- **Next.js** (React + TypeScript)
- **Tailwind CSS**
- **Supabase** (PostgreSQL, Auth, Storage)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase/schema.sql`
3. Run `supabase/storage-setup.sql`
4. Run `supabase/seed-data.sql`
5. Create an admin user in Supabase Auth
6. Add their user ID to `admin_profiles` table:
   ```sql
   INSERT INTO admin_profiles (id, email, is_admin) VALUES ('user-uuid', 'admin@emero.com', true);
   ```

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

Visit:
- **Website**: http://localhost:3000
- **Admin**: http://localhost:3000/admin

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── admin/
│       ├── layout.tsx        # Admin layout with sidebar
│       ├── page.tsx          # Admin dashboard
│       ├── sections/         # Section management
│       ├── pages/            # Page management
│       ├── navbar/           # Navbar management
│       ├── prototype/        # Prototype screen management
│       ├── gallery/          # Gallery management
│       ├── videos/           # YouTube video management
│       ├── surveys/          # Survey management
│       ├── feedback/         # Feedback management
│       └── contributors/     # Contributor management
├── components/
│   ├── Navbar.tsx            # Public navbar
│   ├── Footer.tsx            # Footer
│   ├── HeroSection.tsx       # Hero section
│   ├── ProblemSection.tsx    # Problem section
│   ├── SolutionSection.tsx   # Solution + scenarios
│   ├── HowItWorksSection.tsx # How it works workflow
│   ├── MapSection.tsx        # EMERO Map visualization
│   ├── PrototypeSection.tsx  # Prototype showcase
│   ├── EmergencySections.tsx # Responder, Hospital, SOS
│   ├── VerificationSection.tsx # Verification + misuse
│   ├── TimelineSection.tsx   # Project journey
│   ├── ResearchSection.tsx   # Research + learnings
│   ├── GallerySection.tsx    # Gallery + YouTube
│   ├── FeedbackSection.tsx   # Feedback cards
│   ├── ContributorsSection.tsx # Contributors
│   ├── ThankYouSection.tsx   # Final CTA
│   ├── SectionRenderer.tsx   # Dynamic section renderer
│   └── ContentBlockRenderer.tsx # Block type renderer
└── lib/
    ├── types.ts              # TypeScript types
    └── supabase/
        ├── client.ts         # Browser client
        ├── server.ts         # Server client
        └── data.ts           # Data fetching helpers
```

## Admin Features

- **Dynamic Sections**: Create, edit, reorder, pin, publish/unpublish sections
- **Content Blocks**: Add headings, text, images, YouTube videos, cards, etc.
- **Navbar Management**: Control which sections appear in navigation
- **Multi-Page**: Create and manage multiple pages
- **Prototype Screens**: Upload and organize prototype screenshots
- **Gallery**: Manage gallery images with categories
- **Videos**: Add YouTube videos with auto-generated thumbnails
- **Feedback**: Add testimonials with audio/video support
- **Surveys**: Store survey responses and research data
- **Contributors**: Manage contributor profiles
- **File Upload**: Upload images and audio to Supabase Storage

## Database Tables

| Table | Purpose |
|-------|---------|
| pages | Website pages |
| sections | Dynamic sections per page |
| content_blocks | Editable content blocks per section |
| prototype_screens | Prototype screenshots |
| gallery | Gallery images |
| videos | YouTube videos |
| surveys | Survey responses |
| feedback | Testimonials |
| contributors | Team members |
| footer_links | Footer navigation |

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

Set environment variables in Vercel dashboard.
