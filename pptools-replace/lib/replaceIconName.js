/*
 * 文字库icon名称更换
 * 根据../static/icon_rename.xlsx或者.txt的对照关系更换文字库icon名称
 * node-xlsx解析xlsx依赖python，版本号在2.5-3.0之间
 * Add by liucong
 * 2016-04-11
 */
'use strict';
var parseXlsx = require('excel'),
    fs = require('fs'),
    records = null,
    path = require('path');

exports.repalceIconName = function(argv){
    if( argv[2] == "-v" ){
        console.log("version is 1.1.3");
        return ;
    }else if( argv[2] == "xlsx"){
        setXlsx();
    }else{
        readTxt();
    }
};

//读取xlsx文件
//保存一份txt格式的对照文件
function setXlsx(){
    var executeDIR = process.cwd(),
        filename = executeDIR.match(/(mo|hybrid)[-_]+/g)?"icon_rename_h5.xlsx":"icon_rename_pc.xlsx",
        writeFileName = executeDIR.match(/(mo|hybrid)[-_]+/g)?"h5_icon.txt":"pc_icon.txt",
        filepath = path.resolve(__dirname , "../static/" + filename),
        writepath = path.resolve(__dirname , "../static/" + writeFileName);
    parseXlsx( filepath, function(err, data) {
        if(err) throw err;
        var icon_obj = {};
        for(var i in data){
            var obj_key = data[i][0].replace(/\n/g,'');
            icon_obj[ obj_key ] = data[i][1];
        }
        records = icon_obj;
        fs.writeFileSync( writepath , JSON.stringify(records) );
        searchFiles();
        return;
    });
}

//读取txt文件
function readTxt(){
    try{
        var executeDIR = process.cwd(),
            filename = executeDIR.match(/(mo|hybrid)[-_]+/g)?"h5_icon.txt":"pc_icon.txt",
            filepath = path.resolve(__dirname , "../static/" + filename),
            icon_names = fs.readFileSync(filepath,'utf-8');
        records = JSON.parse(icon_names);
        searchFiles();
    }catch(error){
        console.log(error);
    }
}

//查找文件夹
function searchFiles(){
    var path = process.cwd();
    walk( path , replaceRecords );
    console.log("----------【success】-----------");
}

function replaceRecords(tmp_path){
    var tmp_path_arr = tmp_path.split("."),
        file_type = tmp_path_arr[tmp_path_arr.length-1];
    if( file_type == "js" || file_type == "html" || file_type == "htm" || file_type == "css" ){
        // 同步读取
        var file_detail = fs.readFileSync( tmp_path ) , //文件内容
            modify_detail = file_detail.toString() , //修改后文件
            iconNameArr = modify_detail.match(/icon-[^\s\{"<:,']+/g) , //能匹配的icon名称
            icon_length = iconNameArr ? iconNameArr.length : 0 , //要替换的icon数量
            not_repalce_length = icon_length , //剩余未替换的icon数量
            not_repalce_arr = [], //没有替换的icon
            log_path = path.resolve( process.cwd() , "./replace.log" );
        if( !fs.existsSync(log_path) ){
            fs.openSync( log_path , "a");
        }
        //替换
        if( iconNameArr ){
            for( var key in iconNameArr){
                if( records[ iconNameArr[key] ] ){
                    var new_name = records[ iconNameArr[key] ];
                    modify_detail = modify_detail.replace( iconNameArr[key] , new_name );
                    not_repalce_length--;
                }else{
                    not_repalce_arr.push( iconNameArr[key] );
                }
            }
            //回写
            fs.writeFileSync(tmp_path, modify_detail, 'utf-8');
        }
        if( icon_length > 0 ){
            //写入日志文件
            var log_msg = fs.readFileSync( log_path ).toString() + "\n文件：" + tmp_path + "中，icon-前缀的字段有：" + icon_length +"已替换" + ( icon_length - not_repalce_length )  + "个，" + "尚未替换" + not_repalce_length + "个\n ";
            if( not_repalce_length != 0 ){
                log_msg +=  "未更换的icon名称是："+ not_repalce_arr.toString();
            }
            log_msg += "\n\n";
            fs.writeFileSync(log_path, log_msg, 'utf-8');
        }

        return;
    }
}

//遍历文件夹
function walk(path , handleFile) {
    fs.readdir(path, function(err, files) {  
        if (err) {  
            console.log('read dir error');  
        } else {  
            files.forEach(function(item) {  
                var tmpPath = path + '/' + item;  
                fs.stat(tmpPath, function(err1, stats) {  
                    if (err1) {  
                        console.log('stat error');  
                    } else {
                        if (stats.isDirectory()) {
                            walk(tmpPath, handleFile);  
                        } else {  
                            handleFile(tmpPath);  
                        }  
                    }  
                })  
            });
        }  
    });  
}  

