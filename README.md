# snovi-web

React/Vite landing app for snovi.fm.

The app source is separated from the backend and lives in
`C:\Users\Public\Documents\snovi\snovi-web`.
Production builds are written to the local `dist` folder. Apache serves the app
through `.htaccess`, so the project root points to `dist/index.html`.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Run dev server: `npm run dev`
3. Build static files: `npm run build`
