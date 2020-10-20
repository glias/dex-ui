import React from 'react'
import { Form, Input, Button, Popover } from 'antd'
import i18n from '../../utils/i18n'
import { useAppState } from '../../contexts/providers'
import {
  TradePage,
  TradeContent,
  TradeForm,
  ConectIconBox
} from './styled'

console.log(useAppState)

export default () => {
  const FormLayoutDemo = () => {
    const [ form ] = Form.useForm()
    const PopverContent = (
      <ul>
        <li>Nothing</li>
      </ul>
    )
    return (
      <div className="formBox">
        <div className="header">
          <span>{i18n.t('trade.pair')}</span>
          <Popover placement="bottomRight" title='' content={ PopverContent } trigger="click">
            <span></span>
            <Button type="text">
              DAI
            </Button>
          </Popover>
          /
          <Popover placement="bottomRight" title='' content={ PopverContent } trigger="click">
            <span></span>
            <Button type="text">
              CKB
            </Button>
          </Popover>
          <Button type="text"></Button>
        </div>
        <Form
          layout="vertical"
          form={form}
          className="form"
          initialValues={{
            layout: "horizontal",
          }}
        >
          <Form.Item>
            <span>You Pay</span>
            <Button className="max-btn" size="small" type="primary">Max</Button>
            <Input placeholder="Enter your Pay" suffix="RMB" type="number" />
          </Form.Item>
          <Form.Item>
            <span>Rate</span>
            <Button className="max-btn" size="small" type="primary">Current</Button>
            <Input placeholder="Rate" suffix="DAI / CKB" type="number" />
          </Form.Item>
          <ConectIconBox>
            <Button shape="circle"></Button>
          </ConectIconBox>
          <Form.Item label="You Receive">
          <Input placeholder="Receive" suffix="DAI" disabled />
          </Form.Item>
          <Form.Item>
            <Button type="primary" style={{ display: "flex", margin: "0 auto" }}>Connect Wallet</Button>
          </Form.Item>
        </Form>
      </div>
    )
  }
  return (
    <TradePage className="Trade">
      <TradeContent>
        <TradeForm>
          <FormLayoutDemo />
        </TradeForm>
      </TradeContent>
    </TradePage>
  )
}
