/*
* Title: Not Found handler
* Description: 404 Not Found handler module
* Author: Shabbir Hossain Shah
* Date: 09/10/2021
*/

// module scaffolding
const handler = {};

handler.notFoundHandler = (requestProperties, callBack) => {
    callBack(404, {
        message: 'Your requested URL was not found',
    })
};


module.exports = handler;