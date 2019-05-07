const cheerio = require("cheerio");
const http = require("http");
const fs = require("fs");

var arr = [];
var i = 0;
var title="";
var subtitle="";
var body = "";
var map = "http://www.nitianxieshen.com/sitemap.xml"; //从头开始爬取
var url = "";
var $ = null;

init();

function init(){
    console.log("获取章节列表 >>");
    http.get(map, function(res){
        let rawData = "";
        if (res.statusCode !== 200) throw new Error("status:", res.statusCode);
        res.setEncoding("utf8");
        res.on("data", function(chunk){
            rawData += chunk;
        });
        res.on("end", function(){
            $ = cheerio.load(rawData);
            arr = $("urlset url loc");
            if(arr.length>0){
                console.log("总计章节数:", arr.length, "\r\n爬虫就绪，开始爬取 >>");
                i = arr.length - 1;
                write();
            }
            else{
                console.log("初始化失败");
                return;
            }
        });
    });
}

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
    if(i==0) return;
    url = arr.eq(i).text();
    i--;
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