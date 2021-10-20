/*
* Title: Token handler
* Description: Handler to handle token related routes
* Author: Shabbir Hossain Shah
* Date: 11/10/2021
*/

// Dependencies
const data = require('../../lib/data');
const {hash, parseJSON, createRandomString} = require('../../Helpers/utilities');
const { token } = require('../../routes');

// module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethodes = ['get', 'post', 'put', 'delete'];
    if(acceptedMethodes.indexOf(requestProperties.method) > -1){
        handler._token[requestProperties.method](requestProperties, callback);
    }else{
        callback(405)
    }
};

//  sub module scaffolding
handler._token = {};


//  Handle POST request
handler._token.post = (requestProperties, callback)=>{
    const phone =  
            typeof(requestProperties.body.phone) === 'string' && 
            requestProperties.body.phone.trim().length === 11 
                ? requestProperties.body.phone 
                : null;

    const password =  
            typeof(requestProperties.body.password) === 'string' && 
            requestProperties.body.password.trim().length > -1
                ? requestProperties.body.password 
                : null;
                
    //  Verify the user
    if(phone && password){
            data.read('users', phone, (err1, uData)=>{
                const userData = {...parseJSON(uData)}
                let hashedPassword = hash(password);
                if(hashedPassword === userData.password){
                    let tokenId = createRandomString(20);
                    let expires = Date.now() + 60 * 60 * 1000;
                    let tokenObject = {
                        phone,
                        id: tokenId,
                        expires: expires,
                    };

                    //  store the token
                    data.create('tokens', tokenId, tokenObject, (err2)=>{
                        if(!err2){
                            callback(200, tokenObject);
                        }else{
                            callback(500, {
                                error: "There was a problem in the server",
                            })
                        };
                    });
                }else{
                    callback(404, {
                        error: "Password is not valid",
                    });
                };
            });
    }else{
        callback(400, {
            error: "You have a problem in your request",
        });
    };
};

//  Handle GET request 
handler._token.get = (requestProperties, callback)=>{
     // Check the token if valid    
     const id =  
     typeof(requestProperties.querySrtingObject.id) === 'string' && 
     requestProperties.querySrtingObject.id.trim().length === 20
         ? requestProperties.querySrtingObject.id 
         : false;
        // lookup the token
        id
        ? data.read('tokens', id, (err, tokenData)=>{
            const token = parseJSON(tokenData);
                if(!err && token){
                    callback(200, token);
                } else{
                    callback(404, {
                        error: "Token not exists.!",
                    });
                };
            })
        : callback(404, {
    error: "Token not found..!",
        });
};

//  Handle PUT request 
handler._token.put = (requestProperties, callback)=>{
    //  check the token if valid
    const id =  
    typeof(requestProperties.body.id) === 'string' && 
    requestProperties.body.extend
        ? requestProperties.body.id 
        : false;

    const extend =  typeof(requestProperties.body.extend) === 'boolean' && 
    requestProperties.body.extend === true
        ? true
        : false;


    if(id && extend){
        data.read('tokens', id, (err1, tData)=>{
            const tokenData = parseJSON(tData);
            if(!err1 && tokenData){
                if(tokenData.expires > Date.now()){
                    tokenData.expires = Date.now() + 60 * 60 * 1000;
                    //  store the updated token
                    data.update('tokens', id, tokenData, (err2)=>{
                        if(!err2){
                            callback(200, {
                                error: "Successfully updated token..!",
                            });
                        }else{
                            callback(500, {
                                error: "Failed to update the token..! Server side error",
                            })
                        };
                    });
                }else{
                    callback(400, {
                        error: "Token already expired..!",
                    }); 
                };
            }else{
                callback(500, {
                    error: "There is a problem in the server side..! ",
                });
            };
        });
    }else{
        callback(400, {
            error: "There is a problem in your request..! id or extended time may be missing."
        });
    };
};

//  Handle DELETE request 
handler._token.delete = (requestProperties, callback)=>{
    // check the token if valid
    const id =  
    typeof(requestProperties.querySrtingObject.id) === 'string' && 
    requestProperties.querySrtingObject.id.trim().length === 20 
        ? requestProperties.querySrtingObject.id
        : false;
    
        if(id){
            // lookup the token if exists in the DB
            data.read('tokens', id, (err1, tokenData)=>{
                if(!err1 && tokenData){
                        data.delete('tokens', id, (err2)=>{
                            if(!err2){
                                callback(200, {
                                    message: "Token deleted successfully..!",
                                });
                            }else{
                                callback(500, {
                                    error: "Error deleting the token from DB..!"
                                });
                            };
                        });
                }else{
                    callback(500, {
                        error: "There was a problem in the server side. Please try again...!",
                    });
                };
            });
        }else{
            callback(400, {
                error: "There was a problem in your reqest. Please try again...!",
            });
        };
};

//  general function for token verify
handler._token.verify = (id, phone, callback)=>{
    data.read('tokens', id, (err1, tData)=>{
        const tokenData = parseJSON(tData);
            if(!err1 && tokenData){
                    if(tokenData.phone === phone && tokenData.expires > Date.now()){
                        callback(true);
                    }else{
                        callback(false);
                    };
            }else{  
                callback(false);
            };
    });
};

module.exports = handler;