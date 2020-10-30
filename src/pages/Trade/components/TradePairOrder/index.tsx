import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Form, Input, Button, Tooltip, Divider, Popover } from 'antd'
import { FormInstance } from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { useContainer } from 'unstated-next'
import {
  PairList,
  DECIMAL_TEN,
  DECIMAL_EIGHT,
  PRICE_DECIMAL,
  SUDT_DECIMAL,
  MIN_ORDER_DAI,
  MIN_ORDER_CKB,
} from '../../../../utils/const'
import TradeCoinBox from '../TradeCoinBox'
import i18n from '../../../../utils/i18n'
import TracePairCoin from '../TracePairCoin'
import { PairOrderFormBox, PayMeta, OrderSelectPopver, PairBlock } from './styled'
import OrderContainer, { OrderStep, OrderType } from '../../../../containers/order'
import WalletContainer from '../../../../containers/wallet'
import styles from './tradePairOrder.module.css'

export default () => {
  const [form] = Form.useForm()
  const Wallet = useContainer(WalletContainer)
  const Order = useContainer(OrderContainer)
  const [visiblePopver, setVisiblePopver] = useState(false)
  const { price, pay, setPrice, setPay, receive, setStep } = Order
  const formRef = React.createRef<FormInstance>()
  const [buyer, seller] = Order.pair

  // disabled button
  const [fieldPay, setFieldPay] = useState(false)
  const [fieldPrice, setFieldPrice] = useState(false)

  const MIN_VAL = Order.orderType === OrderType.Buy ? SUDT_DECIMAL : PRICE_DECIMAL
  const MIN_DECIMALPLACES = Order.orderType === OrderType.Buy ? DECIMAL_EIGHT : DECIMAL_TEN
  const MIN_ORDER = Order.orderType === OrderType.Buy ? MIN_ORDER_DAI : MIN_ORDER_CKB

  const changePair = () => {
    setVisiblePopver(false)
    Order.togglePair()
    form.resetFields()
  }

  const walletNotConnected = useMemo(() => {
    return !Wallet.ckbWallet.address
  }, [Wallet.ckbWallet.address])

  const checkPay = (_: any, value: string): Promise<void> => {
    const val = new BigNumber(value)
    const fieldsValue = formRef.current?.getFieldsValue()

    // Initialization pay to avoid receive calculation
    setPrice('')

    if (walletNotConnected) {
      return Promise.resolve()
    }

    if (Number.isNaN(parseFloat(value))) {
      setFieldPay(false)
      return Promise.reject(i18n.t(`trade.unEffectiveNumber`))
    }

    if (!new BigNumber(val).decimalPlaces(MIN_DECIMALPLACES).isEqualTo(val)) {
      setFieldPay(false)
      return Promise.reject(i18n.t(`trade.tooMaxprecision`))
    }

    if (!val.multipliedBy(`${MIN_VAL}`).isGreaterThan(0.1)) {
      setFieldPay(false)
      return Promise.reject(i18n.t(`trade.tooSmallNumber`))
    }

    if (val.comparedTo(Order.maxPay) === 1) {
      setFieldPay(false)
      return Promise.reject(i18n.t(`trade.lessThanMaxNumber`))
    }

    if (new BigNumber(Order.maxPay).minus(val).lt(MIN_ORDER)) {
      setFieldPay(false)
      return Promise.reject(i18n.t(`trade.insuffcientCKBBalance`))
    }

    setFieldPay(true)
    setPrice(fieldsValue.pay)

    return Promise.resolve()
  }

  const checkPrice = (_: any, value: string): Promise<void> => {
    const val = new BigNumber(value)
    const fieldsValue = formRef.current?.getFieldsValue()

    // Initialization pay to avoid receive calculation
    setPay('')

    if (walletNotConnected) {
      return Promise.resolve()
    }

    if (Number.isNaN(parseFloat(value))) {
      setFieldPrice(false)
      return Promise.reject(i18n.t(`trade.unEffectiveNumber`))
    }

    if (!new BigNumber(val).decimalPlaces(10).isEqualTo(val)) {
      setFieldPrice(false)
      return Promise.reject(i18n.t(`trade.tooMaxprecision`))
    }
    if (!val.multipliedBy(`${PRICE_DECIMAL}`).isGreaterThan(0.1)) {
      setFieldPrice(false)
      return Promise.reject(i18n.t(`trade.tooSmallNumber`))
    }
    setFieldPrice(true)
    setPay(fieldsValue.price)

    return Promise.resolve()
  }

  const setBestPrice = useCallback(() => {
    // eslint-disable-next-line no-unused-expressions
    formRef.current?.setFieldsValue({
      price: Order.bestPrice,
    })
  }, [Order.bestPrice, formRef])

  const disabledFn = () => {
    if (walletNotConnected) {
      return false
    }
    if (Wallet.connecting) {
      return true
    }
    if (!fieldPay || !fieldPrice) {
      return true
    }
    return false
  }

  const submitStatus = useMemo(() => {
    if (Wallet.connecting) {
      return i18n.t('header.connecting')
    }

    if (walletNotConnected) {
      return i18n.t('header.wallet')
    }

    return i18n.t('trade.placeOrder')
  }, [Wallet.connecting, walletNotConnected])

  useEffect(() => {
    if (Wallet.ckbWallet.address === '') {
      return
    }

    Order.initPrice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Wallet.ckbWallet.address])

  useEffect(() => {
    Order.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Order.step])

  const onSubmit = useCallback(() => {
    if (walletNotConnected) {
      Wallet.connectWallet()
    } else {
      setStep(OrderStep.Comfirm)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setStep, walletNotConnected, Wallet.connectWallet, formRef, setPay, setPrice])

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
        <PairBlock key={item.name} onClick={() => changePair()}>
          <Button className="pair-trace-box" type="text">
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
        <div className={styles.OrderSelectBox}>
          <PairBlock>
            <span className="pair">{i18n.t('trade.pair')}</span>
            <Button className="pair-trace-box" type="text">
              <TradeCoinBox pair={Order.pair[0]} />
              <div className="decollect">/</div>
              <TradeCoinBox pair={Order.pair[1]} />
            </Button>
          </PairBlock>
        </div>
      </Popover>
      <TracePairCoin resetFields={() => form.resetFields()} />
      <Form form={form} ref={formRef} autoComplete="off" name="traceForm" layout="vertical" onFinish={onSubmit}>
        <Form.Item label={i18n.t('trade.pay')}>
          <PayMeta>
            <span className="form-label-meta-num">{`${i18n.t('trade.max')}: ${Order.maxPay}`}</span>
            <Tooltip title={i18n.t('trade.maxPay')}>
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
              placeholder="0"
              suffix={buyer}
              type="number"
              size="large"
              style={{
                color: 'rgba(81, 119, 136, 1)',
                width: '100%',
              }}
              step="any"
              value={pay}
              max={Order.maxPay}
            />
          </Form.Item>
        </Form.Item>
        <Form.Item label={i18n.t('trade.price')} className="price-box">
          <PayMeta>
            <Button type="text" className="form-label-meta-num" onClick={setBestPrice}>
              {`${i18n.t('trade.suggestion')}: ${Order.bestPrice}`}
            </Button>
            <Tooltip title={i18n.t(`trade.suggestionTooltip`)}>
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
              placeholder="0"
              suffix="CKB per DAI"
              size="large"
              style={{
                color: 'rgba(81, 119, 136, 1)',
              }}
              type="number"
              step="any"
              value={price}
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
        <Form.Item
          label={i18n.t('trade.receive')}
          name="receiver"
          style={{
            marginBottom: '10px',
          }}
        >
          <div className="receiver-box">
            <span className="receiver-ckb">{receive}</span>
            <span>{seller}</span>
          </div>
        </Form.Item>
        <div className="dividing-line" />
        <Form.Item className="submit-item">
          <Button htmlType="submit" className="submit-btn" disabled={disabledFn()} size="large" type="text">
            {submitStatus}
          </Button>
        </Form.Item>
      </Form>
    </PairOrderFormBox>
  )
}
