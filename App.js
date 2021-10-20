/*
* Title: Initial file
* Description:  Initial file to start the node server and workers
* Author: Shabbir Hossain Shah
* Date: 15/10/2021
*/

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');   

//  App object - Module scaffolding🥋
const app = {};
app.init = ()=>{
    //  start the server
    server.init();
    //  start the workers
    workers.init();
};
// process.on('uncaughtException', function (err) {
//     console.log(err);
// }); 

app.init();

module.exports = app;