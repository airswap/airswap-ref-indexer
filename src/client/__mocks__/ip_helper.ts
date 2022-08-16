
export function getLocalIp(): string | undefined {
  return "192.168.0.0";
}

export async function getPublicIp() {
  return Promise.resolve("90.58.26.3");
}