# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Survivor 50 Ranking Challenge** - A web-based game where players rank Survivor season 50 contestants and earn points based on how accurately they predict elimination order.

See `task.md` for the complete project specification and planning requirements.

## Project Status

This is a planning-stage project. No implementation code exists yet. The first major task is to create a detailed spec document addressing the planning questions in `task.md`.

## Key Architectural Constraints

- **No backend/server**: This must be a static site. All game state (player rankings) is encoded in the URL for bookmarking and sharing.
- **Single data file**: Throughout the season, only one file is updated—the contestant elimination/placement order. This drives point calculations.
- **Minimal hosting**: Should be easily deployable to static site hosting (GitHub Pages, Netlify, etc.).

## Design Decisions to Determine

Before writing code, establish:

1. **State Encoding**: How to compress player rankings into a URL (consider base64 encoding or ordinal positions)
2. **Data Format**: Structure for the elimination ranking file (JSON, CSV, or plain text)
3. **Framework Choice**: Likely a lightweight SPA framework (React, Vue, Svelte, or vanilla JS)
4. **Build Tool**: If needed (Vite, esbuild, or just raw HTML/CSS/JS)
5. **Styling Approach**: CSS framework or vanilla CSS with Survivor theme
6. **Deployment**: GitHub Pages, Netlify, Vercel, or similar static hosting

## Game Mechanics Reference

From `task.md`:
- 24 contestants arranged in pyramid: 24 → 12 → 6 → 3 → 2 → 1
- Draggable player cards with images/names
- Scoring tiers by placement accuracy
- Shareable codes for leaderboard comparison
- URL-based bookmarking preserves player's picks

## Styling Theme

Lightly Survivor-themed (not official branding):
- Reference colors: torch flames, island survival aesthetic
- Font: Consider serif for titles, clean sans-serif for UI
- Placeholder images acceptable until final contestant list provided

## When Implementation Begins

Once code structure is set up:
- Maintain clean separation between game logic, UI, and state encoding
- Keep component structure flat initially; refactor only if necessary
- Test URL encoding/decoding early—this is critical infrastructure
- Use semantic HTML for accessibility

## Important Notes for Future Claude Instances

- The user is an experienced software engineer but new to web development, so explanations should focus on web-specific concerns
- The goal is a "simple" version unlike complex Fantasy Football—avoid overengineering
- Static hosting means all dynamic features must be client-side JavaScript
- The placement ranking file will be the only dynamic data source; plan for easy updates
