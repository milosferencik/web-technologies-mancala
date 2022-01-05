const http = require('http');
const path = require('path');
const url  = require('url');
const fs = require('fs');
const conf = require('./conf.js');
const game = require('./game.js');
const user = require('./user.js');

function doGetPathname(pathname,response) {
    const mediaType = getMediaType(pathname);
    const encoding = isText(mediaType) ? "utf8" : null;

    fs.readFile(pathname,encoding,(err,data) => {
        if(err) {
            response.writeHead(404); // Not Found
            response.end();
        } else {
            response.writeHead(200, { 'Content-Type': mediaType });
            response.end(data);
        }
    });    
}

function getMediaType(pathname) {
    const pos = pathname.lastIndexOf('.');
    let mediaType;

    if(pos !== -1) 
       mediaType = conf.mediaTypes[pathname.substring(pos+1)];

    if(mediaType === undefined)
       mediaType = 'text/plain';
    return mediaType;
}

function isText(mediaType) {
    return !mediaType.startsWith('image');
}

function doGetFile(pathname, response) {
    let absolutePathname = path.normalize(conf.documentRoot+pathname);

    if(! absolutePathname.startsWith(conf.documentRoot)) {
        response.writeHead(403); // Forbidden
        response.end();
    } else
        fs.stat(absolutePathname,(err,stats) => {
            if(err) {
                response.writeHead(500); // Internal Server Error
                response.end();
            } else if(stats.isDirectory()) {
                if(absolutePathname.endsWith('/'))
                doGetPathname(absolutePathname+conf.defaultIndex,response);
                else {
                response.writeHead(301, {'Location': absolutePathname+'/' }); // Moved Permanently
                response.end();
                }
            } else 
                doGetPathname(absolutePathname,response);
        });
}

function doGet(preq, request, response) {
    switch(preq.pathname) {
    case '/update':
        game.update(preq.query.game, preq.query.nick, response);
        break;
    default:
        doGetFile(preq.pathname, response);
        break;
    }
}

function doPost(preq, payload, response) {
    switch(preq.pathname) {
    case '/join':
        game.join(payload, response);
      break;
    case '/leave':
        game.leave(payload, response);
       break;
    case '/notify':
        game.notify(payload, response);
        break;
    case '/ranking':
        user.ranking(response);
        break;
    case '/register':
        user.register(payload, response);
        break;
    default:
       answer.status = 400;
       break;
    }
}

http.createServer(function (request, response) {
    const preq = url.parse(request.url,true);
    
    switch(request.method) {
    case 'GET':
        doGet(preq, request, response);
        break;
    case 'POST':
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            doPost(preq, JSON.parse(body), response);
        });
        break;
    default:
        response.writeHead(501); // 501 Not Implemented
        response.end();    
    }
}).listen(conf.port);
// console.log('Server running at http://127.0.0.1:'+conf.port+'/');