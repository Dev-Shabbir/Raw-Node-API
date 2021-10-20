/*
* Title: Environments
* Description: Handle all environment related things
* Author: Shabbir Hossain Shah
* Date: 09/10/2021
*/



//  Dependencies
// const process = require("process");


//  Module scaffolding
const environments = {};

environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'stagingsecretkey',
    maxChecks: 5,
    twilio:{
        fromPhone: '+18453933511',
        accountSid: 'AC6c3ab65779e057e341f0d4849caad8d7',
        authToken: '9e7fc4b8d3d357d99beb03ed46b021eb'
    },
};

environments.production ={
    port: 4000,
    envName: 'production',
    secretKey: 'productionsecretkey',
    maxChecks: 5,
    twilio:{
        fromPhone: '+18453933511',
        accountSid: 'AC6c3ab65779e057e341f0d4849caad8d7',
        authToken: '9e7fc4b8d3d357d99beb03ed46b021eb'
    },
};


// determine which environment was passed
const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV : 'staging';

// prepare export corresponding environment object
const environmentToExport = typeof(environments[currentEnvironment]) === 'object' 
? environments[currentEnvironment] 
: environments.staging;

// export module
module.exports = environmentToExport;