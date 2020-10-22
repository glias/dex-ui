import React, { useState } from 'react'
import { Input, Layout, Popover, Row, Col } from 'antd'
import { connect } from 'react-redux'
import i18n from '../../utils/i18n'
import PairContent, { PairTraceLine } from './components/pairBox'
import { PairLists, PairTrace } from '../../utils/const'
import TradePairOrder from './components/TradePairOrder'
import TradeTableBox from './components/TradeContent'
import { TradePage, TradeContent, TradeForm, PopverContent, TracePairLine } from './styled'

const { Content } = Layout

const mapStateToProps = (dispatch, ownProps) => {
  return {}
}

export default connect(mapStateToProps)(() => {
  const [currentPair, setCurrentPair] = useState('DAI')
  const FormLayout = () => {
    const [visiblePopver, setVisiblePopver] = useState(false)

    const transferPair = (visible: boolean, pair: string) => {
      setVisiblePopver(visible)
      // todo...
      setCurrentPair(pair)
    }

    const PairBoxSelect = () => (
      <PopverContent>
        <Input placeholder={i18n.t('trade.searchPairPlaceHolder')} />
        <div className="dividingLine" />
        <PairTraceLine
          content={PairLists}
          selectPair={(visible: boolean, name: string) => transferPair(visible, name)}
        />
      </PopverContent>
    )
    return (
      <div className="pairSelect" id="pairSelect">
        <Popover
          placement="bottom"
          trigger="click"
          visible={visiblePopver}
          getPopupContainer={() => document.getElementById('pairSelect') as HTMLInputElement}
          overlayClassName="no-arrorPoint"
          onVisibleChange={() => {
            setVisiblePopver(!visiblePopver)
          }}
          content={PairBoxSelect()}
        >
          <div className="pairLine">
            <span className="pairLeft">
              <span className="pair">Pair</span>
              <PairContent content={PairLists.filter(list => list.name === currentPair)} />
              <span className="decollect">/</span>
              <PairContent content={PairTrace} />
            </span>
            <i
              className="ai-down"
              style={{
                color: 'rgba(0, 106, 151, 1)',
              }}
            />
          </div>
        </Popover>
      </div>
    )
  }
  return (
    <TradePage>
      <Row>
        <Col span={6}>
          <TradeContent>
            <TradeForm>
              <FormLayout />
            </TradeForm>
            <TracePairLine>
              <span>{currentPair}</span>
              <span>
                <i
                  className="ai-right-circle"
                  style={{
                    color: 'rgba(0, 106, 151, 1)',
                  }}
                />
              </span>
              <span>CKB</span>
            </TracePairLine>
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
      {/* <Layout>
          <Sider width={'25%'} theme="light">
            <TradeContent>
              <TradeForm>
                <FormLayout></FormLayout>
              </TradeForm>
              <TracePairLine>
                <span>{currentPair}</span>
                <span><i className="ai-right-circle" style={{'color': 'rgba(0, 106, 151, 1)'}} /></span>
                <span>CKB</span>
              </TracePairLine>
              <TradePairOrder currentPair={currentPair}></TradePairOrder>
            </TradeContent>
          </Sider>
          
        </Layout> */}
    </TradePage>
  )
})
