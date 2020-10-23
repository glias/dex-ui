import React from 'react'
import { Layout, Row, Col } from 'antd'
import { connect } from 'react-redux'
import TradePairOrder from './components/TradePairOrder'
import TradeTableBox from './components/TradeContent'
import { TradePage, TradeContent } from './styled'

const { Content } = Layout

const mapStateToProps = ({ trace, wallet }: { trace: State.TraceState; wallet: State.WalletState }) => {
  return {
    ...trace,
    ...wallet,
  }
}

const Trade = ({ currentPair }: { currentPair: String }) => {
  return (
    <TradePage>
      <Row>
        <Col span={6}>
          <TradeContent>
            <TradePairOrder currentPair={currentPair} />
          </TradeContent>
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

export default connect(mapStateToProps)(Trade)
