/*
* Title: Routes 
* Description: Application Routes
* Author: Shabbir Hossain Shah
* Date: 09/10/2021
*/

//  dependencies
const {sampleHandler} = require('./Handlers/routesHandler/sampleHandler');
const {userHandler} = require('./Handlers/routesHandler/userHandler');
const {tokenHandler} = require('./Handlers/routesHandler/tokenHandler');
const {checkHandler} = require('./Handlers/routesHandler/checkHandler');

const routes = {
    sample: sampleHandler,
    user: userHandler,
    token: tokenHandler,
    check: checkHandler,
};


module.exports = routes;