// @ts-ignore
import http = require("http");
// @ts-ignore
import fs = require("fs");

const host = '127.0.0.1';
const port = 8069;

const some_mime_types: { [key: string]: string } = {
    '.html': 'text/html',
    '.ico': 'image/png',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.zip': 'application/zip',
};

const mapItemTypes: string[] = [
    "chair", "lamp", "mushroom", "outhouse", "pillar",
    "pond", "rock", "statue", "tree", "turtle",
];

// Define player and map item interfaces
interface Player {
    action: string;
    type: string;
    name: string;
    id: string;
    x: number;
    y: number;
    time: string;
    x_curr: number;
    y_curr: number;
}

interface MapItem {
    x: number;
    y: number;
    image_url: string;
}

// Dictionary of players and map items
let players: { [id: string]: Player } = {};
let map: { [id: string]: MapItem } = {};

// Request listener with types for request and response
const requestListener: http.RequestListener = (request, response) => {
    let body = '';
    request.on('data', (chunk) => {
        body += chunk;
    });
    request.on('end', () => {
        const filename = request.url?.substring(1) || ''; // Remove leading '/'
        const last_dot = filename.lastIndexOf('.');
        const extension = last_dot >= 0 ? filename.substring(last_dot) : '';

        if (filename !== 'update') {
            console.log(`Got a request for ${request.url}, body=${body}`);
        }

        if (filename === 'getItems') {
            if (Object.keys(map).length === 0) {
                // Generate map items if map is empty
                for (let i = 0; i < 600; i++) {
                    let index = Math.floor(Math.random() * mapItemTypes.length);
                    let sign1 = i % 4 === 1 || i % 4 === 3 ? -1 : 1;
                    let sign2 = i % 4 >= 2 ? -1 : 1;

                    map[i] = {
                        x: (Math.random() * 5000) * sign1,
                        y: (Math.random() * 2500) * sign2,
                        image_url: `images/${mapItemTypes[index]}.png`,
                    };
                }
            }
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(Object.values(map)));

        } else if (filename === 'left_click' || filename === 'right_click') {
            try {
                const ob: Player = JSON.parse(body);

                players[ob.id] = {
                    action: ob.action,
                    type: ob.type,
                    name: ob.name,
                    id: ob.id,
                    x: ob.x,
                    y: ob.y,
                    time: ob.time,
                    x_curr: ob.x_curr,
                    y_curr: ob.y_curr
                };

                response.writeHead(200);
                response.end();
            } catch (error) {
                console.error('Failed to parse player data:', error);
                response.writeHead(400);
                response.end('Invalid player data');
            }

        } else if (filename === 'update') {
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(Object.values(players)));

        } else if (extension in some_mime_types && fs.existsSync(filename)) {
            fs.readFile(filename, (err, data) => {
                if (err) {
                    console.error('File read error:', err);
                    response.writeHead(500);
                    response.end('Internal Server Error');
                    return;
                }
                response.writeHead(200, { "Content-Type": some_mime_types[extension] });
                response.end(data);
            });

        } else {
            response.writeHead(404, { "Content-Type": "text/html" });
            response.end(`<html><body><h1>404 - Not found</h1><p>There is no file named "${filename}".</p></body></html>`);
        }
    });
};

// Create and start the server
const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

// Handle server errors
server.on('error', (err) => {
    console.error('Server encountered an error:', err);
});
