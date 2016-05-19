#!/usr/bin/env node

var font = require('./lib/downloadFont.js');
var questionnair = require('./lib/questionnair/questionnair.js');
if(process.argv[2] == "font" && process.argv[3] == "-u"){
    font.downloadFont();
}else if(process.argv[2] == "question"){
    questionnair.question();
}else{
    console.log("use 'pptools font -u' to download font files!\n");
}
