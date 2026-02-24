# Survivor 50 Fantasy League

A simple prediction game where players rank Survivor contestants and earn progressive, tier-capped points as placements are revealed. All game state persists in the URL, enabling bookmarking and sharing without a backend.

## Project Status

Current state:
- [x] Pyramid prediction UI with drag/drop placement
- [x] URL-based persistence for player picks and friend comparisons
- [x] Progressive tier-capped scoring (`min(predictedTierValue, actualTierValue)`)
- [x] Leaderboard and score breakdown views
- [x] Instructions modal and responsive styling updates
- [x] Rankings-backed score recalculation as results are resolved

## Roadmap

1. Expand automated tests beyond encoding (scoring and state edge cases)
2. Add lightweight admin/update workflow for weekly `rankings.json` edits
3. Improve UX polish for partial-lock and resolved-placement visualization
4. Add optional share/import helpers for easier group onboarding

## Project Structure

```
survivor-50/
├── index.html              # Main application page
├── test.html               # Browser-based encoding tests
├── test-encoding.js        # Node.js encoding tests
├── package.json            # Project dependencies
├── README.md               # This file
├── public/
│   ├── styles.css          # Main stylesheet
│   ├── data/
│   │   └── rankings.json   # Contestant results/placements
└── src/
    ├── main.js             # Preact app entry point
    ├── encoding.js         # Factorial + base62 encoding/decoding
    ├── state.js            # URL state management
    ├── game.js             # Core game logic
    ├── scoring.js          # Score calculation and ranking fetch
    └── components/         # Preact UI components
        ├── ContestantCard.js
        ├── FriendManager.js
        ├── FriendPyramid.js
        ├── Instructions.js
        ├── Leaderboard.js
        ├── Pyramid.js
        └── ScoreDisplay.js
```

## Key Files

### encoding.js
Implements factorial number system + base62 encoding for permutations:
- `encodePermutation(array)` → 14-character code
- `decodePermutation(code)` → array

Every permutation of 24 contestants maps to a unique 14-character code.

### state.js
URL state management:
- `loadPlayerPrediction()` - Reads player predictions from URL hash
- `savePlayerPrediction(perm, name, friends)` - Writes to URL hash
- `parseHash()` - Parse URL parameters
- `addFriend(code, name)` - Add friend to leaderboard

### game.js
Game logic and validation:
- `isValidPermutation(perm)` - Validate permutation
- `getTierInfo(placement)` - Get points for placement
- `getTierRange(tier)` - Get placement range for tier

## Running Locally

### Option 1: Python HTTP Server
```bash
python -m http.server 8000
# Visit http://localhost:8000
```

### Option 2: Any other local server
```bash
# Use any static file server on port 8000 or your preferred port
npx http-server
# or live-server, or similar
```

### Testing Encoding
Open `test.html` in a browser to run the encoding test suite.

## URL Format

```
https://username.github.io/survivor-50/#p=CODE&n=NAME&f=CODE1:NAME1,CODE2:NAME2
```

- `p` - 14-character prediction code
- `n` - Player name
- `f` - Friend codes with names (comma-separated)

## Deployment

Configured for GitHub Pages (free, auto-deploy on push).

### Quick Setup

1. Enable GitHub Pages in repository settings (Settings → Pages → Source: GitHub Actions)
2. Push to main branch
3. GitHub Actions automatically deploys
4. Site available at `https://username.github.io/survivor-50/`

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete setup and updating rankings during season.

## Scoring System

Points for a resolved contestant are calculated with:

`points = min(predictedTierValue, actualTierValue)`

Exception:
- If a contestant is placed in `Bottom 12`, they score `1` only if they actually finish `13-24`.
- A `Bottom 12` pick that finishes `1-12` scores `0`.
- Once the season reaches Top 12 (12 contestants remaining), unresolved `Bottom 12` picks are auto-resolved as `0/1`.

| Placement Range | Tier Value | Description |
|---|---|---|
| 1 | 10 | Winner |
| 2-3 | 5 | Runner-Ups |
| 4-6 | 3 | Top 6 |
| 7-12 | 2 | Top 12 |
| 13-24 | 1 | Bottom 12 |

**Maximum: 53 points** (1×12 + 2×6 + 3×3 + 5×2 + 10×1)

## Game Mechanics

**Pyramid Structure:**
- 24 contestants (bottom row)
- Drag into 6-tier pyramid
- Each tier represents a placement range
- "Lock In" to generate shareable code
- Book or share URL with friends

## Next Steps

1. Add tests for progressive scoring scenarios and leaderboard sorting ties
2. Add a short “weekly update checklist” for maintaining `public/data/rankings.json`
3. Evaluate whether to split large UI concerns in `main.js` into smaller modules

## License

MIT
