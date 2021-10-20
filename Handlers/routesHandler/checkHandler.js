/*
* Title: Check Handler
* Description: Handler to handle user defined checks
* Author: Shabbir Hossain Shah
* Date: 13/10/2021
*/

// Dependencies
const data = require('../../lib/data');
const {hash, parseJSON, createRandomString} = require('../../Helpers/utilities');
const tokenHandler = require('./tokenHandler');
const {maxChecks} = require('../../Helpers/environments');

// module scaffolding
const handler = {};

//  checking the methode
handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethodes = ['get', 'post', 'put', 'delete'];
    if(acceptedMethodes.indexOf(requestProperties.method) > -1){
        handler._check[requestProperties.method](requestProperties, callback);
    } else{
        callback(405);
    };
};

//  Check sub-module scaffolding
handler._check = {};

//  Post check request 
handler._check.post = (requestProperties, callback)=>{
    //  Validate input
    let protocol = typeof(requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    let url = typeof(requestProperties.body.url) === 'string' &&  requestProperties.body.url.trim().length > 0? requestProperties.body.url : false;

    let method = typeof(requestProperties.body.method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;

    let successCodes = typeof(requestProperties.body.successCodes) === 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false;
    
    let timeoutSeconds = typeof(requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 5? requestProperties.body.timeoutSeconds : false;

    if(protocol && url && method && successCodes && timeoutSeconds){
        //  Token verify
        let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;

        //  Lookup the user phone by using the token
        data.read('tokens', token, (err1, tData)=>{
            const tokenData = parseJSON(tData);
            if(!err1 && tokenData){
                let userPhone = tokenData.phone;
                //  Lookup the user data
                data.read('users', userPhone, (err2, uData)=>{
                    const userData = parseJSON(uData);
                    if(!err2 && userData){
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid)=>{
                            if(tokenIsValid){
                                let userChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];
                                if(userChecks.length < maxChecks){
                                    let checkId = createRandomString(20);
                                    let checkObject = {
                                        id: checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds
                                    };

                                    // save the object to db
                                    data.create('checks', checkId, checkObject, (err3)=>{
                                        if(!err3){
                                            //  add checkId to the user's data
                                            userData.checks = userChecks;
                                            userData.checks.push(checkId);

                                            // update the user in db
                                            data.update('users', userPhone, userData, (err4)=>{
                                                if(!err4){
                                                    //  Return the data of new check
                                                    callback(200, checkObject);
                                                }else{
                                                    callback(500, {
                                                        error: "Failed to update user data. Server side error..!",
                                                    });
                                                };
                                            });
                                        }else{
                                            callback(500, {
                                                error: "There is a problem saving the data, server side error..!"
                                            });
                                        };
                                    });
                                }else{
                                    callback(401, {
                                        error: "User has already reached maximum check limit..!",
                                    });
                                };
                            }else{
                                callback(403, {
                                    error: "Token is not valid",
                                });
                            };
                        });
                    } else{
                        callback(500, {
                            error: "There was an error getting user data..!",
                        });
                    };
                });
            } else{
                callback(403,{
                    error: "Authentication failed..!",
                });
            };
        });
    }else{
        callback(400, {
            error: "You have problem in your input..!",
        });
    };

};

//  Get check request with authentication
handler._check.get = (requestProperties, callback)=>{
    const id =  
     typeof(requestProperties.querySrtingObject.id) === 'string' && 
     requestProperties.querySrtingObject.id.trim().length === 20
         ? requestProperties.querySrtingObject.id 
         : false;
    
    if(id){
        //  Lookup the check
        data.read('checks', id, (err, cData)=>{
            const checkData = parseJSON(cData);
            if(!err && checkData){
                //  Token verify
                let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;
                tokenHandler._token.verify(token, checkData.userPhone, (tokenIsValid)=>{
                    if(tokenIsValid){
                        callback(200, checkData);
                    }else{
                        callback(403, {
                            error: "Authentication failed..!",
                        });
                    };
                }); 
            } else{
                callback(500, {
                    error: "Something went wrong. Server side error..!",
                });
            };
        });
    } else{
        callback(400, {
            error: "There is a problem in your request..!",
        });
    };  
};

