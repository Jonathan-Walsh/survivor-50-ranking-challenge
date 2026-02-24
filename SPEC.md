# Survivor 50 Ranking Challenge - Specification Document

## 1. Overview

**Survivor 50 Ranking Challenge** is a simple prediction game where players rank 24 Survivor contestants by predicted elimination order. Players earn **progressive, tier-capped points** as actual placements are revealed. The entire game state persists in the URL, enabling bookmarking and sharing without a backend.

---

## 2. Game Mechanics

### 2.1 Core Gameplay

**Objective**: Players arrange 24 contestant cards into a pyramid structure predicting elimination order.

**Pyramid Structure**:
```
                    [1 slot]         (Place 1 - The Winner)
                  [2 slots]         (Places 2-3)
                [3 slots]         (Places 4-6)
              [6 slots]         (Places 7-12)
            [12 slots]         (Places 13-24)
          [24 slots]         (All Contestants - Starting Pool)
```

**Gameplay Flow**:
1. Player sees all 24 contestant cards in the bottom row
2. Player drags cards upward into the pyramid based on predicted placement
3. Each card can only be placed once (no duplicates)
4. Player reviews their predictions
5. Player clicks "Lock In" to finalize choices
6. Page generates a shareable code that encodes their entire prediction set
7. Player bookmarks the URL (which includes the code)

### 2.2 Scoring System

Points are based on the predicted placement slot and the contestant's actual final placement.

| Tier | Placement Range | Tier Value | Description |
|------|-----------------|------------|-------------|
| Bottom 12 | 13-24 | 1 point | Early-elimination bucket |
| Top 12 | 7-12 | 2 points | Mid/late-game bucket |
| Top 6 | 4-6 | 3 points | Deep-run bucket |
| Runner-Ups | 2-3 | 5 points | Finalist bucket |
| Winner | 1 | 10 points | Champion bucket |

**Scoring Formula**: `points = min(predictedTierValue, actualTierValue)` for resolved contestants.

Exception:
- If predicted tier is Bottom 12, score is `1` only when actual placement is `13-24`; otherwise score is `0`.
- Once Top 12 is reached (12 contestants still unresolved), unresolved Bottom 12 picks are treated as resolved misses (`0/1`).

Examples:
- Picked in Top 12 (2), finishes Bottom 12 (1) -> 1 point
- Picked as Winner (10), finishes Runner-Up (5) -> 5 points
- Picked as Top 6 (3), finishes Winner (10) -> 3 points
- Picked in Bottom 12 (1), finishes Top 12 (2) -> 0 points

This means picks can earn partial credit when they underperform the prediction, and cap out at the slot's tier value when they outperform it.

**Total Possible Points**: Up to **53 points** (12×1 + 6×2 + 3×3 + 2×5 + 1×10)
**Ties Allowed**: Multiple players can achieve the same score

### 2.3 Current Rules/Notes

#### Rule 1: Single Scoring Mode
There is no classic/strict scoring mode. The app uses progressive tier-capped scoring only.

#### Rule 2: No Additional Tiebreaker
If multiple players have the same score, they remain tied on the leaderboard.

#### Improvement 3: Contestant Identity Options
Since this is season-specific, provide two modes:
- **Named Mode** (default): Contestant photos/names visible during gameplay
- **Mystery Mode** (optional): Placeholder tokens that reveal identity only after "Lock In"

#### Improvement 4: Progress Tracking Display
Show:
- Current points earned (updated as actual results come in)
- Potential points remaining (based on unresolved placements)

---

## 3. Technical Architecture

### 3.1 URL-Based State Persistence

**The Core Innovation**: All game state encoded in the URL hash, no backend required.

#### 3.1.1 URL Structure

```
https://survivor-50.example.com/#p=[PREDICTIONS_CODE]&n=[PLAYER_NAME]&f=[FRIEND_CODE:FRIEND_NAME,...]
```

**Components**:
- `p` (predictions): 14-character code encoding all player placements
- `n` (name): Player's name (URL-safe characters only)
- `f` (friends): Comma-separated friend codes with names (format: `CODE:NAME,CODE:NAME,...`)

#### 3.1.2 Predictions Code Encoding

**Data to Encode**: Array of 24 integers representing contestant IDs in order (1-24), where index represents placement:

```javascript
// Example (NOT actual encoding):
// If contestant 5 is placed as winner (index 0), contestant 12 as runner-up (index 1), etc.:
[5, 12, 3, 7, 1, 14, 2, 9, 11, 4, 6, 8, 10, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
```

**Encoding Strategy** (Factorial Number System + Base62):
1. Start with the permutation array (integers 1-24)
2. Convert permutation to a single large integer using factorial number system (standard algorithm for encoding permutations)
3. Base62 encode the integer (62 characters available: 0-9, a-z, A-Z—no URL special chars)
4. Result: exactly **14 characters** (theoretical minimum for 24! permutations)

