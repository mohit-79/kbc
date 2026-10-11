@echo off
echo Copying updated files to public/...
copy /Y friend-call.html public\friend-call.html
copy /Y styles.css public\styles.css
copy /Y index.html public\index.html
copy /Y app.js public\app.js
copy /Y audio.js public\audio.js

echo Deploying to Cloudflare Workers with Wrangler...
call npx wrangler deploy
