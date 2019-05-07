const cheerio = require("cheerio");
const http = require("http");
const fs = require("fs");

var source = [
    "http://m.compassedu.hk/sitemap3.txt",
    "http://m.compassedu.hk/sitemap4.txt",
    "http://m.compassedu.hk/sitemap6.txt",
    "http://m.compassedu.hk/sitemap7.txt",
    "http://m.compassedu.hk/sitemap8.txt"
]
var s = 0;
var arr = [];
var sou = [];
var i = 0;

fs.exists(__dirname+"/compassedu", function(flag){
    if(!flag) fs.mkdirSync(__dirname+"/compassedu");
})

init();

function init(){
    http.get(source[s], function(res){
        if (res.statusCode !== 200) throw new Error("status:", res.statusCode);
        let rawData = "";
        res.setEncoding("utf8");
        res.on("data", function(chunk){
            rawData += chunk;
        });
        res.on("end", function(){
            sou[s] = rawData.split("\n");
            console.log("源", s+1, ": ", sou[s].length, "条数据");
            s++;
            if(s<source.length){
                init();
            }
            else{
                for(let m=0;m<sou.length;m++){
                    arr = arr.concat(sou[i]);
                }
                console.log("总计: ", arr.length, "条数据", "\n爬虫配置完毕!!\n开始爬取 >>");
                start();
            }
        });
    })
}

function start(){
    let url = arr[i];
    console.log(url);
    
    http.get(url, function(res){
        if (res.statusCode !== 200) throw new Error("status:", res.statusCode);
        let rawData = "";
        res.setEncoding("utf8");
        res.on("data", function(chunk){
            rawData += chunk;
        });
        res.on("end", function(){
            $ = cheerio.load(rawData);
            title = $(".container-public h1").text().replace(/\s/,"").trim();
            body = $(".container-public").html();
            body = body.split("visible-xs")[0];
            i++;
            fs.writeFile(__dirname+"/compassedu/"+title+".html", body, "utf8", function(err){
                if(!err) console.log(title, "写入成功");
                else{
                    console.log(err);
                }
            });
            if(i>=arr.length) {
                console.log("爬取结束");
                return;
            }
            else {
                start();
            }
        });
        res.on("error", function(err){
            console.log(err);
        });
    })
}