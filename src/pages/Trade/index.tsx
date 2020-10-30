import React, { useEffect, useRef } from 'react'
import { useContainer } from 'unstated-next'
import { Layout, Row, Col } from 'antd'
import TradePairOrder from './components/TradePairOrder'
import History from './components/History'
import TradePairConfirm from './components/TradePairConfirm'
import TradePairResult from './components/TradePairResult'
import { TradePage, TradeContent, TradeMain } from './styled'
import OrderContainer, { OrderStep } from '../../containers/order'
import { checkSubmittedTxs } from '../../APIs'

const { Content } = Layout

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

  const traceNavigation = () => {
    switch (Order.step) {
      case OrderStep.Order:
        return <TradePairOrder />
      case OrderStep.Confirm:
        return <TradePairConfirm />
      default:
        return <TradePairResult />
    }
  }

  return (
    <TradePage className="trade-page">
      <TradeMain>
        <Row>
          <Col span={8}>
            <TradeContent>{traceNavigation()}</TradeContent>
          </Col>
          <Col span={16}>
            <Content>
              <History />
            </Content>
          </Col>
        </Row>
      </TradeMain>
    </TradePage>
  )
}

export default Trade
