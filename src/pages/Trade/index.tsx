import React, { useCallback, useEffect, useRef } from 'react'
import { useContainer } from 'unstated-next'
import SelectToken from 'components/SelectToken'
import { Wallet } from 'containers/wallet'
import TradeOrderTable from './components/TradeOrderTable'
import History from './components/History'
import TradeOrderConfirm from './components/TradeOrderConfirm'
import TradeOrderResult from './components/TradeOrderResult'
import { TradePage, TradeMain, TradeFrame } from './styled'
import OrderContainer, { OrderStep, OrderType } from '../../containers/order'
import { checkSubmittedTxs } from '../../APIs'

const Trade = () => {
  const Order = useContainer(OrderContainer)
  const submittedOrderTimer = useRef<ReturnType<typeof setInterval> | undefined>()

  const { submittedOrders, setAndCacheSubmittedOrders } = Order
  useEffect(() => {
    const INTERVAL_TIME = 3000
    submittedOrderTimer.current = setInterval(() => {
      const hashes = submittedOrders.map(o => o.key.split(':')[0])
      if (!hashes.length) {
        return
      }
      checkSubmittedTxs(hashes).then(resList => {
        const unconfirmedHashes = hashes.filter((_, i) => !resList[i])
        setAndCacheSubmittedOrders(orders =>
          orders.filter(order => unconfirmedHashes.includes(order.key.split(':')[0])),
        )
      })
    }, INTERVAL_TIME)

    return () => {
      if (submittedOrderTimer.current) {
        clearInterval(submittedOrderTimer.current)
      }
    }
  }, [submittedOrderTimer, submittedOrders, setAndCacheSubmittedOrders])

  const { selectingToken, setBuyPairWallet, setSellPairWallet, setStep } = Order

  const onTokenSelect = useCallback(
    (wallet: Wallet) => {
      if (selectingToken === OrderType.Buy) {
        setBuyPairWallet(wallet)
      } else {
        setSellPairWallet(wallet)
      }
      setStep(OrderStep.Order)
    },
    [selectingToken, setBuyPairWallet, setSellPairWallet, setStep],
  )

  const traceNavigation = () => {
    switch (Order.step) {
      case OrderStep.Order:
        return <TradeOrderTable />
      case OrderStep.Confirm:
        return <TradeOrderConfirm />
      case OrderStep.Select:
        return (
          <SelectToken
            onBack={() => Order.setStep(OrderStep.Order)}
            onSelect={onTokenSelect}
            currentWallet={Order.currentPairWallet}
          />
        )
      default:
        return <TradeOrderResult />
    }
  }

  return (
    <TradePage className="trade-page">
      <TradeMain>
        <TradeFrame width="360px">{traceNavigation()}</TradeFrame>
      </TradeMain>
      <History />
    </TradePage>
  )
}

export default Trade
