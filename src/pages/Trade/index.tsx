import React from 'react'
import { useContainer } from 'unstated-next'
import { Layout, Row, Col } from 'antd'
import TradePairOrder from './components/TradePairOrder'
import TradeTableBox from './components/TradeContent'
import TradePairConfirm from './components/TradePairConfirm'
import TradePairResult from './components/TradePairResult'
import { TradePage, TradeContent } from './styled'
import OrderContainer, { OrderStep } from '../../containers/order'

const { Content } = Layout

const Trade = () => {
  const Order = useContainer(OrderContainer)
  const traceNavigation = () => {
    switch (Order.step) {
      case OrderStep.Order:
        return <TradePairOrder />
      case OrderStep.Comfirm:
        return <TradePairConfirm />
      default:
        return <TradePairResult />
    }
  }

  return (
    <TradePage>
      <Row>
        <Col span={6}>
          <TradeContent>{traceNavigation()}</TradeContent>
        </Col>
        <Col span={18}>
          <Content
            style={{
              marginLeft: '24px',
            }}
          >
            <TradeTableBox />
          </Content>
        </Col>
      </Row>
    </TradePage>
  )
}

export default Trade
