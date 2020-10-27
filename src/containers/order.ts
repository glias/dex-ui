import PWCore from '@lay2/pw-core'
import { useState, useMemo, useCallback } from 'react'
import { createContainer, useContainer } from 'unstated-next'
import { getBestPrice, getSudtBalance } from '../APIs'
import { PRICE_DECIMAL, SUDT_DECIMAL, SUDT_TYPE_SCRIPT } from '../utils/const'
import calcReceive from '../utils/fee'
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

export function useOrder() {
  const Wallet = useContainer(WalletContainer)
  const [step, setStep] = useState<OrderStep>(OrderStep.Order)
  const [pay, setPay] = useState('')
  const [price, setPrice] = useState('')
  const [txHash, setTxHash] = useState('')
  const [orderType, setOrderType] = useState(OrderType.Buy)
  const sellPair = ['DAI', 'CKB']
  const buyPair = ['CKB', 'DAI']
  const [historyOrders, setHisotryOrders] = useState<any[]>([])
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
    setBestPrice((BigInt(data.price) / PRICE_DECIMAL).toString())

    if (orderType === OrderType.Buy) {
      const { balance } = (await getSudtBalance(SUDT_TYPE_SCRIPT, lockScript)).data
      setMaxPay((BigInt(balance) / SUDT_DECIMAL).toString())
    } else {
      setMaxPay(ckbBalance)
    }
  }, [orderType, sellPair, buyPair, ckbBalance])

  const initPrice = useCallback(async () => {
    setMaxPay(ckbBalance)
    const { data } = await getBestPrice(SUDT_TYPE_SCRIPT, orderType)
    setBestPrice((BigInt(data.price) / PRICE_DECIMAL).toString())
  }, [orderType, ckbBalance])

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
    maxPay,
    bestPrice,
    initPrice,
  }
}

export const OrderContainer = createContainer(useOrder)

export default OrderContainer
