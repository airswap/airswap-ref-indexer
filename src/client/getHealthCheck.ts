import { JsonRpcResponse } from "@airswap/libraries"
import { FullOrderERC20 } from "@airswap/types"
import axios, { AxiosResponse } from "axios"

export type HealthCheckResponse = {
    registry: string, 
    peers: string[], 
    databaseOrders: number
}

export async function getHealthCheck(host: string): Promise<HealthCheckResponse> {
    try {
      const response = (await axios.get(host)) as AxiosResponse<JsonRpcResponse<any>>
      return Promise.resolve(response.data.result as unknown as any)
    } catch (err) {
      return Promise.reject(err)
    }
}