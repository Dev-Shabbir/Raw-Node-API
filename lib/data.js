/*
* Title: Data
* Description: Store and organizing data
* Author: Shabbir Hossain Shah
* Date: 10/10/2021
*/

//  Dependencies
const fs = require('fs');
const path = require('path');

//  Module scaffolding
const lib = {};

//  Base directory for data folder
lib.basedir = path.join(__dirname, '/../.data/');

//  Write data to file
lib.create = (dir, file, data, callback)=>{
    //  Open file
    fs.open(`${lib.basedir+dir}/${file}.json`, 'wx', (err1, fileDescriptor)=>{
        if(!err1 && fileDescriptor){
            //  convert data to string
            const stringData = JSON.stringify(data);

            //  write data to file and close it 
            fs.writeFile(fileDescriptor, stringData, (err2)=>{
                !err2
                ? fs.close(fileDescriptor, (err3)=>{
                    !err3
                    ? callback(false)
                    : callback(err3);
                })  
                : callback('Oops..! failed to write new file..!')
            });
        } else{
            callback(err1)
        };
    });
};

//  Read data from file
lib.read = (dir, file, callback)=>{
    fs.readFile(`${lib.basedir+dir}/${file}.json`, 'utf-8', (err, data)=>{
        callback(err, data);
    });
};

//  Update existig file
lib.update = (dir, file, data, callback)=>{
    //  open file for writing
    fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (err1, fileDescriptor)=>{
        if(!err1 && fileDescriptor){
            //  convert the data into string
            const stringData = JSON.stringify(data);

            //  truncate the file
            fs.ftruncate(fileDescriptor, (err2)=>{
                !err2
                ?  
                //  write the file and close it
                fs.writeFile(fileDescriptor, stringData, (err3)=>{
                    !err3
                    ? 
                    //  close the file
                    fs.close(fileDescriptor, (err4)=>{
                        !err4
                        ? callback(false)
                        : callback("Error closing file")
                    })
                    : callback("Error writing file");
                })
                : callback("Error Truncating file");
            });
        }  else{
            callback("Error updating the file");
        };      
    });
};

// Delete existing file
lib.delete = (dir, file, callback) =>{
    //  unlink file
    fs.unlink(`${lib.basedir+dir}/${file}.json`, (err)=> {
        !err
        ? callback(false)
        : callback("Error deleing the file");
    });
};

//  List all the items in a directory
lib.list = (dir, callback) =>{
    fs.readdir(`${lib.basedir+dir}/`, (err, fileNames)=>{
        if(!err &&  fileNames && fileNames.length > 0){
            let trimmedFileNames = [];
            fileNames.forEach(fileName =>{
                trimmedFileNames.push(fileName.replace('.json', ''));
            });
            callback(false, trimmedFileNames);
        }else{
            callback('Error in reading the directory. Server side error..!');
        };
    });
};

module.exports = lib; 