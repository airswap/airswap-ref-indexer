import { networkInterfaces } from "os";

export function getLocalIp() {
  const nets = networkInterfaces() || {};
  const results = Object.create(null);

  for (const name of (Object.keys(nets) || [])) {
    for (const net of nets[name]!) {
      if (net === undefined) {
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
  const localIp = process.env.LOCAL_INTERFACES?.split(",")?.map((name) => {
    return results[name];
  })
  .filter(inet => inet != undefined);
  return localIp[0];
}
