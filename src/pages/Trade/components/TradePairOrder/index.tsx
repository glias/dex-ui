import React, { useState } from 'react'
import { Form, Input, Button, Tooltip, Popover, Divider } from 'antd'
import { useDispatch } from 'react-redux'
import { FormInstance } from 'antd/lib/form'
import { useContainer } from 'unstated-next'
import { PairList } from '../../../../utils/const'
import { SELECTED_TRADE } from '../../../../context/actions/types'
import TradeCoinBox from '../TradeCoinBox'
import i18n from '../../../../utils/i18n'
import TracePairCoin from '../TracePairCoin'
import { PairOrderFormBox, PayMeta, OrderSelectBox, OrderSelectPopver, PairBlock } from './styled'
import OrderContainer, { OrderStep } from '../../../../containers/order'

export default () => {
  const [form] = Form.useForm()
  const Order = useContainer(OrderContainer)
  const [visiblePopver, setVisiblePopver] = useState(false)
  const { price, setPrice: priceOnChange, pay, setPay: payOnChange, receive, setStep } = Order
  const dispatch = useDispatch()
  const formRef = React.createRef<FormInstance>()
  const [disabled] = useState(false)
  const [buyer, seller] = Order.pair

  console.log(Order)

  const changePair = (value: any) => {
    setVisiblePopver(false)
    Order.togglePair(value)
    form.resetFields()
    dispatch({
      type: SELECTED_TRADE,
      payload: {
        currentPair: value,
      },
    })
  }

  const onFinish = async () => {
    setStep(OrderStep.Comfirm)

    // const builder = new CancelOrderBuilder(
    //   new Address(Wallet.ckbWallet.address, AddressType.ckb),
    //   new OutPoint('0x098ce457225a8565c5f2b9a541e865c66052d835b43712cf24e6a9662a944a00', '0x0'),
    //   new Amount('400'),
    // )
    // const txHash = await Wallet.pw?.sendTransaction(await builder.build())
    // console.info(`Cancel order: ${txHash}`)
  }

  const SelectContent = (
    <OrderSelectPopver>
      <Input
        style={{
          flex: 'auto',
          fontSize: '16px',
          background: 'rgba(236, 242, 244, 1)',
        }}
        placeholder={i18n.t('trade.searchPairPlaceHolder')}
      />
      <Divider
        style={{
          background: '#ABD1E1',
        }}
      />
      {PairList.slice(1).map(item => (
        <PairBlock key={item.name} onClick={() => changePair(item.name)}>
          <Button className="pairTraceList" type="text">
            <TradeCoinBox pair={item.name} />
            <div className="decollect">/</div>
            <TradeCoinBox pair="CKB" />
          </Button>
        </PairBlock>
      ))}
    </OrderSelectPopver>
  )

  return (
    <PairOrderFormBox id="order-box">
      <Popover
        overlayClassName="no-arrorPoint popver-overlay"
        trigger="click"
        visible={visiblePopver}
        getPopupContainer={() => document.getElementById('order-box') as HTMLElement}
        content={SelectContent}
        onVisibleChange={(visible: boolean) => setVisiblePopver(visible)}
      >
        <OrderSelectBox id="trace-form-select">
          <PairBlock>
            <span className="pair">{i18n.t('trade.pair')}</span>
            <Button className="pairTraceList" type="text">
              <TradeCoinBox pair={Order.pair[0]} />
              <div className="decollect">/</div>
              <TradeCoinBox pair={Order.pair[1]} />
            </Button>
          </PairBlock>
        </OrderSelectBox>
      </Popover>
      <TracePairCoin />
      <Form form={form} ref={formRef} autoComplete="off" name="traceForm" layout="vertical" onFinish={onFinish}>
        <Form.Item label={i18n.t('trade.pay')}>
          <PayMeta>
            <span className="form-label-meta-num">{`${i18n.t('trade.max')}: ${Order.maximumPayable}`}</span>
            <Tooltip title="todo">
              <i className="ai-question-circle-o" />
            </Tooltip>
          </PayMeta>
          <Form.Item
            name="pay"
            noStyle
            // rules={[
            //   {
            //     validator: checkPay,
            //   },
            // ]}
          >
            <Input
              placeholder="0"
              suffix={buyer}
              type="number"
              style={{
                color: 'rgba(81, 119, 136, 1)',
                width: '100%',
              }}
              value={pay}
              onChange={e => {
                payOnChange(e.target.value)
              }}
              min={0}
            />
          </Form.Item>
        </Form.Item>
        <Form.Item label={i18n.t('trade.price')} className="price-box">
          <PayMeta>
            <span className="form-label-meta-num">{`${i18n.t('trade.suggestion')}: ${Order.suggestionPrice}`}</span>
            <Tooltip title={i18n.t(`trade.suggestionTooltip`)}>
              <i className="ai-question-circle-o" />
            </Tooltip>
          </PayMeta>
          <Form.Item
            name="price"
            // rules={[
            //   {
            //     validator: checkPrice,
            //   },
            // ]}
          >
            <Input
              placeholder="0"
              suffix={`${seller} per ${buyer}`}
              style={{
                color: 'rgba(81, 119, 136, 1)',
              }}
              type="number"
              value={price}
              onChange={e => {
                priceOnChange(e.target.value)
              }}
              min={0}
            />
          </Form.Item>
        </Form.Item>
        <Form.Item
          name="caret-down"
          style={{
            textAlign: 'center',
            margin: 0,
            color: '#517788',
          }}
        >
          <i className="ai-caret-down" />
        </Form.Item>
        <Form.Item label={i18n.t('trade.receive')} name="receiver">
          <div className="receiver-box">
            <span className="receiver-ckb">{receive}</span>
            <span>{seller}</span>
          </div>
        </Form.Item>
        <div className="dividing-line" />
        <Form.Item className="submit-item">
          <Button htmlType="submit" className="submitBtn" disabled={disabled} size="large" type="text">
            {i18n.t(`trade.placeOrder`)}
          </Button>
        </Form.Item>
      </Form>
    </PairOrderFormBox>
  )
}
