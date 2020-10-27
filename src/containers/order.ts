import { useState, useMemo, useCallback } from 'react'
import { createContainer } from 'unstated-next'

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
  const [maximumPayable, setMaximumPayable] = useState('-')
  const [suggestionPrice, setSuggestionPrice] = useState(0)
  const [txHash, setTxHash] = useState('')
  const [orderType, setOrderType] = useState(OrderType.Buy)
  const buyPair = ['DAI', 'CKB']
  const sellPair = ['CKB', 'DAI']
  const [historyOrders, setHisotryOrders] = useState<any[]>([])

  const concatHistoryOrders = useCallback(
    (arr: any[]) => {
      setHisotryOrders(historyOrders.concat(...arr))
    },
    [historyOrders],
  )

  const [pair, setPair] = useState(buyPair)

  const togglePair = useCallback(
    (pairName?: string) => {
      if (pairName) {
        setPair([pairName, 'CKB'])
        setOrderType(OrderType.Sell)
        return
      }

      if (orderType === OrderType.Buy) {
        setPair(sellPair)
        setOrderType(OrderType.Sell)
      } else {
        setPair(buyPair)
        setOrderType(OrderType.Buy)
      }
    },
    [orderType, sellPair, buyPair],
  )

  const receive = useMemo(() => {
    if (price && pay) {
      return (parseFloat(price) * parseFloat(pay)).toFixed(2)
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
    setLoading,
  }
}

export const OrderContainer = createContainer(useOrder)

export default OrderContainer