**Example URL**:
```
https://survivor-50.example.com/#p=aBcDeFgHiJkLm&n=Jason&f=xYzAbCdEfGhIjK:Mom,pQrStUvWxYzAbC:Sarah
```

**Decoding**:
1. Extract 14-character Base62 string
2. Convert from Base62 to integer
3. Convert from factorial number system back to permutation array

#### 3.1.3 Data Persistence

**Loading a Saved Game**:
1. User bookmarks: `https://survivor-50.example.com/#p=aBc7Def2G&t=...`
2. On page load, JavaScript reads URL hash
3. Decodes `p` parameter to restore player's prediction array
4. UI reconstructs the pyramid with their placements
5. Player can view points earned so far

**No Backend Required**: Static file + JavaScript on client side handles everything.

---

## 4. Leaderboard & Social Features

### 4.1 Leaderboard View

**Feature**: Players can view and compare scores across the season.

**How It Works**:
1. Players share their codes with friends (via copy/paste, QR code, URL)
2. Friend clicks shared link or enters code in a "Compare" section
3. Page displays side-by-side comparison of:
   - Player name (editable locally, not stored)
   - Current score
   - Predictions made (shown as cards in the pyramid)
   - Accuracy percentage
4. Multiple friends can be added simultaneously to create a leaderboard

**Storage**: Each compared friend's code and name is added to the URL:
```
https://survivor-50.example.com/#p=aBcDeFgHiJkLm&n=Jason&f=cDeF9Hi1kLm:Mom,jKlM2No3aBc:Sarah
```

The `&f=` parameter contains comma-separated pairs of `CODE:NAME` where:
- `CODE` = 14-character prediction code
- `NAME` = Friend's name (URL-safe characters)

**Data Flow**:
- Friend's code → decode → display their pyramid
- User's code → decode → display user's pyramid
- Contestant results file → calculate points for each
- Display side-by-side comparison with names

---

## 5. Data File: Contestant Rankings

### 5.1 File Format & Location

**File**: `public/data/rankings.json`

**Format**:
```json
{
  "season": 50,
  "lastUpdated": "2025-02-17T00:00:00Z",
  "contestants": [
    { "id": 1, "name": "Contestant A", "placement": null },
    { "id": 2, "name": "Contestant B", "placement": 24 },
    { "id": 3, "name": "Contestant C", "placement": 23 },
    ...
  ]
}
```

- `placement: null` = Still in the game
- `placement: N` = Eliminated at placement N (1 = winner, 24 = first eliminated)

### 5.2 Updating Results During Season

**Process**:
1. Each time a contestant is voted out, update `rankings.json` with their placement
2. Commit to GitHub
3. Push to hosting (auto-deploys if CI/CD configured)
4. All player browsers automatically fetch updated rankings on page load
5. Scores recalculate in real-time

**Version Strategy**: Add optional `version` field to `rankings.json` that increments on updates, allowing browsers to cache-bust:
```json
{
  "version": 3,
  "lastUpdated": "2025-02-17T...",
  ...
}
```

---

## 6. Technology Stack Recommendations

### 6.1 Frontend Framework

**Recommend: Vanilla JavaScript + Preact** (or React if you prefer)

**Rationale**:
- Preact: Ultra-lightweight (~4kb), perfect for simple static sites
- No build tool needed initially (can add later if desired)
- Drag-and-drop is simpler with native JS
- URL encoding/decoding is straightforward logic
- Can start with plain HTML/CSS/JS and upgrade if needed

**Alternative Consideration**: **Svelte**
- Even simpler syntax, smaller bundle
- Excellent for drag-and-drop interactions
- Great developer experience

### 6.2 Drag-and-Drop Library

**Recommend: Native HTML5 Drag-and-Drop** (no library needed)

**Why**:
- Built into browsers, no dependency bloat
- Sufficient for this use case
- Plenty of vanilla JS examples available

**Alternative**: **React Beautiful DnD** or **dnd-kit** if using React/Preact

### 6.3 CSS Framework

**Recommend: Plain CSS with CSS Variables** (no framework)

**Rationale**:
- Minimal site, no complex layouts
- Can create Survivor theme easily with custom colors
- Faster to iterate without abstraction layer

**Alternative**: **Pico CSS** (minimal framework, ~10kb)

### 6.4 Build & Bundling

**Initial**: No build step. Serve HTML/CSS/JS files directly.

**Optional Later**: Add Vite if you want minification/bundling in the future.

### 6.5 Preact Setup

For now, load Preact via CDN in HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/preact@latest/dist/preact.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/preact@latest/hooks/dist/hooks.min.js"></script>
```

No package.json or npm install needed initially.

---

## 7. Deployment & Hosting

### 7.1 Recommended Deployment: GitHub Pages (FREE)

**Advantages**:
- Zero cost
- Automatic deployment on git push
- Built-in HTTPS
- Simple setup (one file: `.github/workflows/deploy.yml`)
- Perfect for static sites with few users

**Setup**:
1. Create GitHub repo (already done)
2. Push code to `main` branch
3. Enable GitHub Pages in repo settings (point to `main` branch, `/` root)
4. GitHub Pages auto-deploys to `https://username.github.io/survivor-50/`

