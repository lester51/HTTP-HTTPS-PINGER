const fs = require('fs');
const axios = require('axios');

module.exports.monitor = async () => {
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