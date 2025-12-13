# Reinvented Wheel of Names

A modern, feature-rich, and aesthetically pleasing random name picker application built with Next.js, Tailwind CSS, and Framer Motion.

![Wheel of Names Screenshot](public/Screenshot.png)

## Features

-   **🎯 Physics-Based Wheel**: A satisfying, responsive wheel with realistic physics and confetti celebrations.
-   **👥 Team Management**:
    -   **Create & Edit**: Manage multiple teams with drag-and-drop ordering.
    -   **Integrations**: Import teams directly from your **Strapi / PostHog** employee directory.
    -   **Persistent Exclusions**: Temporarily exclude members from the wheel (e.g., if they are absent) without removing them from the team. **Exclusions are saved per-team** and persist across sessions.
-   **📝 Ad-Hoc Lists**: A "Quick List" mode for temporary, on-the-fly name picking.
-   **⚙️ Admin Panel**:
    -   **Backup & Restore**: Export your full database to JSON and restore it on any device.
    -   **Feature Flags**: Toggle experimental features like "Remote Teams" syncing.
    -   **Debug Tools**: detailed verbose logging for development.
-   **📊 Analytics**: Integrated with **PostHog** for usage tracking and remote feature configuration (e.g., "Death Mode").

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage Guide

### Managing Teams
1.  **Create a Team**: Click the **"New Team"** button or press `N`.
2.  **Import Teams**: Open the Admin Panel (Gear Icon) -> Integrations -> "Import from Strapi".
3.  **Exclude Members**: Click the toggle/checkbox next to a member's name to exclude them from the next spin. This preference is saved automatically for that specific team.

### Spinning the Wheel
-   **Spin**: Click the **"SPIN"** button in the center of the wheel or press `Enter`.
-   **Winner**: A modal will announce the winner.

### Admin & Settings
-   **Settings**: Click the **Gear Icon** in the top header.
    -   **Data**: Export/Import JSON backups.
    -   **Integrations**: Connect to external data sources.
    -   **Verbose Logging**: Enable detailed console logs for debugging (PostHog debug logs are also gated behind this).

## Deployment

### Vercel (Recommended)
The easiest way to deploy is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

1.  Push your code to a Git repository (GitHub, GitLab, BitBucket).
2.  Import the project into Vercel.
3.  Vercel will automatically detect the Next.js configuration and deploy.

### Manual / Docker
Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Tech Stack

-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand) + [Dexie.js](https://dexie.org/) (IndexedDB)
-   **Analytics**: [PostHog](https://posthog.com/)
-   **Drag & Drop**: [dnd-kit](https://dndkit.com/)
