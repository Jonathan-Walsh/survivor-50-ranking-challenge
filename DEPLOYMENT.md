# Deployment Guide - Survivor 50 Ranking Challenge

This guide covers deploying the Survivor 50 Ranking Challenge to GitHub Pages.

## Prerequisites

- Git installed locally
- GitHub account
- Repository already created and cloned

## GitHub Pages Setup

### 1. Enable GitHub Pages in Repository Settings

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Navigate to **Pages** section (left sidebar)
4. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - This will automatically deploy when you push to main
5. Save

### 2. Verify Workflow

1. Go to the **Actions** tab in your repository
2. You should see "Deploy to GitHub Pages" workflow
3. It will run automatically on every push to `main` branch
4. Wait for it to complete (usually 1-2 minutes)
5. Your site will be live at: `https://username.github.io/survivor-50/`

## Updating Rankings During Season

As contestants are voted out, update `rankings.json`:

### 1. Local Edit
```bash
# Edit the file
vim public/data/rankings.json
```

### 2. Update Placements
```json
{
  "contestants": [
    { "id": 24, "name": "Contestant X", "placement": 24 },  // First out
    { "id": 23, "name": "Contestant W", "placement": 23 },  // Second out
    { "id": 5, "name": "Contestant E", "placement": null }  // Still in game
  ]
}
```

### 3. Commit and Push
```bash
git add public/data/rankings.json
git commit -m "Update rankings: [Contestant Name] placed [#]"
git push origin main
```

### 4. Verify Deployment
- Go to **Actions** tab
- Watch the deployment complete
- Refresh the live site to see updated scores

## Version Field (Cache Busting)

To ensure browsers fetch the latest `rankings.json` and don't use a cached version, increment the `version` field:

```json
{
  "version": 1,
  "season": 50,
  ...
}
```

The app will automatically cache-bust when version changes.

## Custom Domain (Optional)

If you want `survivor50.fantasy.com` instead of GitHub Pages URL:

### 1. Register Domain
- Use Namecheap, GoDaddy, or similar (~$10-15/year)

### 2. Point DNS to GitHub
- In your domain registrar, set up DNS records pointing to GitHub Pages
- GitHub provides specific instructions in Pages settings

### 3. Add to Repository
1. Go to **Settings** → **Pages**
2. Enter your custom domain
3. Click "Save"
4. GitHub will create a `CNAME` file automatically

## Troubleshooting

### Site not updating after push
- Check the **Actions** tab to see if workflow succeeded
- If failed, click the workflow to see error details
- Most common: YAML syntax error in `.github/workflows/deploy.yml`

### Rankings not updating on live site
- Increment `version` in `rankings.json`
- Wait 30 seconds for cache to invalidate
- Refresh browser (Cmd+Shift+R or Ctrl+Shift+R to hard refresh)

### 404 on live site
- Verify the repository is public (required for free GitHub Pages)
- Check that all files were committed and pushed
- Ensure workflow completed successfully

## Development Locally

To test before deploying:

```bash
# Start local server
python -m http.server 8000

# Visit http://localhost:8000
```

## Performance Notes

- All assets are static (HTML, CSS, JS)
- No server processing needed
- Deployments are instant (within 1-2 minutes)
- Site is fast and reliable

## Security

- No backend or database
- All player data is in URL (browser only, not stored)
- `rankings.json` is public (read-only from browser)
- No user authentication needed

---

For more information, see [GitHub Pages Documentation](https://docs.github.com/en/pages)
