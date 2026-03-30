const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

    // Obsługa różnych typów plików
    const ext = path.extname(filePath);
    let contentType = 'text/html';

    switch (ext) {
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'application/javascript';
            break;
        case '.png':
        case '.jpg':
        case '.jpeg':
        case '.gif':
            contentType = 'image/' + ext.slice(1);
            break;
        case '.woff':
            contentType = 'font/woff';
            break;
        case '.woff2':
            contentType = 'font/woff2';
            break;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

const PORT = 8000;
server.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
    console.log('Otwórz http://localhost:8000/fiszki_dodaj.html w przeglądarce');
});