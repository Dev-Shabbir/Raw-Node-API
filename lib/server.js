/*
* Title: Server library
* Description: Server related files
* Author: Shabbir Hossain Shah
* Date: 15/10/2021 
*/

// Dependencies
const http = require('http');
const {handleReqRes} = require('../Helpers/handleReqRes');
const environment = require('../Helpers/environments');

//  Server object - Module scaffolding🥋
const server = {};

// Testing file system
// data.read('test', 'newFile',  (err, data)=>{
//     console.log("Error:", err)
// })

//  Testing twilio sms
// sendTwilioSms('01929294200', 'Hello Shabbir..! You are awesome', (err)=>{
//     console.log(err);
// });



//  Create server
server.createServer = ()=>{
    const createServerVariable = http.createServer(server.handleReqRes);
    createServerVariable.listen(environment.port, ()=>{
        console.log(`Listening to ${environment.port}`);
    });
};

//  Handle request response
server.handleReqRes = handleReqRes;

// Start the server🚀
server.init = ()=>{
    server.createServer();
};

module.exports = server;