import { Transaction } from '@lay2/pw-core'
import BigNumber from 'bignumber.js'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { createContainer, useContainer } from 'unstated-next'
import { ORDER_CELL_CAPACITY, MAX_TRANSACTION_FEE, COMMISSION_FEE } from '../constants'
import { submittedOrders as submittedOrdersCache } from '../utils'
import type { OrderRecord } from '../utils'
import { calcAskReceive, calcBidReceive } from '../utils/fee'
import WalletContainer from './wallet'

// eslint-disable-next-line no-shadow
export enum OrderStep {
  Order,
  Confirm,
  Select,
  Result,
}

// eslint-disable-next-line no-shadow
export enum OrderType {
  Bid = 'Bid',
  Ask = 'Ask',
}
// eslint-disable-next-line no-shadow
export enum OrderMode {
  Order = 'Order',
  CrossChain = 'CrossChain',
  CrossIn = 'CrossIn',
  CrossOut = 'CrossOut',
}

const BID_CONFIRM_COLOR = '#72d1a4'
const ASK_CONFRIM_COLOR = '#ff9a6f'

export interface SubmittedOrder
  extends Pick<OrderRecord, 'isBid' | 'pay' | 'receive' | 'price' | 'key' | 'tokenName' | 'orderCells' | 'executed'> {
  status: 'pending'
  createdAt: string
}

