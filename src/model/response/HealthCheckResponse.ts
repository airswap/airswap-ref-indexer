export type HealthCheckResponse = {
  registry: string,
  network: number,
  peers: string[],
  databaseOrders: number
  databaseOrdersERC20: number
}