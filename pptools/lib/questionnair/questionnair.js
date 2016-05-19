'use strict';
/*
 * 下载文字库文件
 * 
 */
var fs = require('fs'),
    http = require('http'),
    path = require('path');

exports.question = function(){
    var url         = argv[3];
    var htmlName    = argv[4];
    var formUrl     = argv[5];
    // var url         = "http://www.sojump.com/m/7999347.aspx";
    // var htmlName    = "index";
    // var formUrl     = "/mo/questionnaire/owner_data";
    (function(url){
        var filepath    = path.resolve(__dirname , "../questionnair/" + htmlName + ".html");//html源文件
        var htmlTpl     = path.resolve(__dirname,"../questionnair/htmlTpl.html");
        var isset       = fs.existsSync(filepath);
        if(isset){
            console.log("file isset！Please change the file name!");
            return;
        }
        var writestream = fs.createWriteStream(filepath);
        http.get(url,function(res){
            res.pipe(writestream);
        });
        writestream.on('finish',function(){
            fs.readFile(filepath,'utf-8',function(err,data){
                if(err) throw err;
                var html_detail = [];
                var form = data.match(/(<form)[\w\W]*(<\/form>)/)[0];
                /**********************form替换相应内容******************************/
                var reg_replace = [
                    {
                        'reg':/(<div id='divWeiXin')[\w\W]*(<\/div>)/,
                        'text' : ''
                    },
                    {
                        'reg':/(<div class="shopcart")[\w\W]*(<\/div>)/,
                        'text' : ''
                    },
                    {
                        'reg':/(<div class="footer">)[\w\W]*(<\/div>)/,
                        'text' : ''
                    },
                    {
                        'reg'  : /(action=")[\w\W]*(id="toptitle")/,
                        'text' : 'action="<?= ICT_View::absoluteURI(' +"'"+ formUrl +"'" +')?>"> \n <div id="toptitle"'
                    },
                    {
                        'reg'  : /<input type="hidden" value="1" id="action" name="action" \/>/,
                        'text' : '</div> \n <input type="hidden" value="1" id="action" name="action" \/>'
                    }
                ];

                for(var i=0; i<reg_replace.length; i++){
                    form = form.replace(reg_replace[i].reg,reg_replace[i].text);
                }
                /**********************form替换相应内容******************************/

                html_detail.push(form);
                //替换好的html（test.html）
                fs.readFile(htmlTpl,'utf-8',function(err,data){
                    var new_text = data.replace(/{}/,html_detail.join('\n'));
                    fs.writeFile(filepath,new_text, 'utf-8', function(err,data){
                        if(err) throw err;
                        console.log("html replace is ok!");
                    })
                })
                
            });
        });
        
    })(url);
}