import { useState, useMemo, useCallback } from 'react'
import { createContainer } from 'unstated-next'
import calcReceive from '../utils/fee'

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

export function useOrder() {
  const [step, setStep] = useState<OrderStep>(OrderStep.Order)
  const [pay, setPay] = useState('')
  const [price, setPrice] = useState('')
  const [txHash, setTxHash] = useState('')
  const [orderType, setOrderType] = useState(OrderType.Buy)
  const sellPair = ['DAI', 'CKB']
  const buyPair = ['CKB', 'DAI']
  const [historyOrders, setHisotryOrders] = useState<any[]>([])

  const concatHistoryOrders = useCallback(
    (arr: any[]) => {
      setHisotryOrders(historyOrders.concat(...arr))
    },
    [historyOrders],
  )

  const [pair, setPair] = useState(buyPair)

  const togglePair = useCallback(() => {
    if (orderType === OrderType.Buy) {
      setPair(sellPair)
      setOrderType(OrderType.Sell)
    } else {
      setPair(buyPair)
      setOrderType(OrderType.Buy)
    }
  }, [orderType, sellPair, buyPair])

  const receive = useMemo(() => {
    if (price && pay) {
      return calcReceive(parseFloat(pay), parseFloat(price))
    }

    return '0.00'
  }, [price, pay])

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

  function reset() {
    setPay('')
    setPrice('')
  }

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
    orderType,
    setOrderType,
    togglePair,
    pair,
    concatHistoryOrders,
    historyOrders,
    setHisotryOrders,
    setLoading,
  }
}

export const OrderContainer = createContainer(useOrder)

export default OrderContainer
