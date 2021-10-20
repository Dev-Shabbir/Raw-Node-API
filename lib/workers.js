/*
* Title: Worker library 
* Description: Worker related files
* Author: Shabbir Hossain Shah
* Date: 15/10/2021 
*/

// Dependencies
const { parseJSON } = require('../Helpers/utilities');
const data = require('./data');
const url = require('url');
const http = require('http');
const https = require('https');
const { send } = require('process');
const {sendTwilioSms} = require('../Helpers/notifications');

//  Worker object - Module scaffolding
const workers = {};

    //  lookup all the checks
    workers.gatehrAllChecks = () =>{
        //  get all the checks
        data.list('checks', (err1, checks)=>{
            if(!err1 && checks && checks.length > 0){
                checks.forEach(check =>{
                    //  read the checkData
                    data.read('checks', check, (err2, cData)=>{
                        const checkData = parseJSON(cData);
                        if(!err2 && checkData){
                            //  pass check data to the check validator
                            workers.validateCheckData(checkData);
                        }else{  
                            console.log("Error: Check data not found...!")
                        };
                    });
                });
            }else{
                console.log("Error: Cluld not find any checks..!")
            };
        });
    };

    // Validate check data
    workers.validateCheckData = (checkData)=>{
        if(checkData && checkData.id){
            checkData.state = typeof(checkData.state) === 'string' && ["up", "down"].indexOf(checkData.state) > -1 ? checkData.state : "down";
            checkData.lastChecked = typeof(checkData.lastChecked) === 'number' && checkData.lastChecked > 0 ? checkData.lastChecked : false;


            //  pass to the next process
            workers.performCheck(checkData);
        }else{  
            console.log("Error: Check was invalid or not porperly done..!")
        };  
    };

    //  perform check
    workers.performCheck = (cData)=>{
        const checkData = cData;
        //  checkoutcome blank model
        let checkOutcome = {
            error: false,
            responseCode: false,
        };

        //  mark the outcome previously sent or not
        let outcomeSent = false;

        // parse the hostname and full url
        const parsedUrl = url.parse(`${checkData.protocol}://${checkData.url}`, true);
        const hostName = parsedUrl.hostname;
        const path = parsedUrl.path;
        //  construct the request
        const requestDetails = {
            protocol : checkData.protocol +":",
            hostname : hostName,
            method : checkData.method.toUpperCase(),
            path : path,
            timeout: checkData.timeoutSeconds * 1000
        };
        const protocolToUse = checkData.protocol === 'http' ? http : https;

        let req = protocolToUse.request(requestDetails, (res)=>{
            //  grab the status of the response
            const status = res.statusCode;
            // update the check outcome and pass to the next process
            checkOutcome.responseCode = status;
            if(!outcomeSent){
                workers.processCheckOutcome(checkData, checkOutcome);
                outcomeSent = true;
            };
        });

        // req.on('data', (err, data)=>{
        //     console.log(err)
        //     console.log(parseJSON(data))
        // });

        req.on('error', (e)=>{
            checkOutcome ={
                error: true,
                value: e
            };
              // update the check outcome and pass to the next process
              if(!outcomeSent){
                workers.processCheckOutcome(checkData, checkOutcome);
                outcomeSent = true;
            }
        });

        req.on('timeout', (e)=>{
            checkOutcome ={
                error: true,
                value: 'timeout'
            };
              // update the check outcome and pass to the next process
              if(!outcomeSent){
                workers.processCheckOutcome(checkData, checkOutcome);
                outcomeSent = true;
            }
        });
        req.end();
    };

    //   the final process with outcome
    workers.processCheckOutcome = (checkData, checkOutcome) =>{
        //  check if check outcome is up or down
        let state = !checkOutcome.error  && checkOutcome.responseCode && checkData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? "up" : "down";
        
        //  decide whether we should alert the user or not 
        let alertWanted =  checkData.lastChecked && checkData.state !== state ? true : false;

        //  update the check data
        let newCheckData = checkData;
        newCheckData.state = state;
        newCheckData.lastChecked = Date.now();

        //  save the updated check in DB
        data.update('checks', newCheckData.id, newCheckData, (err)=>{
            if(!err){
                if(alertWanted){
                    //  send check data to next process
                    workers.alertUserWithChanges(newCheckData);
                }else{
                    console.log("Error: Alert is not needed..!");
                };
            }else{
                console.log("Error: Trying to update checkData in db. server side error..!")
            };
        });
    };
     

    //  send the notificaton to user if state changes
    workers.alertUserWithChanges =(newCheckData)=>{
        let msg = `Alert: Your check result for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is corrently ${newCheckData.state}.`;

        //  send the notification
        sendTwilioSms(newCheckData.userPhone, msg, (err)=>{
            if(!err){
                console.log(`User was alerted successfully. The msg is: ${msg}`);
            }else{
                console.log(`Error: Failed to send twillo sms. The actual error is ${err}`);
            };
        });
    };

    //  timer to execute the process ince per minute
    workers.loop = ()=>{
        setInterval(()=>{
            workers.gatehrAllChecks();
        }, 5000);      
    };

    // Start the workers
    workers.init = ()=>{
    //  execute all checks
    workers.gatehrAllChecks();
    //  call the loop so that checks continue
    workers.loop();
    };

module.exports = workers;