**Updating Rankings**: Just commit new `rankings.json` and push—live within seconds.

### 7.2 Alternative Deployments

| Service | Cost | Setup Time | Best For |
|---------|------|-----------|----------|
| **GitHub Pages** | Free | 5 min | Recommended - simplest |
| **Netlify Free** | Free | 5 min | If you want custom domain |
| **Vercel Free** | Free | 5 min | Best DX, overkill for this use case |
| **Firebase Hosting** | Free tier (~5GB) | 10 min | If you eventually add backend |

**Recommendation**: Start with GitHub Pages. If you ever need a backend (leaderboard persistence, user accounts), migrate to Firebase or Netlify in ~30 minutes.

### 7.3 Custom Domain (Optional)

If you want `survivor50.com` instead of `username.github.io`:
1. Register domain (~$10-15/year on Namecheap, GoDaddy, etc.)
2. Point DNS to GitHub Pages (GitHub provides instructions)
3. Add domain to GitHub Pages settings
4. GitHub auto-handles HTTPS

---

## 8. Development Workflow

### 8.1 Project Structure

```
survivor-50/
├── index.html              (Main page)
├── public/
│   ├── data/
│   │   └── rankings.json   (Update this weekly)
│   ├── styles.css
│   └── images/
│       └── contestants/    (Placeholder images or contestant photos)
├── src/
│   ├── main.js             (Entry point)
│   ├── game.js             (Core game logic)
│   ├── encoding.js         (URL encode/decode)
│   ├── scoring.js          (Point calculation)
│   └── ui.js               (DOM manipulation & drag-drop)
├── package.json
└── README.md
```

### 8.2 Development Steps

**Phase 1: Core Mechanics**
1. Build pyramid layout (HTML + CSS)
2. Implement drag-and-drop with native HTML5 API
3. Build contestant card rendering

**Phase 2: State Management**
1. Implement URL encoding (factorial number system + base62)
2. Implement "Lock In" button to generate shareable code
3. Test URL persistence (bookmark and reload)

**Phase 3: Scoring**
1. Load `rankings.json` on page load
2. Calculate points in real-time as results update
3. Display score next to each prediction

**Phase 4: Social Features**
1. Build "Compare with Friends" interface
2. Parse multiple codes from URL
3. Display leaderboard

**Phase 5: Polish**
1. Add Survivor theming (colors, fonts, imagery)
2. Add responsive design (mobile support)
3. Add loading states and error handling

---

## 9. Risk Analysis & Mitigations

### Risk 1: URL Length Limits
**Issue**: Very long URLs break some systems.
**Mitigation**: Prediction code is only 14 characters. With player name + 5 friends, URL stays under 200 characters. Safe limit is <2000 chars.
**Fallback**: If many friends needed, limit to 10 in URL or implement optional short URL service

### Risk 2: Browser Compatibility
**Issue**: Old browsers may not support drag-and-drop.
**Mitigation**: Use native HTML5 API (works in all modern browsers). Add fallback: radio buttons or dropdowns for older users.

### Risk 3: Large Friend Leaderboards
**Issue**: URL with many friend codes could get long.
**Mitigation**: Limit to 10 friends in URL. If more needed, recommend a simple CSV import of codes.

### Risk 4: Rankings File Update Lag
**Issue**: Rankings file updates, but user's browser has cached old version.
**Mitigation**: Add version number to `rankings.json`. JavaScript checks version on load and cache-busts if needed.

---

## 11. Acceptance Criteria

- [ ] Player can drag all 24 contestants into the pyramid
- [ ] Pyramid enforces placement rules (no duplicates, correct tier sizes)
- [ ] "Lock In" generates a 14-character shareable code
- [ ] Code can be bookmarked and reloaded exactly as-is
- [ ] Points calculate correctly based on actual placement
- [ ] Player can add friend codes and see side-by-side comparison
- [ ] Rankings update without requiring app reload
- [ ] Survivor-themed styling applied (colors, fonts)
- [ ] Site deployed to GitHub Pages with auto-update on rankings change

---

## 12. Implementation Approach

**Framework**: Preact (via CDN, no build step initially)
**Encoding**: Factorial number system + base62 (14 characters per prediction code)
**Deployment**: GitHub Pages (public repo, auto-deploy on push)
**Desktop-Focused**: No mobile optimization needed

**Development will proceed in 6 phases** (see Section 8.2):
1. Core Setup & Encoding
2. UI - Pyramid & Drag-Drop
3. Data & Scoring
4. Social Features (Leaderboard)
5. Styling & Polish
6. Deployment

Each phase builds incrementally on the previous one.
