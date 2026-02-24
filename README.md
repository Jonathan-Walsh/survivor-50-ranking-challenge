# Survivor 50 Fantasy League

A simple prediction game where players rank Survivor contestants and earn points based on accurate placement predictions. All game state persists in the URL, enabling bookmarking and sharing without a backend.

## Project Status

**Phase 1 Complete** ✅: Core Setup & Encoding
- [x] File structure created
- [x] Factorial number system + base62 encoding implemented
- [x] URL state management implemented
- [x] Test suite created
- [x] Basic Preact app scaffold ready

## Development Phases

1. **Phase 1: Core Setup & Encoding** ✅
   - Initial file structure
   - Encoding/decoding logic (factorial + base62)
   - URL state management
   - Test suite

2. **Phase 2: UI - Pyramid & Drag-Drop** (In Progress)
   - Pyramid HTML/CSS structure (6 tiers)
   - Drag-and-drop interface
   - Contestant card components
   - Placement validation

3. **Phase 3: Data & Scoring** (Next)
   - Rankings data file (rankings.json)
   - Point calculation logic
   - Score display

4. **Phase 4: Social Features**
   - Leaderboard comparison
   - Friend code management
   - Multi-player scoring

5. **Phase 5: Styling & Polish**
   - Survivor theme application
   - Responsive design
   - Error handling

6. **Phase 6: Deployment**
   - GitHub Pages setup
   - CI/CD pipeline
   - Auto-deployment

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
│   │   └── rankings.json   # Contestant data (to be created)
│   └── images/
│       └── contestants/    # Placeholder images
└── src/
    ├── main.js             # Preact app entry point
    ├── encoding.js         # Factorial + base62 encoding/decoding
    ├── state.js            # URL state management
    ├── game.js             # Core game logic
    ├── scoring.js          # Point calculation (Phase 3)
    └── components/         # Preact components (Phase 2+)
        ├── Pyramid.js      # Pyramid container
        └── ContestantCard.js # Card component
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

| Placement Range | Points | Description |
|---|---|---|
| 1 | 10 | Winner |
| 2-3 | 4 | Final 2 |
| 4-6 | 3 | Final 3 |
| 7-12 | 2 | Top 6 |
| 13-24 | 1 | Bottom 12 |

**Maximum: 48 points** (1×12 + 2×6 + 3×3 + 4×2 + 10×1)

## Game Mechanics

**Pyramid Structure:**
- 24 contestants (bottom row)
- Drag into 6-tier pyramid
- Each tier represents a placement range
- "Lock In" to generate shareable code
- Book or share URL with friends

## Next Steps

1. Phase 2: Build pyramid UI with Preact
2. Phase 3: Create rankings.json and implement scoring
3. Phase 4: Add leaderboard/friend comparison
4. Phase 5: Apply Survivor theme styling
5. Phase 6: Deploy to GitHub Pages

## License

MIT
