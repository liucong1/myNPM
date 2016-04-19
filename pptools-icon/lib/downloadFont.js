'use strict';
/*
 * 下载文字库文件
 * 
 */
var fs = require('fs'),
    http = require('http'),
    path = require('path'), 
    readline = require('readline');

exports.downloadFont = function(){
    var file_url,download_dir;
    //字体文件存放目录
    var DOWNLOAD_DIR,FontDIR,TemplateDIR;
    var executeDIR = process.cwd();
    var modular_name = executeDIR.split(path.sep)[executeDIR.split(path.sep).length - 1 ];
    switch(modular_name){
        case 'mox-common':
        case 'hybrid-common':
            DOWNLOAD_DIR = path.resolve(executeDIR , './static/ui/icomoon.css');
            FontDIR = path.resolve(executeDIR , './static/ui/font/');
            TemplateDIR = path.resolve(__dirname , '../static/template.css');
            break;
        case 'pc-common':
            DOWNLOAD_DIR = path.resolve(executeDIR , './static/lib/css/icomoon.css');
            FontDIR = path.resolve(executeDIR , './static/lib/fonts/');
            TemplateDIR = path.resolve(__dirname , '../static/template_pc.css');
            break;
        default :
            console.log('[Error]请在mox-common、hybrid-common或pc-common目录下执行"pptool font -u"');
            return;
            break;
    }

    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the FontClass link in iconfont.cn:',function(answer){
        file_url = answer;

        var writestream = fs.createWriteStream( DOWNLOAD_DIR );
        //下载css文件
        http.get('http:' + file_url,function(res){
            res.pipe(writestream);
        });
        writestream.on('finish', function(){
            console.log('Download to ' + DOWNLOAD_DIR);
            var newfontfile;
            fs.readFile( TemplateDIR ,function(err ,data){
                newfontfile = data.toString('utf-8');
                var font_link_name;
                fs.readFile(DOWNLOAD_DIR,function(err ,data){
                    if(err) throw err;
                    var str = data.toString('utf-8');
                    var i , tmp = [], strArr=[];
                    strArr = str.split('}');
                    //字体文件链接
                    font_link_name = strArr[0].match(/(t\/font_[^(\.)]*\.eot)/g)[0].split('\/')[1].split('.')[0];
                    for(var i = 2; i<strArr.length && strArr[i].trim(); i++ ){
                        tmp.push(strArr[i] + '}');
                    }
                    newfontfile += tmp.join('');
                    fs.writeFile(DOWNLOAD_DIR,newfontfile,function(err){
                        if (err) throw err;
                        console.log('----success to rewrite the css file!----');
                    });
                    //download font files (.eot,.woff,.svg,.ttf)
                    var font_file_format = ['.eot','.woff','.svg','.ttf'];
                    for(var item in font_file_format){
                        var writestream = fs.createWriteStream( path.resolve(FontDIR , "icomoon"+font_file_format[item]) );
                        var font_link = 'http://at.alicdn.com/t/'+ font_link_name + font_file_format[item];  
                        (function(writestream , font_link ,format){
                            //下载css文件
                            http.get(font_link,function(res){
                                res.pipe(writestream);
                            });
                            writestream.on('finish', function(){
                                console.log('[success] success to download the '+ format + ' file!');
                            });
                        })(writestream , font_link , font_file_format[item]);
                    }
                });
            });
        });
        rl.close();
    });
}