//  Put  check request with authentication
handler._check.put = (requestProperties, callback)=>{
    const id =  
     typeof(requestProperties.body.id) === 'string' && 
     requestProperties.body.id.trim().length === 20
         ? requestProperties.body.id 
         : false;

     //  Validate input
     let protocol = typeof(requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

     let url = typeof(requestProperties.body.url) === 'string' &&  requestProperties.body.url.trim().length > 0? requestProperties.body.url : false;
 
     let method = typeof(requestProperties.body.method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;
 
     let successCodes = typeof(requestProperties.body.successCodes) === 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false;
     
     let timeoutSeconds = typeof(requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 5? requestProperties.body.timeoutSeconds : false;

    //  check the id if valid
    if(id){
        if(protocol || url || method || successCodes || timeoutSeconds){
            // authentication
            data.read('checks', id, (err1, cData)=>{
                const checkData = parseJSON(cData);
                if(!err1 && checkData){
                    //  Token verify
                    let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;
                    tokenHandler._token.verify(token, checkData.userPhone, (tokenIsValid)=>{
                        if(tokenIsValid){
                            if(protocol){
                                checkData.protocol = protocol;
                            }
                            if(url){
                                checkData.url = url;
                            }
                            if(method){
                                checkData.method = method; 
                            }
                            if(successCodes){
                                checkData.successCodes = successCodes; 
                            }
                            if(timeoutSeconds){
                                checkData.timeoutSeconds = timeoutSeconds;
                            }

                            //  Store the check object
                            data.update('checks', id, checkData, (err2)=>{
                                if(!err2){
                                    callback(200, {
                                        message: "Successfully updated the check..!"
                                    });
                                } else{
                                    callback(500, {
                                        error: "Faild to update the check. Server side error..!",
                                    });
                                };
                            });
                        }else{
                            callback(403, {
                                error: "Invalid token. Authentication failed..!",
                            });
                        };
                    });
                }else{
                    callback(500, {
                        error: "Faild to get check data. Server side error..!",
                    });
                };
            });
        }else{
            callback(400, {
                error: "Nothing to update..!",
            });
        };
    }else{
        callback(400, {
            error: "Id is not valid..!",
        });
    };
};

// Delete check request with authentication
handler._check.delete = (requestProperties, callback)=>{
    const id =  
     typeof(requestProperties.querySrtingObject.id) === 'string' && 
     requestProperties.querySrtingObject.id.trim().length === 20
         ? requestProperties.querySrtingObject.id 
         : false;
    
    if(id){
        //  Lookup the check
        data.read('checks', id, (err1, cData)=>{
            const checkData = parseJSON(cData);
            if(!err1 && checkData){
                //  Token verify
                let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;
                tokenHandler._token.verify(token, checkData.userPhone, (tokenIsValid)=>{
                    if(tokenIsValid){
                        // delete the check
                        data.delete('checks', id, (err2)=>{
                            if(!err2){
                            // Read the user data by the check data
                            data.read('users', checkData.userPhone, (err3, uData)=>{
                                const userData = parseJSON(uData);
                                if(!err3 && userData){
                                    let userChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : false;

                                    // Remove the check id from the user's list of check
                                    let checkPosition = userChecks.indexOf(id);
                                        if(checkPosition > -1){
                                            userChecks.splice(checkPosition, 1);
                                            userData.checks = userChecks;
                                            //  Resave the user data
                                            data.update('users', userData.phone, userData, (err4)=>{
                                                if(!err4){
                                                    callback(200, {
                                                        message: "Successfully deleted check and updated all data..!",
                                                    });
                                                }else{
                                                    callback(500, {
                                                        error: "Failed to update user data. Server side error..!",
                                                    });
                                                };
                                            });
                                        }else{
                                            callback(500, {
                                                error: "Check not found. Server side error..!",
                                            });
                                        };
                                }else{
                                    callback(500, {
                                        error: "Failed to get user data. Server side error..!",
                                    });
                                };
                            }); 
                            } else{
                                callback(500, {
                                    error: "Failed to delete the check. Server side error..!",
                                });
                            };
                        });
                    }else{
                        callback(403, {
                            error: "Authentication failed..!",
                        });
                    };
                }); 
            } else{
                callback(500, {
                    error: "Something went wrong. Server side error..!",
                });
            };
        });
    } else{
        callback(400, {
            error: "There is a problem in your request..!",
        });
    };  
};


module.exports = handler;