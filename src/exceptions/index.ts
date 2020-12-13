/* eslint-disable max-classes-per-file */
export enum ErrorCode {
  LiveCellNotEnough = 500,
  CKBNotEnough = 501,
  UserReject = 4001,
}

export class LiveCellNotEnough extends Error {
  public code = ErrorCode.LiveCellNotEnough

  constructor() {
    super(
      `You don't have enough live cells to complete this transaction, please wait for other transactions to be completed.`,
    )
  }
}

export class CKBNotEnough extends Error {
  public code = ErrorCode.LiveCellNotEnough
}
