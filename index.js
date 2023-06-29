const fs = require('fs');
const axios = require('axios');
const express = require('express');
const cron = require('node-cron');
//const {monitor} = require('./monitor.js');
const app = express();
const port = 3000;

let monitor = async () => {
    serversToMonitor = JSON.parse(fs.readFileSync(path.resolve("servers.json"),"utf8"))
    const finalData = await Promise.all(serversToMonitor.map(async urls=>{
	    let data = await axios.get(urls).then(data=>{
	        replitName = urls.split("/")[2].split(".")[0];
		    return {replitName: replitName, replitUrl: urls, status: data.status}
	    }).catch(e=>{
	        replitName = urls.split("/")[2].split(".")[0];
		    return {replitName: replitName, replitUrl: urls, status: e.response.status}
	    })
	    return data
	}))
    return finalData
}

let servers = JSON.parse(fs.readFileSync(path.resolve("servers.json"),"utf8"))
let exeption = ["ReplitServerMonitoringService","hackmesenpai1"]

let jsonStr = ""
cron.schedule('*/5 * * * *', async () => {
	   jsonData = await monitor()
	   jsonStr = JSON.stringify(jsonData)
});

app.get('/', (req, res) => {
	   if(jsonStr.length != 0){
    let data = JSON.parse(jsonStr)
    let htmlTable = '<!DOCTYPE html><html><head><title>Servers List</title><meta charset="UTF-8"/><link rel="stylesheet" href=""/><style>th,tr{border: 1px solid #C2C2C2;padding: 8px;}div{margin:4px; padding:6px 0 0 0; text-align:center; flex-basis: 532px;}table{display:inline-block;border:0;margin:0;border-collapse: collapse; background-color:white; background: rgba(255,255,255,0.8);}</style></head><body><div><table><thead><tr><th style="text-align:center;background-color:#2A69FB;color:#FFFFFF;">STATUS CODE</th><th style="text-align:center;background-color:#2A69FB;color:#FFFFFF;">REPLIT SERVER NAME</th></tr></thead><tbody>';
    data.forEach(function(item) {
        htmlTable += '<tr><td>' + item.status + '</td><td>' + item.replitName + '</td></tr>';
    });
    htmlTable += '</tbody></table></div></body></html>';
    res.send(htmlTable);
    }
    else res.redirect("https://http-https-pinger.vercel.app/Docs")
})

app.get('/Docs', function(req, res) {
    res.sendFile(path.resolve('docu.html'))
});

app.get('/addmonitor', function(req, res) {
    let url = req.query.url;
    if (!url) res.send({error: "Invalid Request! url parameter must be filled!"});
    else {
        if (url.endsWith("/")) url = url.substring(0,url.length - 1);
        if (!(url.startsWith("http://")||url.startsWith("https://"))) url = "https://"+url;
			  if (Boolean(url.match(/hackmesenpai1/gi))) {
					res.send({error: "Url provided not allowed!"});
					res.status(405)
				}else{
        if (!servers.includes(url)){
            if (url.endsWith("repl.co")||url.endsWith("repl.co/")){
                axios.get(url).then(resp=>{
                    servers.push(url)
                    fs.writeFileSync(path.resolve("servers.json"),JSON.stringify(servers))
                    res.send({status:200,statusText:"Success! Your replit server url has been added to our monitoring service."})
                }).catch(e=>{ 
										 res.send({message: "Request rejected! Invalid replit server url."})
                })
            }
            else res.send({error: "Invalid request! Malformed replit server url."})
        }
        else res.send({error: `This replit server url "${url}" is already on our monitoring service!`})
    }
			}
});

app.listen(port, () => {
    console.log(`Replit Server Monitor Service API is listening on port ${port}`);
})

module.exports = app;
