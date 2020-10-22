import React from 'react'
import { Form, Input, Button, Tooltip } from 'antd'
import i18n from '../../../../utils/i18n'
import { PairOrder, PayMeta } from './styled'

export default (props: any) => {
  const [form] = Form.useForm()

  return (
    <PairOrder>
      <Form form={form} layout="vertical">
        <Form.Item label="Pay" required>
          <PayMeta>
            <span className="maxNum">MAX: 1,234,567.0000</span>
            <Tooltip title="...">
              <i className="ai-question-circle-o" />
            </Tooltip>
          </PayMeta>
          <Input
            placeholder="0.0"
            suffix="DAI"
            style={{
              color: 'rgba(81, 119, 136, 1)',
            }}
          />
        </Form.Item>
        <Form.Item label="Price" required className="priceBox">
          <PayMeta>
            <span className="maxNum">Suggestion: 10.5</span>
            <Tooltip title="...">
              <i className="ai-question-circle-o" />
            </Tooltip>
          </PayMeta>
          <Input
            placeholder="0.0"
            suffix={`${props.currentPair} per DAI`}
            style={{
              color: 'rgba(81, 119, 136, 1)',
            }}
          />
        </Form.Item>
        <Form.Item
          style={{
            textAlign: 'center',
            marginBottom: 0,
          }}
        >
          <i className="ai-caret-down" />
        </Form.Item>
        <Form.Item label="Receiver">
          <div className="receiveBox">
            <span className="receiverCkb">0.0</span>
            <span>CKB</span>
          </div>
        </Form.Item>
        <div className="dividingLine" />
        <Form.Item className="submit-item">
          <Button htmlType="submit" type="text" className="submitBtn" size="large">
            {i18n.t(`trade.placeOrder`)}
          </Button>
        </Form.Item>
      </Form>
    </PairOrder>
  )
}
