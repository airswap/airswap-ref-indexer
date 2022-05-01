import { networkInterfaces } from "os";

export function getLocalIp() {
    const nets = networkInterfaces() || {};
    const results = Object.create(null);
  
    for (const name of (Object.keys(nets) || [])) {
      for (const net of nets[name]!) {
        if(net === undefined){
          continue;
        }
        if (net.family === "IPv4" && !net.internal) {
          if (!results[name]) {
            results[name] = [];
          }
          results[name].push(net.address);
        }
      }
    }
    // @TODO : this won't work everywhere
    const localIp = results["Ethernet"] || results["ens160"];
    return localIp[0];
  }
  