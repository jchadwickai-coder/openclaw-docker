#!/usr/bin/env node

const http = require('http');

// Create HTTP server
const server = http.createServer((clientReq, clientRes) => {
  const host = clientReq.headers.host || 'localhost:9222';

  // Proxy options
  const proxyOptions = {
    hostname: '127.0.0.1',
    port: 19222,
    path: clientReq.url,
    method: clientReq.method,
    headers: {
      ...clientReq.headers,
      host: 'localhost:19222'
    }
  };

  // Make request to Chrome
  const proxyReq = http.request(proxyOptions, (proxyRes) => {
    const contentType = proxyRes.headers['content-type'] || '';

    // Check if this is a JSON response that needs rewriting
    if (contentType.includes('application/json') || clientReq.url.startsWith('/json')) {
      let body = [];

      proxyRes.on('data', (chunk) => {
        body.push(chunk);
      });

      proxyRes.on('end', () => {
        try {
          const bodyString = Buffer.concat(body).toString();
          const data = JSON.parse(bodyString);

          // Rewrite URLs in the response
          const rewriteUrls = (obj) => {
            if (Array.isArray(obj)) {
              obj.forEach(rewriteUrls);
            } else if (obj && typeof obj === 'object') {
              // Rewrite devtoolsFrontendUrl
              if (obj.devtoolsFrontendUrl) {
                // Extract the ws parameter if present
                const wsMatch = obj.devtoolsFrontendUrl.match(/[?&]ws=([^&]+)/);
                if (wsMatch) {
                  const wsUrl = wsMatch[1].replace(/localhost:19222/g, host);
                  obj.devtoolsFrontendUrl = `http://${host}/devtools/inspector.html?ws=${wsUrl}`;
                } else {
                  obj.devtoolsFrontendUrl = `http://${host}/devtools/inspector.html`;
                }
              }

              // Rewrite webSocketDebuggerUrl
              if (obj.webSocketDebuggerUrl) {
                obj.webSocketDebuggerUrl = obj.webSocketDebuggerUrl.replace(/localhost:19222/g, host);
              }
            }
          };

          rewriteUrls(data);

          const modifiedBody = JSON.stringify(data);
          clientRes.writeHead(proxyRes.statusCode, {
            ...proxyRes.headers,
            'content-length': Buffer.byteLength(modifiedBody)
          });
          clientRes.end(modifiedBody);
        } catch (error) {
          // If JSON parsing fails, just pass through
          console.error('Error rewriting response:', error);
          const bodyString = Buffer.concat(body).toString();
          clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
          clientRes.end(bodyString);
        }
      });
    } else {
      // For non-JSON responses, just pipe through
      clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(clientRes);
    }
  });

  // Handle errors
  proxyReq.on('error', (error) => {
    console.error('Proxy error:', error);
    clientRes.writeHead(502);
    clientRes.end('Bad Gateway');
  });

  // Pipe the request body to Chrome
  clientReq.pipe(proxyReq);
});

server.listen(8222, '127.0.0.1', () => {
  console.log('DevTools URL rewriter proxy listening on port 8222');
});
