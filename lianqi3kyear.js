const cheerio = require("cheerio");
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

let chapStore = new Array();
const protocol = 'https://';
const chapFile = './lianqi3kyear/chaps.json'
const logFile = './lianqi3kyear.logs'
const folder = './lianqi3kyear';
const hostname = 'm.imbg.cc'
let entry = "/read/177757/0_1/";
const chapListSelector = '.jump-list>.hd-sel>select>option';
const chapSelector = '.readlist>li[chapter-id]>a';
const booknameSelector = "#bookname";
const titleSelector = "h1.headline";
const subtitleSelector = "#author";
const bodySelector = "#content";

const folderPath = path.resolve(__dirname, folder);

init();

async function init(){
    if (!fs.existsSync(folderPath)) {
        log(`${folderPath} not exsit`);
        fs.mkdirSync(folderPath)
        log(`${folderPath} create successful`);
    }
    const chapFilePath = path.resolve(__dirname, chapFile);
    if (!fs.existsSync(chapFilePath)) {
        log(`${chapFilePath} not exsit`);
        await getChaps();
        fs.writeFileSync(chapFilePath, JSON.stringify(chapStore, null, '  '));
        log(`${chapFilePath} write successful`);
    } else {
        chapStore = require(chapFilePath);
    }
    const index = await parseArgsToIndex();
    load(`${protocol}${hostname}${chapStore[index].link}`);
}

async function parseArgsToIndex() {
    const args = process.argv.slice(2);
    let index = 0;
    if (args.length) {
        const kwd = args[0];
        if (/^\d+$/.test(kwd)) {
            index = parseInt(kwd);
            if (index >= chapStore.length) {
                log('chapStore size limit');
                process.exit(0);
            }
        } else {
            const filterItems = chapStore.filter(chapMeta => {
                if (new RegExp(args[0]).test(chapMeta.title)) {
                    log(chapMeta)
                    return true;
                }
            })
            if (filterItems.length === 1){
                index = chapStore.findIndex(chapMeta => {
                    if (new RegExp(args[0]).test(chapMeta.title)) {
                        log(chapMeta)
                        return true;
                    }
                })
            } else {
                console.log(`===please input keyword again===\n${filterItems.map((item, index) => index + '=>' + item.title).join('\n')}\n===please input keyword again===`);
                log('filter items more than 1')
                process.exit(0);
            }
        }
    } else {
        index = chapStore.length - 1;
    }
    return index;
}

async function log(data) {
    const logFilePath = path.resolve(__dirname, logFile);
    fs.appendFileSync(logFilePath, JSON.stringify(data) + '\n');
}

async function getChaps () {
    if (entry) {
        console.log('getChaps page:', entry);
        log('getChaps page: ' + entry);
        return get(`${protocol}${hostname}${entry}`).then(data => {
            const $ = cheerio.load(data);
            const chapOptionsRaw = $(chapListSelector);
            const chapOptions = Array.from(chapOptionsRaw).map(raw => raw.attribs.value);
            const curEntryIndex = chapOptions.findIndex(op => op === entry);
            entry = chapOptions[curEntryIndex + 1] || '';
            log('entry change to: ' + entry)
            const chapRaw = $(chapSelector);
            const chapMetas = Array.from(chapRaw).map((raw, index) => {
                const link = raw.attribs.href;
                const title = raw.children[0] && raw.children[0].data || '';
                return { link, title }
            });
            if (Array.isArray(chapMetas) && chapMetas.length){
                chapMetas.forEach((chapMeta, index) => {
                    chapStore.push(chapMeta)
                })
                return getChaps();
            }
        }).catch((err) => {
            log(err)
        });
    }
}

async function get(url) {
    log(`get: ${url}`)
    const _get =/https:\/\//.test(url) ? https.get : http.get;
    return new Promise((resolve, reject) => {
        _get(
            `${url}`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36',
                }
            },
            function(res) {
                if (res.statusCode !== 200) {
                    console.log('error statusCode:\n' + res.statusMessage);
                    log('error statusCode: ' + res.statusMessage);
                    return;
                }
                let rawData = "";
                res.setEncoding("utf8");
                res.on("data", function(chunk){
                    rawData += chunk;
                });
                res.on("end", function(){
                    resolve(rawData)
                });
            }
        ).on('error', (e) => {
            console.log(e.message);
            log(e.message);
        });
    })
}

function load(link){
    log(`load: ${link}`)
    if (link){
        return get(link).then((data) => {
            const $ = cheerio.load(data);
            const bookname = $(booknameSelector) ? $(booknameSelector).text() : "";
            const title = $(titleSelector) ? $(titleSelector).text() : "";
            const subtitle = $(subtitleSelector) ? $(subtitleSelector).text() : "";
            const body = $(bodySelector) ? $(bodySelector).text() : "";
            fs.appendFileSync(path.resolve(folderPath, `${bookname}-${title.replace('/', '')}.txt`), `${bookname}\n${title}\n${subtitle}\n${body}`);
        })
    }
}
