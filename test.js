const cheerio = require("cheerio");
const http = require("http");
const fs = require("fs");
var url = "http://www.nitianxieshen.com/sitemap.xml"; //从头开始爬取
function load(){
    if(url=="") return;
        http.get(url, function(res){
            let rawData = "";
            if (res.statusCode !== 200) throw new Error("status:", res.statusCode);
            res.setEncoding("utf8");
            res.on("data", function(chunk){
                rawData += chunk;
            });
            res.on("end", function(){
                $ = cheerio.load(rawData);
                console.log($("urlset").children().length)
            });
        })
}
load();