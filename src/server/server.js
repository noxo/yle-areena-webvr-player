import express from "express";
import path from "path";
import proxy from 'http-proxy-middleware'; 

/**
 * @author Erkki Nokso-Koivisto / http://www.vihrearobotti.com/
 */

export default class Server
{
  
    start() {
     
        const app = express();
        
        // CORS proxy to access program API
        app.use('/v1', proxy({target: 'https://external.api.yle.fi/', changeOrigin: true, logLevel:"debug"}));
        // CORS proxy to access program icons for menu grid
        app.use('/image/upload/', proxy({target: 'http://images.cdn.yle.fi/', changeOrigin: true,logLevel:"debug"}));
        // CORS proxy access video stream, host seems to change per media type
        app.use('/world/', proxy({target: 'https://areenapmdworld-a.akamaihd.net/', changeOrigin: true,logLevel:"debug"}));
        // to access static HTML/image stuff in dist/ folder
        app.use(express.static(path.join(__dirname, '.')));

        app.listen(8080);
    }
}

const server = new Server();
server.start();