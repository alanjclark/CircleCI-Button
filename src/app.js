const http = require("http");
const zlib = require("zlib");
const crypto = require("crypto");

// Precompute the HTML and compressed variants at startup for fastest responses.
const html = [
  "<!doctype html>",
  "<html lang=\"en\">",
  "<head>",
  "  <meta charset=\"utf-8\">",
  "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
  "  <title>CircleCI Button Test</title>",
  "  <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;padding:32px} .container{max-width:680px;margin:0 auto;text-align:center}</style>",
  "</head>",
  "<body>",
  "  <div class=\"container\">",
  "    <h2>CircleCI Button Test</h2>",
  "    <button type=\"button\" onclick=\"document.getElementById('click').textContent='I clicked the button!'\">Clicky Button</button>",
  "    <p id=\"click\"></p>",
  "  </div>",
  "</body>",
  "</html>"
].join("");

const htmlBuffer = Buffer.from(html, "utf8");
const etag = `W/\"${crypto.createHash("sha1").update(htmlBuffer).digest("hex")}\"`;

let gzipBuffer;
let brBuffer;
try {
  gzipBuffer = zlib.gzipSync(htmlBuffer);
} catch (_) {
  gzipBuffer = null;
}
try {
  if (zlib.brotliCompressSync) {
    brBuffer = zlib.brotliCompressSync(htmlBuffer);
  } else {
    brBuffer = null;
  }
} catch (_) {
  brBuffer = null;
}

const server = http.createServer((req, res) => {
  // Only a single route is needed; respond efficiently.
  if (req.method !== "GET" || (req.url !== "/" && req.url !== "")) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Not found\n");
    return;
  }

  // Caching headers for HTML: validate with ETag instead of long-lived cache.
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("ETag", etag);
  res.setHeader("Vary", "Accept-Encoding");

  // Conditional request handling
  const ifNoneMatch = req.headers["if-none-match"]; 
  if (ifNoneMatch && ifNoneMatch === etag) {
    res.statusCode = 304;
    res.end();
    return;
  }

  const accept = String(req.headers["accept-encoding"] || "");
  const canBr = brBuffer && accept.includes("br");
  const canGzip = gzipBuffer && accept.includes("gzip");

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  if (canBr) {
    res.setHeader("Content-Encoding", "br");
    res.setHeader("Content-Length", String(brBuffer.length));
    res.end(brBuffer);
    return;
  }

  if (canGzip) {
    res.setHeader("Content-Encoding", "gzip");
    res.setHeader("Content-Length", String(gzipBuffer.length));
    res.end(gzipBuffer);
    return;
  }

  // Fallback: send plain bytes with accurate length to avoid chunked encoding.
  res.setHeader("Content-Length", String(htmlBuffer.length));
  res.end(htmlBuffer);
});

server.listen(process.env.PORT || 8002);
