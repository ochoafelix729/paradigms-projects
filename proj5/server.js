const http = require("http");
const fs = require("fs");

const host = '127.0.0.1';
const port = 8069;

const some_mime_types = {
    '.html': 'text/html',
    '.ico': 'image/png',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.zip': 'application/zip',
}

let players = {};


const requestListener = (request, response) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => {
      
        

      const filename = request.url.substring(1); // cut off the '/'
      const last_dot = filename.lastIndexOf('.');
      const extension = last_dot >= 0 ? filename.substring(last_dot) : '';

      if (filename !== 'update') {
        console.log(`Got a request for ${request.url}, body=${body}`);
      }

      if (filename === 'left_click' || filename === 'right_click') {

        let ob = JSON.parse(body);


          players[ob.id] = {
            action: ob.action,
            type: ob.type,
            id: ob.id,
            x: ob.x,
            y: ob.y,
            time: ob.time,
            x_curr: ob.x_curr,
            y_curr: ob.y_curr
          }

        response.writeHead(200);
        response.end();
          
      }

      else if (filename === 'update') {

        response.setHeader('Content-Type', 'application/json');
        response.writeHead(200);
        
        response.end(JSON.stringify(Object.values(players)));
      }
      
      else if (extension in some_mime_types && fs.existsSync(filename)) {
          fs.readFile(filename, null, (err, data) => {
              response.setHeader("Content-Type", some_mime_types[extension]);
              response.writeHead(200);
              response.end(data);
          });
      } 
      
      else {
          response.setHeader("Content-Type", "text/html");
          response.writeHead(404);
          response.end(`<html><body><h1>404 - Not found</h1><p>There is no file named "${filename}".</body></html>`);
      }
    });
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

server.on('error', (err) => {
    console.error('Server encountered an error:', err);
});