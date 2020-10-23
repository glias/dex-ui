import React, { useState } from 'react'
import { Form, Input, Button, Tooltip, Select, Divider } from 'antd'
import { PairList } from '../../../../utils/const'
import { TradeCoinBox } from '../PairBox'
import i18n from '../../../../utils/i18n'
import TracePairCoin from '../TracePairCoin'
import { PairOrderFormBox, PairBox, PayMeta } from './styled'

export default ({ currentPair }: { currentPair: String }) => {
  const [form] = Form.useForm()
  const { Option } = Select
  const [pair, setPair] = useState(currentPair)
  const changePair = (value: String) => setPair(value)

  const onFinish = () => {
    form.setFieldsValue({
      pay: 'Hello world!',
      price: 'male',
    })
  }

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
      <TracePairCoin currentPair={pair} />
      <Form
        form={form}
        name="traceForm"
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          remember: true,
        }}
      >
        <Form.Item
          label="Pay"
          rules={[
            {
              required: true,
              min: 0,
            },
          ]}
        >
          <PayMeta>
            <span className="max-num">MAX: 1,234,567.0000</span>
            <Tooltip title="todo">
              <i className="ai-question-circle-o" />
            </Tooltip>
          </PayMeta>
          <Form.Item name="pay" noStyle>
            <Input
              placeholder="0.0"
              suffix="DAI"
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
                required: true,
                min: 0,
              },
            ]}
          >
            <Input
              placeholder="0.0"
              suffix={`${pair} per DAI`}
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
          <Button htmlType="submit" className="submitBtn" size="large" type="text">
            {i18n.t(`trade.placeOrder`)}
          </Button>
        </Form.Item>
      </Form>
    </PairOrderFormBox>
  )
}
