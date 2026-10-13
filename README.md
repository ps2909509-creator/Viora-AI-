# Viora AI deployment
Upload the contents of this folder to the root of your GitHub repository (not just the ZIP file).
Files: `index.html` and `api/generate.js`.
Connect the repository to Vercel, set `FAL_KEY` in Vercel Project Settings → Environment Variables, then redeploy. Never put the key in HTML or GitHub.
Uses `fal-ai/wan/v2.7/text-to-video`, supporting 2–15 seconds. Longer UI durations are capped at 15 seconds. Generation uses fal.ai credits.
