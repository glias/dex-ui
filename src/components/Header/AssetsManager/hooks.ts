import PWCore, { Address, AddressType, Amount, AmountUnit, SimpleBuilder, SimpleSUDTBuilder, SUDT } from '@lay2/pw-core'
import { TransactionDetailModel } from 'APIs'
import WalletContainer, { Wallet } from 'containers/wallet'
import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { createContainer } from 'unstated-next'
import { spentCells } from 'utils'
import { SUDT_LIST } from '../../../constants'
import { TransactionDirection, TransactionStatus } from './api'
import { asserts } from './helper'
import { addPendingTransactions } from './pendingTxs'

interface TokenParams {
  tokenName: string
}
function useParamsTokenName(): TokenParams {
  return useParams<TokenParams>()
}

function useWallet(): Wallet | undefined {
  const { tokenName } = useParamsTokenName()
  return WalletContainer.useContainer().wallets.find(wallet => wallet.tokenName === tokenName)
}

function useSudt(): SUDT | undefined {
  const { tokenName } = useParamsTokenName()
  return SUDT_LIST.find(sudt => sudt.info?.name === tokenName)
}

function wrapAddress(address: string): Address {
  return new Address(address, address.startsWith('ck') ? AddressType.ckb : AddressType.eth)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useSendCkb(): (address: string, shannonCkb: string) => Promise<string> {
  const { pw } = WalletContainer.useContainer()

  return useCallback(
    async (address: string, shannonCkb: string) => {
      asserts(pw)

      const builder = new SimpleBuilder(wrapAddress(address), new Amount(shannonCkb, AmountUnit.shannon))
      const txHash = await pw.sendTransaction(builder)
      const built = await builder.build()
      spentCells.add(built.raw.inputs.map(input => input.previousOutput.serializeJson()) as any)
      const fee = builder.getFee()

      const tx: TransactionDetailModel = {
        amount: shannonCkb,
        blockNumber: 0,
        direction: TransactionDirection.Out,
        fee: fee.toString(AmountUnit.shannon),
        from: PWCore.provider.address.toCKBAddress(),
        status: TransactionStatus.Pending,
        to: address,
        txHash,
      }

      addPendingTransactions({ ...tx, timestamp: Date.now() })

      return txHash
    },
    [pw],
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useSendSudt(): (address: string, amount: string, inputSudt?: SUDT) => Promise<string> {
  const { pw } = WalletContainer.useContainer()
  const paramSudt = useSudt()

  return useCallback(
    async (address: string, amount: string, inputSudt?: SUDT) => {
      asserts(pw)

      const sudt = inputSudt || paramSudt
      asserts(sudt)

      const sudtBuilder = new SimpleSUDTBuilder(sudt, wrapAddress(address), new Amount(amount, AmountUnit.shannon))
      const built = await sudtBuilder.build()
      const txHash = await pw.sendTransaction(built)
      const fee = sudtBuilder.getFee()

      spentCells.add(built.raw.inputs.map(input => input.previousOutput.serializeJson()) as any)

      const tx: TransactionDetailModel = {
        amount,
        blockNumber: 0,
        direction: TransactionDirection.Out,
        fee: fee.toString(AmountUnit.shannon),
        from: PWCore.provider.address.toCKBAddress(),
        status: TransactionStatus.Pending,
        to: address,
        txHash,
      }
      addPendingTransactions({ ...tx, timestamp: Date.now() })
      return txHash
    },
    [pw, paramSudt],
  )
}

function useAssetManager() {
  return {
    useParamsTokenName,
    useWallet,
    useSudt,
    sendCkb: useSendCkb(),
    sendSudt: useSendSudt(),
  }
}

export const AssetManagerContainer = createContainer(useAssetManager)
