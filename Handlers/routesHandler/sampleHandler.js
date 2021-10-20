/*
* Title: Sample handler
* Description: Sample handler module
* Author: Shabbir Hossain Shah
* Date: 09/10/2021
*/

// module scaffolding
const handler = {};

handler.sampleHandler = (requestProperties, callBack) => {
    callBack(200, {
        message: 'Hello from sampleHandler',
    })
};


module.exports = handler;