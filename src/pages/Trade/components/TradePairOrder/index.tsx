import React, { useState } from 'react'
import { Form, Input, Button, Tooltip, Select, Divider } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { FormInstance } from 'antd/lib/form'
import { PairList } from '../../../../utils/const'
import { SELECTED_TRADE, TRACEORDER_STEP } from '../../../../context/actions/types'
import TradeCoinBox from '../TradeCoinBox'
import i18n from '../../../../utils/i18n'
import TracePairCoin from '../TracePairCoin'
import { traceState } from '../../../../context/reducers/trace'
import { PairOrderFormBox, PairBox, PayMeta } from './styled'

const TradePairOrder = () => {
  const [form] = Form.useForm()
  const { Option } = Select
  const currentPair = useSelector(({ trace }: { trace: traceState }) => trace.currentPair)
  const maximumPayable = useSelector(({ trace }: { trace: traceState }) => trace.maximumPayable)
  const dispatch = useDispatch()
  const formRef = React.createRef<FormInstance>()
  const [disabled, setDisabled] = useState(false)

  const changePair = (value: any) => {
    dispatch({
      type: SELECTED_TRADE,
      payload: {
        currentPair: value,
      },
    })
  }

  const onFinish = () => {
    // todo....
    dispatch({
      type: TRACEORDER_STEP,
      payload: {
        orderStep: 2,
      },
    })
  }

  // eslint-disable-next-line consistent-return
  const checkPay = (rule, value = 0) => {
    if (value <= 0) {
      setDisabled(true)
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject('Pay must be greater than zero!')
    }
    if (value <= 0.01) {
      setDisabled(true)
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject('Order too small')
    }
    if (value > maximumPayable) {
      setDisabled(true)
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject('unsuffcient balance')
    }
    setDisabled(false)
    return Promise.resolve()
  }

  // eslint-disable-next-line consistent-return
  const checkPrice = (rule, value = 0) => {
    if (value <= 0) {
      setDisabled(true)
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject('Price must be greater than zero!')
    }
    if (value <= 0.01) {
      setDisabled(true)
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject('Order too small')
    }
    if (value > maximumPayable) {
      setDisabled(true)
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject('unsuffcient balance')
    }
    setDisabled(false)
    return Promise.resolve()
  }

  return (
    <PairOrderFormBox>
      <div className="trace-form-select" id="trace-form-select">
        <Select
          defaultValue={currentPair}
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
            rules={[
              {
                validator: checkPay,
              },
            ]}
          >
            <Input
              placeholder="0.0"
              suffix="DAI"
              type="number"
              style={{
                color: 'rgba(81, 119, 136, 1)',
                width: '100%',
              }}
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
            rules={[
              {
                validator: checkPrice,
              },
            ]}
          >
            <Input
              placeholder="0.0"
              type="number"
              suffix={`${currentPair} per CKB`}
              style={{
                color: 'rgba(81, 119, 136, 1)',
              }}
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
        <Form.Item label="Receiver" name="receiver">
          <div className="receiver-box">
            <span className="receiver-ckb">0.0</span>
            <span>CKB</span>
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