export function useOrder() {
  const Wallet = useContainer(WalletContainer)
  const { ethWallet, sudtWallets } = Wallet
  const [step, setStep] = useState<OrderStep>(OrderStep.Order)
  const [pay, setPay] = useState('')
  const [price, setPrice] = useState('')
  const [txHash, setTxHash] = useState('')
  const [historyOrders, setHistoryOrders] = useState<any[]>([])
  const { address } = Wallet.ckbWallet
  const [submittedOrders, setSubmittedOrders] = useState<Array<SubmittedOrder>>(submittedOrdersCache.get(address))
  const ckbBalance = Wallet.ckbWallet.free.toString()
  const [maxPay, setMaxPay] = useState(ckbBalance)
  const [bestPrice] = useState('0.00')
  const [tx, setTx] = useState<Transaction | null>(null)
  const [firstToken, setBuyerToken] = useState(() => Wallet.ethWallet.tokenName)
  const [secondToken, setSellerToken] = useState(() => Wallet.ckbWallet.tokenName)
  const [selectingToken, setSelectingToken] = useState<'first' | 'second'>('first')
  const [currentPairToken, setCurrentPairToken] = useState(Wallet.ethWallet.tokenName)

  useEffect(() => {
    if (!address) {
      setSubmittedOrders([])
    } else {
      setSubmittedOrders(submittedOrdersCache.get(address))
    }
  }, [address, setSubmittedOrders])

  const concatHistoryOrders = useCallback(
    (arr: any[]) => {
      setHistoryOrders(historyOrders.concat(...arr))
    },
    [historyOrders],
  )

  const pair: [string, string] = useMemo(() => {
    return [firstToken, secondToken]
  }, [firstToken, secondToken])

  const orderMode = useMemo(() => {
    const [buyer, seller] = pair
    const sudtWallet = sudtWallets.find(sudt => sudt.tokenName === buyer && !buyer.startsWith('ck'))
    const shadowWallet = sudtWallets.find(sudt => sudt.tokenName === buyer && buyer.startsWith('ck'))
    switch (buyer) {
      case 'CKB':
        return OrderMode.Order
      case 'ETH':
        if (seller.slice(2) === buyer) {
          return OrderMode.CrossIn
        }
        return OrderMode.CrossChain
      default:
        if (sudtWallet) {
          return OrderMode.Order
        }
        if (shadowWallet) {
          if (seller === 'CKB') {
            return OrderMode.Order
          }
          return OrderMode.CrossOut
        }
        return OrderMode.Order
    }
  }, [pair, sudtWallets])

  const orderType = useMemo(() => {
    const [p1] = pair
    switch (orderMode) {
      case OrderMode.Order:
        if (p1 === 'CKB') {
          return OrderType.Bid
        }
        return OrderType.Ask
      case OrderMode.CrossChain:
        return OrderType.Ask
      case OrderMode.CrossIn:
        return OrderType.Ask
      case OrderMode.CrossOut:
        return OrderType.Bid
      default:
        return OrderType.Bid
    }
  }, [orderMode, pair])

  const ckbMax = useMemo(() => {
    return new BigNumber(Wallet.ckbWallet.free.toString())
      .minus(MAX_TRANSACTION_FEE)
      .div(1 + COMMISSION_FEE)
      .minus(ORDER_CELL_CAPACITY)
      .toFixed(8, 1)
  }, [Wallet.ckbWallet.free])

  const togglePair = useCallback(async () => {
    setBuyerToken(secondToken)
    setSellerToken(firstToken)
    setPrice('')
    setPay('')
  }, [firstToken, secondToken])

  const receive = useMemo(() => {
    const [buyToken] = pair
    if (!pay || !price) {
      return '0'
    }
    switch (orderMode) {
      case OrderMode.Order:
        if (buyToken === 'CKB') {
          return calcBidReceive(pay, price)
        }
        return calcAskReceive(pay, price)
      case OrderMode.CrossChain:
        return calcAskReceive(pay, price)
      case OrderMode.CrossIn:
      case OrderMode.CrossOut:
        return pay
      default:
        return '0.00'
    }
  }, [price, pay, orderMode, pair])

  const setLoading = useCallback(
    (key: string) => {
      const order = historyOrders.find(o => o.key === key)
      if (order) {
        order.loading = true
        setHistoryOrders(historyOrders)
      }
    },
    [historyOrders],
  )

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  type SubmittedOrdersUpdateFn<T = Array<SubmittedOrder>> = (_: T) => T

  const setAndCacheSubmittedOrders = useCallback(
    (updateFn: SubmittedOrdersUpdateFn) => {
      setSubmittedOrders(orders => {
        const newOrders = updateFn(orders)
        submittedOrdersCache.set(address, newOrders)
        return newOrders
      })
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [address, setSubmittedOrders],
  )

  // TODO: max pay
  useEffect(() => {
    const [buyer, seller] = pair
    const sudtWallet = sudtWallets.find(sudt => sudt.tokenName === buyer && !buyer.startsWith('ck'))
    const shadowWallet = sudtWallets.find(sudt => sudt.tokenName === buyer && buyer.startsWith('ck'))
    switch (buyer) {
      case 'CKB':
        setMaxPay(ckbMax)
        break
      case 'ETH':
        setMaxPay(ethWallet.balance.minus(0.1).toString())
        break
      default:
        if (sudtWallet) {
          setMaxPay(new BigNumber(sudtWallet.balance.toString()).div(1 + COMMISSION_FEE).toString())
        } else if (shadowWallet) {
          if (seller === 'CKB') {
            setMaxPay(new BigNumber(shadowWallet.balance.toString()).div(1 + COMMISSION_FEE).toString())
          } else {
            setMaxPay(shadowWallet.balance.toString())
          }
        }
        break
    }
  }, [ethWallet.balance, ckbMax, pair, sudtWallets])

  const confirmButtonColor = useMemo(() => {
    switch (orderType) {
      case OrderType.Bid:
        return BID_CONFIRM_COLOR
      case OrderType.Ask:
        return ASK_CONFRIM_COLOR
      default:
        return BID_CONFIRM_COLOR
    }
  }, [orderType])

  function reset() {
    setPay('')
    setPrice('')
  }

  const currentSudtTokenName = useMemo(() => {
    return pair.find(t => t !== 'CKB')
  }, [pair])

  return {
    step,
    setStep,
    pay,
    setPay,
    price,
    setPrice,
    receive,
    reset,
    txHash,
    setTxHash,
    togglePair,
    orderType,
    pair,
    concatHistoryOrders,
    historyOrders,
    setHistoryOrders,
    submittedOrders,
    setAndCacheSubmittedOrders,
    setLoading,
    maxPay,
    bestPrice,
    tx,
    setTx,
    confirmButtonColor,
    setBuyerToken,
    setSellerToken,
    selectingToken,
    setSelectingToken,
    currentPairToken,
    setCurrentPairToken,
    orderMode,
    currentSudtTokenName,
  }
}

export const OrderContainer = createContainer(useOrder)

export default OrderContainer
