import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Liquid } from 'liquidjs';
import { load as yamlLoad } from 'js-yaml';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Liquid engine with Jekyll compatibility
const liquid = new Liquid({
  root: [__dirname, path.join(__dirname, '_layouts'), path.join(__dirname, '_includes')],
  extname: '.html',
  jekyllInclude: true,
  dynamicPartials: false,
});

// Load site configuration from _config.yml
let siteConfig = {
  title: 'Pure Computers',
  description: 'Pure Computers website',
  url: 'https://purecomp.net',
  baseurl: '',
  posts: [],
};

try {
  const configFile = fs.readFileSync(path.join(__dirname, '_config.yml'), 'utf8');
  siteConfig = { ...siteConfig, ...yamlLoad(configFile) };
} catch (e) {
  console.warn('Could not load _config.yml, using defaults', e.message);
}

// Helper to parse Jekyll Front Matter
function parseFrontMatter(content) {
  if (content.startsWith('---')) {
    const end = content.indexOf('\n---', 3);
    if (end !== -1) {
      const rawYaml = content.slice(3, end).trim();
      const body = content.slice(end + 4).trim();
      try {
        const data = yamlLoad(rawYaml) || {};
        return { data, body };
      } catch (err) {
        console.error('Error parsing YAML front matter:', err);
      }
    }
  }
  return { data: {}, body: content };
}

// Load and index posts from _posts/
const posts = [];
const postsDir = path.join(__dirname, '_posts');
if (fs.existsSync(postsDir)) {
  const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md') || f.endsWith('.html'));
  for (const file of postFiles) {
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const { data, body } = parseFrontMatter(raw);
    
    // Parse date and slug from filename YYYY-MM-DD-title.md
    const dateMatch = file.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.(md|html)$/);
    let dateStr = data.date;
    let slug = file.replace(/\.(md|html)$/, '');
    if (dateMatch) {
      const [, y, m, d, s] = dateMatch;
      if (!dateStr) dateStr = `${y}-${m}-${d}`;
      slug = s;
    }
    
    const postItem = {
      ...data,
      date: new Date(dateStr || Date.now()),
      slug,
      url: `/posts/${slug}.html`,
      content: file.endsWith('.md') ? marked.parse(body) : body,
    };
    posts.push(postItem);
  }
  // Sort posts by date descending
  posts.sort((a, b) => b.date - a.date);
}
siteConfig.posts = posts;

// Render layout helper (handles nested layout chains e.g. page -> default)
async function renderPageWithLayout(layoutName, pageData, contentBody) {
  let currentContent = contentBody;
  let currentLayout = layoutName || 'default';

  const context = {
    site: siteConfig,
    page: pageData,
    content: currentContent,
  };

  // Render any liquid tags within the body itself
  currentContent = await liquid.parseAndRender(currentContent, context);

  // Traverse layouts
  while (currentLayout) {
    const layoutPath = path.join(__dirname, '_layouts', `${currentLayout}.html`);
    if (!fs.existsSync(layoutPath)) {
      break;
    }
    const layoutRaw = fs.readFileSync(layoutPath, 'utf8');
    const { data: layoutData, body: layoutBody } = parseFrontMatter(layoutRaw);
    
    currentContent = await liquid.parseAndRender(layoutBody, {
      site: siteConfig,
      page: pageData,
      content: currentContent,
    });

    currentLayout = layoutData.layout;
  }

  return currentContent;
}

// 1. Google Sites .bin asset mappings
app.get('/css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, 'styles/css.bin'));
});

app.get('/styles/rs=AGEqA5kFtdIxalAdxeUlPt_E6LUflDdwFw', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, 'styles/rs-AGEqA5kFtdIxalAdxeUlPt_E6LUflDdwFw.bin'));
});

app.get('/iframe_api', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'scripts/iframe_api.bin'));
});

// 2. Main router for Jekyll pages, posts, and root (mounted before express.static so HTML templates are rendered with layouts)
app.get('*', async (req, res, next) => {
  try {
    let reqPath = req.path;
    if (reqPath === '/' || reqPath === '/index.html' || reqPath === '/pc-home' || reqPath === '/pc-home.html') {
      const indexFile = path.join(__dirname, 'index.html');
      const raw = fs.readFileSync(indexFile, 'utf8');
      const { data, body } = parseFrontMatter(raw);
      const rendered = await renderPageWithLayout(data.layout || 'home', { title: siteConfig.title, ...data }, body);
      return res.type('html').send(rendered);
    }

    // Check posts
    const postMatch = posts.find(p => reqPath.includes(p.slug));
    if (postMatch) {
      const rendered = await renderPageWithLayout(postMatch.layout || 'post', postMatch, postMatch.content);
      return res.type('html').send(rendered);
    }

    // Clean page name from path (e.g. /pages/about-us.html or /about-us.html or /about-us)
    const baseName = path.basename(reqPath).replace(/\.html$/, '');
    const candidateFile = path.join(__dirname, '_pages', `${baseName}.html`);

    if (fs.existsSync(candidateFile)) {
      const raw = fs.readFileSync(candidateFile, 'utf8');
      const { data, body } = parseFrontMatter(raw);
      const rendered = await renderPageWithLayout(data.layout || 'page', { title: data.title || baseName, ...data }, body);
      return res.type('html').send(rendered);
    }

    // Try finding exact file under _pages
    const exactFile = path.join(__dirname, '_pages', reqPath.replace(/^\//, ''));
    if (fs.existsSync(exactFile) && fs.statSync(exactFile).isFile()) {
      const raw = fs.readFileSync(exactFile, 'utf8');
      const { data, body } = parseFrontMatter(raw);
      const rendered = await renderPageWithLayout(data.layout || 'page', { title: data.title || baseName, ...data }, body);
      return res.type('html').send(rendered);
    }

    next();
  } catch (err) {
    console.error('Rendering error:', err);
    res.status(500).send('Jekyll rendering error: ' + err.message);
  }
});

// 3. Static directory serving (assets, images, scripts, styles, etc.)
app.use(express.static(__dirname, {
  index: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.bin')) {
      if (filePath.includes('styles')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (filePath.includes('scripts')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
    }
  }
}));
// Fallback 404
app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pure Computers Jekyll dev server running on http://0.0.0.0:${PORT}`);
});
