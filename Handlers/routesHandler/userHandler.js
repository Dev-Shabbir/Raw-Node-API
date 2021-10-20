/*
* Title: User handler
* Description: Handler to handle user related routes 
* Author: Shabbir Hossain Shah
* Date: 10/10/2021-12/10/2021
*/

// Dependencies
const data = require('../../lib/data');
const {hash, parseJSON} = require('../../Helpers/utilities');
const tokenHandler = require('./tokenHandler');

// module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
    const acceptedMethodes = ['get', 'post', 'put', 'delete'];
    if(acceptedMethodes.indexOf(requestProperties.method) > -1){
        handler._user[requestProperties.method](requestProperties, callback);
    } else{
        callback(405);
    };
};

//  Necessary tools for user Module scaffolding
handler._user = {};

//  Post user 
handler._user.post = (requestProperties, callback)=>{
    const firstName =  
        typeof(requestProperties.body.firstName) === 'string' && 
        requestProperties.body.firstName.trim().length > 0 
                ? requestProperties.body.firstName 
                : null;

    const lastName =  
        typeof(requestProperties.body.lastName) === 'string' && 
        requestProperties.body.lastName.trim().length > 0 
                ? requestProperties.body.lastName 
                : null;

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

    const tosAgreement =  
            typeof(requestProperties.body.tosAgreement) === 'boolean'  &&
                requestProperties.body.tosAgreement
                ? requestProperties.body.tosAgreement 
                : null;
    if(firstName && lastName && phone  && tosAgreement){
            //  Checking the user already exists or not
            data.read('users', phone, (err1)=>{
                if(err1){
                    let newUserObject = {
                        firstName,
                        lastName,   
                        phone,
                        password: hash(password),
                        tosAgreement
                    };
                //  Store the user in DB
                data.create('users', phone, newUserObject, (err2)=>{
                    if(!err2){
                        callback(200, {
                            message: 'Successfully created user'
                        })
                    } else{
                        callback(500, {
                            error: 'Could not create user!'
                        });
                    }
                });  
                } else{
                    callback(500, {
                        error: `There was a problem in server side, The error is: ${err1}`,
                    });
                };
            });
    } else{
        callback(400, {
            error: 'You have problem in your request',
        });
    }; 
};

//  Get user with authentication
handler._user.get = (requestProperties, callback)=>{
    // Check the phone number if valid    
    const phone =  
            typeof(requestProperties.querySrtingObject.phone) === 'string' && 
            requestProperties.querySrtingObject.phone.trim().length === 11 
                ? requestProperties.querySrtingObject.phone 
                : null;

    //  Token verify
    let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;

    phone
                ?  tokenHandler._token.verify(token, phone, (tokenId) =>{
                    if(tokenId){
                            // lookup the uaer
                            data.read('users', phone, (err, uData)=>{
                                const user = parseJSON(uData);
                                    if(!err && user){
                                        delete user.password;
                                        callback(200, user);
                                    } else{
                                        callback(404, {
                                            error: "User not exists..!"
                                        });
                                    };
                                })
                        }else{
                            callback(403, {
                                error: "Authenticaton failed..!",
                        });
                    };
                })
                : callback(404, {
                    error: "User not found..!",
                });
};

//  Put  user with authentication
handler._user.put = (requestProperties, callback)=>{
    const phone =  
            typeof(requestProperties.body.phone) === 'string' && 
            requestProperties.body.phone.trim().length === 11 
                ? requestProperties.body.phone 
                : null;
    const firstName =  
            typeof(requestProperties.body.firstName) === 'string' && 
            requestProperties.body.firstName.trim().length > 0 
                    ? requestProperties.body.firstName 
                    : null;
        
    const lastName =  
            typeof(requestProperties.body.lastName) === 'string' && 
            requestProperties.body.lastName.trim().length > 0 
                    ? requestProperties.body.lastName 
                    : null;
    
    const password =  
            typeof(requestProperties.body.password) === 'string' && 
            requestProperties.body.password.trim().length > -1
                ? requestProperties.body.password 
                : null;
     //  Token verify
     let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;

    //  Ternary operation start for making the update route in the api
        if(phone){
            tokenHandler._token.verify(token, phone, (tokenId) =>{
                if(tokenId){
                        // lookup the uaer
                        if(firstName || lastName || password){
                            data.read('users', phone, (err1, uData) =>{
                                const userData = parseJSON(uData);
                                    if(!err1 && userData){
                                        if(firstName){
                                            userData.firstName = firstName;
                                        }
                                        if(lastName){
                                            userData.lastName = lastName;
                                        }
                                        if(password){
                                            userData.password = hash(password);
                                        }
                                        // Store in DB
                                        data.update('users', phone, userData, (err2)=>{
                                            if(!err2){
                                                callback(200, {
                                                    message: "User updated successfully",
                                                });
                                            }else{
                                                callback(500, {
                                                    error: "Server side error to store data in db",
                                                });
                                            };
                                        });
                                    }else{
                                        callback(400, {
                                            error: "Something not done properly. Please try again"
                                        });
                                    };
                            });
                        } else{
                            callback(400, {
                                error: "You have a problem in your request",
                            });
                        };
                    }else{
                        callback(403, {
                            error: "Authenticaton failed..!",
                    });
                };
            })
        } else{ 
            callback(400, {
                error: "Invalid phone number",
            });
        };
};

// Delete user with authentication
handler._user.delete = (requestProperties, callback)=>{
    // check the phone if valid
    const phone =  
    typeof(requestProperties.querySrtingObject.phone) === 'string' && 
    requestProperties.querySrtingObject.phone.trim().length === 11 
        ? requestProperties.querySrtingObject.phone 
        : null;
        
     //  Token verify
     let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;
    
        if(phone){
            tokenHandler._token.verify(token, phone, (tokenId) =>{
                if(tokenId){
                        // lookup the file if exists in the DB
                        data.read('users', phone, (err1, userData)=>{
                            if(!err1 && userData){
                                    data.delete('users', phone, (err2)=>{
                                        if(!err2){
                                            callback(200, {
                                                message: "User deleted successfully",
                                            });
                                        }else{
                                            callback(500, {
                                                error: "Error deleting the file from DB"
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
                        callback(403, {
                            error: "Authenticaton failed..!",
                    });
                };
            });
        }else{
            callback(400, {
                error: "There was a problem in your reqest. Please try again...!",
            });
        };
};


module.exports = handler;