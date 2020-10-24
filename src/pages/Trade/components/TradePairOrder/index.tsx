import React, { useState } from 'react'
import { Form, Input, Button, Tooltip, Select, Divider } from 'antd'
import { useDispatch } from 'react-redux'
import { FormInstance } from 'antd/lib/form'
import { useContainer } from 'unstated-next'
import { PairList } from '../../../../utils/const'
import { SELECTED_TRADE } from '../../../../context/actions/types'
import TradeCoinBox from '../TradeCoinBox'
import i18n from '../../../../utils/i18n'
import TracePairCoin from '../TracePairCoin'
import { PairOrderFormBox, PairBox, PayMeta } from './styled'
import OrderContainer, { OrderStep } from '../../../../containers/order'

const TradePairOrder = () => {
  const [form] = Form.useForm()
  const { Option } = Select
  const Order = useContainer(OrderContainer)
  const { price, setPrice: priceOnChange, pay, setPay: payOnChange, receive, setStep } = Order
  const maximumPayable = 0
  const dispatch = useDispatch()
  const formRef = React.createRef<FormInstance>()
  const [disabled] = useState(false)
  const [buyer, seller] = Order.pair

  const changePair = (value: any) => {
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

  // eslint-disable-next-line consistent-return
  // const checkPay = (_: any, value = 0) => {
  //   if (value <= 0) {
  //     setDisabled(true)
  //     // eslint-disable-next-line prefer-promise-reject-errors
  //     return Promise.reject('Pay must be greater than zero!')
  //   }
  //   if (value <= 0.01) {
  //     setDisabled(true)
  //     // eslint-disable-next-line prefer-promise-reject-errors
  //     return Promise.reject('Order too small')
  //   }
  //   if (value > maximumPayable) {
  //     setDisabled(true)
  //     // eslint-disable-next-line prefer-promise-reject-errors
  //     return Promise.reject('unsuffcient balance')
  //   }
  //   setDisabled(false)
  //   return Promise.resolve()
  // }

  // eslint-disable-next-line consistent-return
  // const checkPrice = (_: any, value = 0) => {
  //   if (value <= 0) {
  //     // setDisabled(true)
  //     // eslint-disable-next-line prefer-promise-reject-errors
  //     return Promise.reject('Price must be greater than zero!')
  //   }
  //   if (value <= 0.01) {
  //     // setDisabled(true)
  //     // eslint-disable-next-line prefer-promise-reject-errors
  //     return Promise.reject('Order too small')
  //   }
  //   if (value > maximumPayable) {
  //     // setDisabled(true)
  //     // eslint-disable-next-line prefer-promise-reject-errors
  //     return Promise.reject('unsuffcient balance')
  //   }
  //   setDisabled(false)
  //   return Promise.resolve()
  // }

  return (
    <PairOrderFormBox>
      <div className="trace-form-select" id="trace-form-select">
        <Select
          defaultValue="DAI"
          style={{
            width: '100%',
          }}
          getPopupContainer={() => document.getElementById('trace-form-select') as HTMLElement}
          size="large"
          onChange={changePair}
          dropdownRender={(menu: any) => (
            <div>
              {menu}
              <Divider
                style={{
                  margin: '4px 0',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  padding: 8,
                }}
              >
                <Input
                  size="large"
                  style={{
                    flex: 'auto',
                    background: 'rgba(236, 242, 244, 1)',
                  }}
                  placeholder={i18n.t('trade.searchPairPlaceHolder')}
                />
              </div>
            </div>
          )}
        >
          {PairList.map(item => (
            <Option label={item.name} value={item.name} key={item.name}>
              <PairBox>
                <li className="pairTraceList">
                  <TradeCoinBox pair={item.name} />
                  <div className="decollect">/</div>
                  <TradeCoinBox pair="CKB" />
                </li>
              </PairBox>
            </Option>
          )).slice(1)}
        </Select>
      </div>
      <TracePairCoin />
      <Form form={form} ref={formRef} autoComplete="off" name="traceForm" layout="vertical" onFinish={onFinish}>
        <Form.Item label="Pay">
          <PayMeta>
            <span className="max-num">
              MAX:
              {maximumPayable}
            </span>
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
              placeholder="0.0"
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
        <Form.Item label="Price" className="price-box">
          <PayMeta>
            <span className="max-num">Suggestion: 10.5</span>
            <Tooltip title="todo">
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
              placeholder="0.0"
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
          }}
        >
          <i className="ai-caret-down" />
        </Form.Item>
        <Form.Item label="Receive" name="receiver">
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

export default TradePairOrder
