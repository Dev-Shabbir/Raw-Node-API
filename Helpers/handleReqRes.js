/*
* Title: Handle Request Response
* Description: Handle Request and Response
* Author: Shabbir Hossain Shah
* Date: 09/10/2021
*/

// dependencies
const url = require('url');
const {StringDecoder} = require('string_decoder');
const routes = require('../routes');
const {notFoundHandler} = require('../Handlers/routesHandler/notFoundHandler');
const {parseJSON} = require('../Helpers/utilities');




// module scaffolding
const handler = {};

handler.handleReqRes  = (req, res) =>{
        // get the url and parse it
        const parsedUrl = url.parse(req.url, true);
        const path = parsedUrl.pathname;
        const trimmedPath = path.replace(/^\/+|\/+$/g, '');
        const method = req.method.toLowerCase();
        const querySrtingObject = parsedUrl.query;
        const headersObject = req.headers;
        const requestProperties = {
            parsedUrl,
            path,
            trimmedPath,
            method,
            querySrtingObject,
            headersObject,
        };
        
    const decoder = new StringDecoder('utf-8');

    //  Router choosing function-choosenHandler
    const choosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;
    let realData = ''; 

    //  request handling
    req.on('data', (buffer) => {
            realData += decoder.write(buffer);
        req.on('end', () =>{
             realData += decoder.end();

            requestProperties.body = parseJSON(realData);

            //  Calling the choosen handler function
            choosenHandler(requestProperties, (statusCode, payLoad) =>{
                    statusCode = typeof(statusCode) === 'number' ? statusCode : 500;
                    payLoad = typeof(payLoad) === 'object' ? payLoad : {};
                    const payLoadString = JSON.stringify(payLoad);

                    //  Return the final response
                    res.setHeader("content-type", "application/json")
                    res.writeHead(statusCode);

                    // response handleing
                    res.end(payLoadString);
                });
            });
    });

};

module.exports = handler;