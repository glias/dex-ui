import React from 'react'
import { useContainer } from 'unstated-next'
import { Layout, Row, Col } from 'antd'
import TradePairOrder from './components/TradePairOrder'
import TradeTableBox from './components/TradeContent'
import TradePairConfirm from './components/TradePairConfirm'
import TradePairResult from './components/TradePairResult'
import { TradePage, TradeContent, TradeMain } from './styled'
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
    <TradePage className="trade-page">
      <TradeMain>
        <Row>
          <Col span={8}>
            <TradeContent>{traceNavigation()}</TradeContent>
          </Col>
          <Col span={16}>
            <Content
              style={{
                marginLeft: '2%',
              }}
            >
              <TradeTableBox />
            </Content>
          </Col>
        </Row>
      </TradeMain>
    </TradePage>
  )
}

export default Trade
