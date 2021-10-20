/*
* Title: Utilities
* Description: Necessary utilities for validation and other use case
* Author: Shabbir Hossain Shah
* Date: 11/10/2021
*/

//  Dependencies
const crypto = require('crypto');
const environments = require('./environments');

//  Module scaffolding
const utilities = {};

//  Parse JSON string ro Object
utilities.parseJSON = (jsonString)=>{
    let output;
    try{
        output = JSON.parse(jsonString);
    } catch{
        output = {};
    };
    return output;
};  

//  Hash string (Input: String, Return: Hashed string)
utilities.hash = (str)=>{
    if(typeof str === 'string' && str.length > 0){
        const hash = crypto
            .createHmac('sha256', environments.secretKey)
            .update(str)
            .digest('hex');
        return hash;
    }
    return false;
};


//  Generate random string for token (Input: length/number, Return: random strikng of 20 charecter)
utilities.createRandomString = (stringLength)=>{
        let length = stringLength;
        length = typeof(stringLength) === 'number' && stringLength > 0 ? stringLength : false;

    if(length){
        const possibleCharecters =  "abcdefghijklmnopqrstuvwxyz1234567890";
        let output = '';
        for (let i = 0; i < length; i+=1) {
            let randomCharecter = possibleCharecters.charAt(Math.floor(Math.random() * possibleCharecters.length));
            output += randomCharecter;
        }
        return output;
    }else{
        return false;
    };
};

//  Export module
module.exports = utilities;