# snovi-web

React/Vite landing app for snovi.fm.

The app source is separated from the backend and lives in `C:\xampp\htdocs\snovi-web`.
Production builds are written to the backend static folder:
`C:\Users\Public\Documents\snovi\snovi-backend\public\home`.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Run dev server: `npm run dev`
3. Build static files for backend: `npm run build`

If the backend is moved, set `SNOVI_BACKEND_HOME_DIR` in `.env.local`.
