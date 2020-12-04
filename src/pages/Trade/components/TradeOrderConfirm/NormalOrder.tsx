import React, { useMemo } from 'react'
import { Amount, Builder, AmountUnit } from '@lay2/pw-core'
import { useContainer } from 'unstated-next'
import BigNumber from 'bignumber.js'
import { Divider } from 'antd'
import { OrderResult } from './styled'
import i18n from '../../../../utils/i18n'
import OrderContainer, { OrderType } from '../../../../containers/order'
import { toFormatWithoutTrailingZero } from '../../../../utils/fee'
import { COMMISSION_FEE } from '../../../../constants'
import { List, Item } from './list'
import { Meta } from './meta'

export default function NormalOrder() {
  const Order = useContainer(OrderContainer)
  const [buyer, seller] = Order.pair

  const transactionFee = useMemo(() => {
    return Order.tx ? Builder.calcFee(Order.tx).toString() : '0'
  }, [Order.tx])

  const tradeFee = useMemo(() => {
    return toFormatWithoutTrailingZero(new BigNumber(Order.pay).times(COMMISSION_FEE).toString())
  }, [Order.pay])

  const totalPay = useMemo(() => {
    let amount = new BigNumber(Order.pay).plus(new BigNumber(tradeFee))
    if (buyer === 'CKB') {
      amount = amount.plus(new BigNumber(transactionFee))
    }
    return toFormatWithoutTrailingZero(amount.toString())
  }, [Order.pay, buyer, tradeFee, transactionFee])

  const lockedCkbAmount = useMemo(() => {
    if (Order.tx) {
      const [orderOutput] = Order.tx.raw.outputs
      return orderOutput.capacity.toString(AmountUnit.ckb)
    }
    return '0'
  }, [Order.tx])

  const totalPayDetail = useMemo(() => {
    const list: Item[] = [
      {
        desc: i18n.t(`trade.totalPay`),
        value: totalPay,
        unit: buyer,
      },
    ]

    if (Order.tx && Order.orderType === OrderType.Ask) {
      list.push({
        desc: '',
        value: new Amount('0').add(new Amount(transactionFee)).toString(),
        unit: 'CKB',
      })
    }

    return list
  }, [Order.orderType, totalPay, Order.tx, buyer, transactionFee])

  const tradeDetails = useMemo(() => {
    const list: Item[] = [
      {
        desc: i18n.t('trade.result.trade'),
        value: toFormatWithoutTrailingZero(Order.pay),
        unit: buyer,
      },
      {
        desc: i18n.t('trade.result.tradeFee'),
        value: toFormatWithoutTrailingZero(tradeFee),
        unit: buyer,
      },
      {
        desc: i18n.t('trade.result.transactionFee'),
        value: toFormatWithoutTrailingZero(transactionFee),
        unit: 'CKB',
      },
    ]
    return list
  }, [tradeFee, buyer, transactionFee, Order.pay])

  const payDetail = useMemo(() => {
    const list: Item[] = [
      {
        desc: i18n.t(`trade.price`),
        value: toFormatWithoutTrailingZero(Order.price),
        unit: `CKB per ${Order.currentSudtTokenName}`,
      },
    ]

    return list
  }, [Order.price, Order.currentSudtTokenName])

  const receive = useMemo(() => {
    return toFormatWithoutTrailingZero(Order.receive)
  }, [Order.receive])

  const receiveDetail = useMemo(() => {
    const list: Item[] = [
      {
        desc: i18n.t(`trade.result.receive`),
        value: receive,
        unit: seller,
      },
    ]

    return list
  }, [receive, seller])

  return (
    <OrderResult>
      <List list={totalPayDetail} />
      <List list={tradeDetails} isDeatil />
      <Meta amount={lockedCkbAmount} />
      <List list={payDetail} />
      <Divider style={{ margin: '20px 0' }} />
      <List list={receiveDetail} />
    </OrderResult>
  )
}
