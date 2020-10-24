import React from 'react'
import { Layout, Row, Col } from 'antd'
import { useSelector } from 'react-redux'
import TradePairOrder from './components/TradePairOrder'
import TradeTableBox from './components/TradeContent'
import TradePairConfirm from './components/TradePairConfirm'
import TradePairResult from './components/TradePairResult'
import { TradePage, TradeContent } from './styled'
import { traceState } from '../../context/reducers/trace'

const { Content } = Layout

const Trade = () => {
  const orderStep = useSelector(({ trace }: { trace: traceState }) => trace.orderStep)

  const traceNavigation = () => {
    switch (orderStep) {
      case 1:
        return <TradePairOrder />
      case 2:
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
              marginLeft: '10px',
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
