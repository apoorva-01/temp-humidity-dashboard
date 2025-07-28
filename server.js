const { createServer: createHttpsServer } = require('https');
const { createServer: createHttpServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // In production, we'll use a simple HTTP server and let Nginx handle
  // SSL termination.
  if (!dev) {
    const port = process.env.PORT || 3789;
    createHttpServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`);
    });
    return;
  }

  // In development, we'll use the existing HTTPS setup with a self-signed
  // certificate.
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'certificates', 'private.key')),
    cert: fs.readFileSync(
      path.join(__dirname, 'certificates', 'certificate.crt'),
    ),
  };

  createHttpsServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3789, (err) => {
    if (err) throw err;
    console.log('> Ready on https://localhost:3789');
  });

  // Create an HTTP server in development to redirect to HTTPS
  createHttpServer((req, res) => {
    // Redirect HTTP to HTTPS
    res.writeHead(301, { Location: `https://localhost:3789${req.url}` });
    res.end();
  }).listen(8080, (err) => {
    if (err) throw err;
    console.log('> HTTP redirect server ready on http://localhost:8080');
  });
});
