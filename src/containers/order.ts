import PWCore from '@lay2/pw-core'
import BigNumber from 'bignumber.js'
import { useState, useMemo, useCallback } from 'react'
import { createContainer, useContainer } from 'unstated-next'
import { getBestPrice, getCkbBalance, getSudtBalance } from '../APIs'
import {
  CKB_DECIMAL,
  PRICE_DECIMAL,
  SUDT_DECIMAL,
  SUDT_TYPE_SCRIPT,
  submittedOrders as submittedOrdersCache,
} from '../utils'
import type { OrderRecord } from '../utils'
import calcBuyReceive, { calcSellReceive } from '../utils/fee'
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
  const [submittedOrders, setSubmittedOrders] = useState<Array<SubmittedOrder>>(submittedOrdersCache.get())
  const ckbBalance = Wallet.ckbWallet.free.toString()
  const [maxPay, setMaxPay] = useState(ckbBalance)
  const [bestPrice, setBestPrice] = useState('0.00')

  const concatHistoryOrders = useCallback(
    (arr: any[]) => {
      setHisotryOrders(historyOrders.concat(...arr))
    },
    [historyOrders],
  )

  const [pair, setPair] = useState(buyPair)

  const togglePair = useCallback(async () => {
    const lockScript = PWCore.provider.address.toLockScript()
    if (orderType === OrderType.Buy) {
      setPair(sellPair)
      setOrderType(OrderType.Sell)
    } else {
      setPair(buyPair)
      setOrderType(OrderType.Buy)
    }
    // todo: error handling
    const { data } = await getBestPrice(SUDT_TYPE_SCRIPT, orderType)
    setBestPrice(new BigNumber(data.price).div(PRICE_DECIMAL).toString())

    if (orderType === OrderType.Buy) {
      const { balance } = (await getSudtBalance(SUDT_TYPE_SCRIPT, lockScript)).data
      setMaxPay(new BigNumber(balance).div(SUDT_DECIMAL).toString())
    } else {
      const { balance } = (await getCkbBalance(lockScript)).data
      setMaxPay(new BigNumber(balance).div(SUDT_DECIMAL).toString())
    }
  }, [orderType, sellPair, buyPair])

  const initPrice = useCallback(async () => {
    const lockScript = PWCore.provider.address.toLockScript()
    const { balance } = (await getCkbBalance(lockScript)).data
    setMaxPay(new BigNumber(balance).div(new BigNumber(CKB_DECIMAL.toString())).toString())
    const { data } = await getBestPrice(SUDT_TYPE_SCRIPT, orderType)
    // eslint-disable-next-line no-debugger
    setBestPrice(new BigNumber(data.price).div(new BigNumber(PRICE_DECIMAL.toString())).toString())
  }, [orderType])

  const receive = useMemo(() => {
    if (price && pay) {
      if (orderType === OrderType.Buy) {
        return calcBuyReceive(parseFloat(pay), parseFloat(price))
      }
      return calcSellReceive(parseFloat(pay), parseFloat(price))
    }

    return '0.00'
  }, [price, pay, orderType])

  const setLoading = useCallback(
    (key: string) => {
      // eslint-disable-next-line no-debugger
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
        submittedOrdersCache.set(newOrders)
        return newOrders
      })
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [setSubmittedOrders],
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
  }
}

export const OrderContainer = createContainer(useOrder)

export default OrderContainer
