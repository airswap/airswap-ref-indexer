import { networkInterfaces } from "os";

export function getLocalIp() {
  const nets = networkInterfaces() || {};
  const results = Object.create(null);

  for (const name of (Object.keys(nets) || [])) {
    for (const net of nets[name]!) {
      if (net === undefined) {
        continue;
      }
      // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
      if (net.family === familyV4Value && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }

  const localIp = process.env.LOCAL_INTERFACES
    ?.split(",")
    ?.map((name) => results[name])
    .filter(inet => inet != undefined);

  return localIp[0];
}