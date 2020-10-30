import PWCore, { Transaction } from '@lay2/pw-core'
import BigNumber from 'bignumber.js'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { createContainer, useContainer } from 'unstated-next'
import { getBestPrice, getCkbBalance } from '../APIs'
import {
  CKB_DECIMAL,
  PRICE_DECIMAL,
  SUDT_TYPE_SCRIPT,
  COMMISSION_FEE,
  submittedOrders as submittedOrdersCache,
  ORDER_CELL_CAPACITY,
} from '../utils'
import type { OrderRecord } from '../utils'
import { calcBuyReceive, calcSellReceive } from '../utils/fee'
import WalletContainer from './wallet'

// eslint-disable-next-line no-shadow
export enum OrderStep {
  Order,
  Comfirm,
  Result,
}

// eslint-disable-next-line no-shadow
export enum OrderType {
  Buy,
  Sell,
}

export interface SubmittedOrder extends Pick<OrderRecord, 'isBid' | 'pay' | 'receive' | 'price' | 'key'> {
  status: 'pending'
  createdAt: string
}

export function useOrder() {
  const Wallet = useContainer(WalletContainer)
  const [step, setStep] = useState<OrderStep>(OrderStep.Order)
  const [pay, setPay] = useState('')
  const [price, setPrice] = useState('')
  const [maximumPayable, setMaximumPayable] = useState('-')
  const [suggestionPrice, setSuggestionPrice] = useState(0)
  const [txHash, setTxHash] = useState('')
  const [orderType, setOrderType] = useState(OrderType.Buy)
  const sellPair = ['DAI', 'CKB']
  const buyPair = ['CKB', 'DAI']
  const [historyOrders, setHisotryOrders] = useState<any[]>([])
  const { address } = Wallet.ckbWallet
  const [submittedOrders, setSubmittedOrders] = useState<Array<SubmittedOrder>>(submittedOrdersCache.get(address))
  const ckbBalance = Wallet.ckbWallet.free.toString()
  const [maxPay, setMaxPay] = useState(ckbBalance)
  const [bestPrice, setBestPrice] = useState('0.00')
  const [tx, setTx] = useState<Transaction | null>(null)

  useEffect(() => {
    if (!address) {
      setSubmittedOrders([])
    } else {
      setSubmittedOrders(submittedOrdersCache.get(address))
    }
  }, [address, setSubmittedOrders])

  const concatHistoryOrders = useCallback(
    (arr: any[]) => {
      setHisotryOrders(historyOrders.concat(...arr))
    },
    [historyOrders],
  )

  const [pair, setPair] = useState(buyPair)

  const ckbMax = useMemo(() => {
    return new BigNumber(Wallet.ckbWallet.free.toString()).div(ORDER_CELL_CAPACITY).div(COMMISSION_FEE).toFixed(8, 1)
  }, [Wallet.ckbWallet.free])

  const sudtBestPrice = Wallet.sudtWallet.bestPrice
  const ckbBestPrice = Wallet.ckbWallet.bestPrice

  const togglePair = useCallback(async () => {
    if (orderType === OrderType.Buy) {
      setPair(sellPair)
      setOrderType(OrderType.Sell)
    } else {
      setPair(buyPair)
      setOrderType(OrderType.Buy)
    }
    const lockScript = PWCore.provider?.address?.toLockScript()
    if (!lockScript) {
      return
    }

    if (orderType === OrderType.Buy) {
      setMaxPay(ckbMax)
    } else {
      setMaxPay(Wallet.sudtWallet.balance.toString())
    }
    setBestPrice(OrderType.Sell === orderType ? ckbBestPrice.toString() : sudtBestPrice.toString())
  }, [orderType, sellPair, buyPair, Wallet.sudtWallet.balance, ckbMax, ckbBestPrice, sudtBestPrice])

  const initPrice = useCallback(async () => {
    const lockScript = PWCore.provider.address.toLockScript()
    const { free } = (await getCkbBalance(lockScript)).data
    setMaxPay(new BigNumber(free).div(new BigNumber(CKB_DECIMAL.toString())).toString())
    const { data } = await getBestPrice(SUDT_TYPE_SCRIPT, OrderType.Sell)
    setBestPrice(new BigNumber(data.price).div(new BigNumber(PRICE_DECIMAL.toString())).toString())
  }, [])

  const receive = useMemo(() => {
    if (price && pay) {
      if (orderType === OrderType.Buy) {
        return calcBuyReceive(pay, price)
      }
      return calcSellReceive(pay, price)
    }

    return '0.00'
  }, [price, pay, orderType])

  const setLoading = useCallback(
    (key: string) => {
      const order = historyOrders.find(o => o.key === key)
      if (order) {
        order.loading = true
        setHisotryOrders(historyOrders)
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

  function reset() {
    setPay('')
    setPrice('')
  }

  return {
    suggestionPrice,
    setSuggestionPrice,
    maximumPayable,
    setMaximumPayable,
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
    orderType,
    setOrderType,
    togglePair,
    pair,
    concatHistoryOrders,
    historyOrders,
    setHisotryOrders,
    submittedOrders,
    setAndCacheSubmittedOrders,
    setLoading,
    maxPay,
    bestPrice,
    initPrice,
    tx,
    setTx,
  }
}

export const OrderContainer = createContainer(useOrder)

export default OrderContainer
