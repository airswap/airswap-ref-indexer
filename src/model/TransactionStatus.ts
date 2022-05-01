export enum TransactionStatus {
  IN_PROGRESS = "IN_PROGRESS",
  CANCELED = "CANCELED",
  DONE = "DONE",
  UNKNOWN = "UNKNOWN",
};

export function stringToTransactionStatus(key: string) : TransactionStatus{
  if (key === null || key === undefined || !(typeof key === 'string')) {
    return TransactionStatus.UNKNOWN;
  }
  const upperCaseValue = key.toUpperCase();
  const match = Object.keys(TransactionStatus).filter(s => s === upperCaseValue);
  return match.length === 1 ? match[0] as TransactionStatus : TransactionStatus.UNKNOWN;
}