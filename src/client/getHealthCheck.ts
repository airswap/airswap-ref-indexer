import { JsonRpcResponse } from "@airswap/libraries"
import axios, { AxiosResponse } from "axios"

export type HealthCheckResponse = {
  registry: string,
  network: number,
  peers: string[],
  databaseOrders: number
}

export async function getHealthCheck(host: string): Promise<HealthCheckResponse> {
  try {
    const response = (await axios.get(host)) as AxiosResponse<JsonRpcResponse<any>>
    const healthCheck = response.data.result
    if (!isHealthCheckResponse(healthCheck)) return Promise.reject()
    return Promise.resolve(healthCheck)
  } catch (err) {
    return Promise.reject(err)
  }
}

const isHealthCheckResponse = (result: any): result is HealthCheckResponse => (
  typeof result === 'object'
  && 'registry' in result
  && 'network' in result
  && 'peers' in result
  && 'databaseOrders' in result
)