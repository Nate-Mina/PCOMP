import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Liquid } from 'liquidjs';
import { load as yamlLoad } from 'js-yaml';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.join(__dirname, '_site');
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

const liquid = new Liquid({
  root: [__dirname, path.join(__dirname, '_layouts'), path.join(__dirname, '_includes')],
  extname: '.html',
  jekyllInclude: true,
  dynamicPartials: false,
});

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
  console.warn('Could not load _config.yml:', e.message);
}

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

// Load posts
const posts = [];
const postsDir = path.join(__dirname, '_posts');
if (fs.existsSync(postsDir)) {
  const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md') || f.endsWith('.html'));
  for (const file of postFiles) {
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const { data, body } = parseFrontMatter(raw);
    const dateMatch = file.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.(md|html)$/);
    let dateStr = data.date;
    let slug = file.replace(/\.(md|html)$/, '');
    if (dateMatch) {
      const [, y, m, d, s] = dateMatch;
      if (!dateStr) dateStr = `${y}-${m}-${d}`;
      slug = s;
    }
    posts.push({
      ...data,
      date: new Date(dateStr || Date.now()),
      slug,
      url: `/posts/${slug}.html`,
      content: file.endsWith('.md') ? marked.parse(body) : body,
    });
  }
  posts.sort((a, b) => b.date - a.date);
}
siteConfig.posts = posts;

async function renderPageWithLayout(layoutName, pageData, contentBody) {
  let currentContent = contentBody;
  let currentLayout = layoutName || 'default';

  currentContent = await liquid.parseAndRender(currentContent, {
    site: siteConfig,
    page: pageData,
    content: currentContent,
  });

  while (currentLayout) {
    const layoutPath = path.join(__dirname, '_layouts', `${currentLayout}.html`);
    if (!fs.existsSync(layoutPath)) break;
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

async function build() {
  console.log('Building Jekyll site to _site/ ...');

  // Copy static directories
  for (const dir of ['assets', 'images']) {
    const src = path.join(__dirname, dir);
    const dest = path.join(outDir, dir);
    if (fs.existsSync(src)) {
      fs.cpSync(src, dest, { recursive: true });
    }
  }

  // Render index.html
  const indexRaw = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const { data: indexData, body: indexBody } = parseFrontMatter(indexRaw);
  const indexHtml = await renderPageWithLayout(indexData.layout || 'home', { title: siteConfig.title, ...indexData }, indexBody);
  fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml);

  // Render _pages/
  const pagesDir = path.join(__dirname, '_pages');
  const pagesOutDir = path.join(outDir, 'pages');
  fs.mkdirSync(pagesOutDir, { recursive: true });

  if (fs.existsSync(pagesDir)) {
    const pageFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));
    for (const file of pageFiles) {
      const raw = fs.readFileSync(path.join(pagesDir, file), 'utf8');
      const { data, body } = parseFrontMatter(raw);
      const rendered = await renderPageWithLayout(data.layout || 'page', { title: data.title || file, ...data }, body);
      fs.writeFileSync(path.join(pagesOutDir, file), rendered);
    }
  }

  // Render _posts/
  const postsOutDir = path.join(outDir, 'posts');
  fs.mkdirSync(postsOutDir, { recursive: true });
  for (const post of posts) {
    const rendered = await renderPageWithLayout(post.layout || 'post', post, post.content);
    fs.writeFileSync(path.join(postsOutDir, `${post.slug}.html`), rendered);
  }

  console.log(`Jekyll build complete! Generated ${posts.length} posts and all pages in _site/`);
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
