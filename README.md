# K Inchara - Cyber Security Portfolio

## Run it
Option A (quickest): open the `public` folder in VS Code, right-click `index.html` -> Open with Live Server.
Option B (front end + back end):
    npm install
    npm start        # http://localhost:3000

## Structure
public/              FRONT END (everything the visitor sees, and what Google crawls)
  index.html         one page: hero, about, skills, projects, certifications, contact
  css/style.css      design tokens (3 colours) + all styles
  js/main.js         toggle, slider, roadmap path, smooth cursor
  assets/images/     profile photo, project images, favicon
  robots.txt         tells crawlers what to index
  sitemap.xml        list of pages for search engines
  404.html           friendly not-found page
server/server.js     BACK END (Express: compression, caching, security headers)

## Edit checklist
1. Photo: add assets/images/profile.jpg and change the img src in index.html.
2. Replace https://www.example.com with your real domain (index.html, robots.txt, sitemap.xml).
3. Replace your-username links and the email address.
4. Update skills, tools, projects and certifications to match what is true for you.
5. Add a 1200x630 assets/images/og-image.jpg for link previews.
