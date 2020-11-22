/* eslint-disable operator-linebreak */
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Form, Tooltip, Modal, Input, Divider } from 'antd'
import { FormInstance } from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { Address, Amount, AddressType } from '@lay2/pw-core'
import { useContainer } from 'unstated-next'
import ConfirmButton from 'components/ConfirmButton'
import {
  PRICE_DECIMAL,
  SUDT_DECIMAL,
  ORDER_CELL_CAPACITY,
  MAX_TRANSACTION_FEE,
  MINIUM_RECEIVE,
  SUDT_GLIA,
} from '../../../../constants'
import i18n from '../../../../utils/i18n'
import { OrderTableContainer, PayMeta, Header } from './styled'
import OrderContainer, { OrderStep, OrderType } from '../../../../containers/order'
import WalletContainer from '../../../../containers/wallet'
import PlaceOrderBuilder from '../../../../pw/placeOrderBuilder'
import DEXCollector from '../../../../pw/dexCollector'

export default function OrderTable() {
  const [form] = Form.useForm()
  const Wallet = useContainer(WalletContainer)
  const Order = useContainer(OrderContainer)
  const { price, pay, setPrice, setPay, receive, setStep } = Order
  const formRef = React.createRef<FormInstance>()
  const [buyer, seller] = Order.pair
  const [collectingCells, setCollectingCells] = useState(false)
  const [isPayInvalid, setIsPayInvalid] = useState(true)
  const [isPriceInvalid, setIsPriceInvalid] = useState(true)
  const disabled = useMemo(() => isPayInvalid || isPriceInvalid, [isPayInvalid, isPriceInvalid])

  // const changePair = () => {
  //   Order.togglePair()
  //   form.resetFields()
  // }

  const isBid = useMemo(() => {
    return Order.orderType === OrderType.Buy
  }, [Order.orderType])

  const MIN_VAL = isBid ? SUDT_DECIMAL : PRICE_DECIMAL

  const walletNotConnected = useMemo(() => {
    return !Wallet.ckbWallet.address
  }, [Wallet.ckbWallet.address])

  const ckbBalance = useMemo(() => {
    return Wallet.ckbWallet.balance.toString()
  }, [Wallet.ckbWallet.balance])

  const insufficientCKB = useMemo(() => {
    return new BigNumber(ckbBalance).minus(ORDER_CELL_CAPACITY).minus(MAX_TRANSACTION_FEE).isLessThanOrEqualTo(0)
  }, [ckbBalance])

  const maxPay = useMemo(() => {
    const p = new BigNumber(Order.maxPay)
    if (p.isLessThan(0)) {
      return '0'
    }

    return p.toString()
  }, [Order.maxPay])

  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    formRef.current?.setFieldsValue({
      receive,
    })
  }, [receive, formRef])

  const setMaxPay = useCallback(() => {
    // eslint-disable-next-line no-unused-expressions
    formRef.current?.setFieldsValue({
      pay: maxPay,
    })
    setPay(maxPay)
  }, [maxPay, formRef, setPay])

  const checkPay = useCallback(
    (_: any, value: string): Promise<void> => {
      const val = new BigNumber(value)
      const decimal = 8

      if (val.isLessThan(0)) {
        setIsPayInvalid(true)
        return Promise.reject(i18n.t(`trade.greaterThanZero`))
      }

      if (Number.isNaN(parseFloat(value))) {
        setIsPayInvalid(true)
        return Promise.reject(i18n.t(`trade.unEffectiveNumber`))
      }

      if (!new BigNumber(val).decimalPlaces(decimal).isEqualTo(val)) {
        setIsPayInvalid(true)
        return Promise.reject(i18n.t(`trade.maximumDecimal`, { decimal }))
      }

      if (new BigNumber(value).gt(maxPay)) {
        setIsPayInvalid(true)
        return Promise.reject(i18n.t('trade.lessThanMax'))
      }

      setIsPayInvalid(false)

      return Promise.resolve()
    },
    [maxPay],
  )

  const checkPrice = useCallback(
    (_: any, value: string) => {
      const val = new BigNumber(value)
      const decimal = 8

      if (Number.isNaN(parseFloat(value))) {
        setIsPriceInvalid(true)
        return Promise.reject(i18n.t(`trade.unEffectiveNumber`))
      }

      if (val.isLessThan(0)) {
        setIsPriceInvalid(true)
        return Promise.reject(i18n.t(`trade.greaterThanZero`))
      }

      if (!val.multipliedBy(`${MIN_VAL}`).isGreaterThan(0.1)) {
        setIsPriceInvalid(true)
        return Promise.reject(i18n.t(`trade.tooSmallNumber`))
      }

      if (!new BigNumber(val).decimalPlaces(decimal).isEqualTo(val)) {
        setIsPriceInvalid(true)
        return Promise.reject(i18n.t(`trade.maximumDecimal`, { decimal }))
      }

      setIsPriceInvalid(false)

      return Promise.resolve()
    },
    [MIN_VAL],
  )

  const checkReceive = useCallback(() => {
    if (new BigNumber(receive).isLessThan(MINIUM_RECEIVE)) {
      return Promise.reject(i18n.t('trade.miniumReceive'))
    }

    return Promise.resolve()
  }, [receive])

  // const setBestPrice = useCallback(() => {
  //   // eslint-disable-next-line no-unused-expressions
  //   formRef.current?.setFieldsValue({
  //     price: Order.bestPrice,
  //   })
  //   setPrice(Order.bestPrice)
  // }, [Order.bestPrice, formRef, setPrice])

  const submitStatus = useMemo(() => {
    if (Wallet.connecting) {
      return i18n.t('header.connecting')
    }

    return i18n.t('trade.placeOrder')
  }, [Wallet.connecting])

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

  const onSubmit = useCallback(async () => {
    if (walletNotConnected) {
      Wallet.connectWallet()
    } else {
      const builder = new PlaceOrderBuilder(
        new Address(Wallet.ckbWallet.address, AddressType.ckb),
        new Amount(Order.pay),
        Order.orderType,
        Order.price,
        SUDT_GLIA,
        new DEXCollector(),
      )
      try {
        setCollectingCells(true)
        const tx = await builder.build()
        Order.setTx(tx)
        setStep(OrderStep.Confirm)
      } catch (error) {
        Modal.error({ title: 'Build transaction:\n', content: error.message })
      } finally {
        setCollectingCells(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    setStep,
    walletNotConnected,
    Wallet.connectWallet,
    Order.orderType,
    Order.setTx,
    Order.price,
    Order.pay,
    Order.orderType,
  ])

  return (
    <OrderTableContainer id="order-box" isBid={Order.orderType === OrderType.Buy}>
      <Form form={form} ref={formRef} autoComplete="off" name="traceForm" layout="vertical" onFinish={onSubmit}>
        <Header>
          <h3>{i18n.t('trade.trade')}</h3>
        </Header>
        <Form.Item label={i18n.t('trade.pay')}>
          <PayMeta>
            <button type="button" onClick={setMaxPay}>
              {`${i18n.t('trade.max')}: ${maxPay}`}
            </button>
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
              required
              size="large"
              step="any"
              value={pay}
              onChange={e => setPay(e.target.value)}
              max={Order.maxPay}
            />
          </Form.Item>
        </Form.Item>
        <Form.Item
          label={i18n.t('trade.price')}
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
            required
            type="number"
            step="any"
            onChange={e => setPrice(e.target.value)}
            value={price}
          />
        </Form.Item>
        <Divider />
        <Form.Item label={i18n.t('trade.receive')} name="receive" rules={[{ validator: checkReceive }]}>
          <Input
            className="receive"
            placeholder="0.00"
            suffix={seller}
            size="large"
            required
            type="number"
            step="any"
            disabled
            readOnly
          />
        </Form.Item>
        <Form.Item className="submit">
          <ConfirmButton
            text={submitStatus}
            bgColor={Order.confirmButtonColor}
            loading={collectingCells || Wallet.connecting}
            disabled={disabled || insufficientCKB}
          />
        </Form.Item>
      </Form>
    </OrderTableContainer>
  )
}
