const cheerio = require("cheerio");
const http = require("http");
const fs = require("fs");

var title="";
var subtitle="";
var body = "";
var url = "http://www.nitianxieshen.com/1.html"; //从头开始爬取
// var url = "http://www.nitianxieshen.com/2915.html"; //结尾的调试
var $ = null;

write();

function write(){
    load().then(function(){
        var data = title + "\r\n" + subtitle + "\r\n" + body + "\r\n";
        fs.appendFile(__dirname+"/逆天邪神.txt", data, "utf8", function(){ //一个文件
        // fs.writeFile(__dirname+"/"+title+".txt", data, "utf8", function(){ //多个文件
            console.log(title, "写入完成");
            if(url=="") console.log("爬取结束");
            else write();
        });
    })
    .catch(function(e){
        console.log(e);
    })
}

function load(){
    if(url=="") return;
    var promise = new Promise(function(resolve, reject){
        http.get(url, function(res){
            let rawData = "";
            if (res.statusCode !== 200) throw new Error("status:", res.statusCode);
            res.setEncoding("utf8");
            res.on("data", function(chunk){
                rawData += chunk;
            });
            res.on("end", function(){
                $ = cheerio.load(rawData);
                title = $(".post_title h1").text();
                subtitle = $(".post_title span").text();
                body = $(".post_entry").text();
                url = $(".r").length!=0 ? $(".r").attr("href") : "";
                resolve();
            });
        })
    });
    return promise;
}