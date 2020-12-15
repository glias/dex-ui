import React from 'react'
import { Operations } from '../AssetBalance'
import { BalanceStatus } from '../AssetBalance/BalanceStatus'
import { AssetManagerHeader } from '../AssetManagerHeader'
import { TransactionList } from '../TransactionList'

export const AssetDetail = () => {
  return (
    <>
      <AssetManagerHeader showGoBack />
      <BalanceStatus />
      <Operations />
      <TransactionList />
    </>
  )
}
