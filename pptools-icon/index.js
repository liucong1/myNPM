#!/usr/bin/env node

var font = require('./lib/downloadFont.js');
if(process.argv[2] == "font" && process.argv[3] == "-u"){
    font.downloadFont();
}else{
    console.log("use 'pptools font -u' to download font files!\n");
}
