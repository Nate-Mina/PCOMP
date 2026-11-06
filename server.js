import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Specific route mappings for Google Sites .bin assets
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

// Serve static files from root
app.use(express.static(__dirname, {
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

// Fallback routing for pages without extension or html
app.get('*', (req, res) => {
  let reqPath = req.path;
  if (reqPath === '/' || reqPath === '') {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }

  // Try exact path
  let filePath = path.join(__dirname, reqPath);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      res.sendFile(filePath + '.html', (err2) => {
        if (err2) {
          const pageName = path.basename(reqPath);
          res.sendFile(path.join(__dirname, 'pages', pageName + '.html'), (err3) => {
            if (err3) {
              res.sendFile(path.join(__dirname, 'index.html'));
            }
          });
        }
      });
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pure Computers server running on http://0.0.0.0:${PORT}`);
});
