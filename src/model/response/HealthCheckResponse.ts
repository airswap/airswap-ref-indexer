export type HealthCheckResponse = {
  registry: Record<number, string>,
  networks: string[],
  peers: string[],
  databaseOrders: number
  databaseOrdersERC20: number
}