import React, { useMemo } from 'react'
import { Divider } from 'antd'
import BigNumber from 'bignumber.js'
import i18n from 'utils/i18n'
import { useContainer } from 'unstated-next'
import OrderContainer from 'containers/order'
import { COMMISSION_FEE, ORDER_CELL_CAPACITY } from 'constants/number'
import { List, Item } from './list'
import { OrderResult } from './styled'
import { CrossMeta } from './CrossMeta'

const CrossChain = () => {
  const Order = useContainer(OrderContainer)
  const [buyer, seller] = Order.pair
  const tradeFee = useMemo(() => {
    return new BigNumber(Order.pay).times(COMMISSION_FEE).toString()
  }, [Order.pay])

  const totalPay = useMemo(() => {
    const pay = new BigNumber(Order.pay).plus(new BigNumber(tradeFee))
    return pay.toString()
  }, [Order.pay, tradeFee])

  const totalPayDetail = useMemo(() => {
    const list: Item[] = [
      {
        desc: i18n.t(`trade.totalPay`),
        value: totalPay,
        unit: buyer,
      },
    ]

    return list
  }, [totalPay, buyer])

  const tradeDetails = useMemo(() => {
    const list: Item[] = [
      {
        desc: i18n.t('trade.result.trade'),
        value: Order.pay,
        unit: buyer,
      },
      {
        desc: i18n.t('trade.result.crossFee'),
        value: '❤️ Free Now',
        unit: '',
      },
      {
        desc: i18n.t('trade.result.tradeFee'),
        value: tradeFee,
        unit: buyer,
      },
    ]
    return list
  }, [tradeFee, buyer, Order.pay])

  const payDetail = useMemo(() => {
    const list: Item[] = [
      {
        desc: i18n.t(`trade.price`),
        value: Order.price,
        unit: `CKB per ETH`,
      },
    ]

    return list
  }, [Order.price])

  const receiveDetail = useMemo(() => {
    const list: Item[] = [
      {
        desc: i18n.t(`trade.result.receive`),
        value: Order.receive,
        unit: seller,
      },
      {
        desc: '',
        value: `+ ${ORDER_CELL_CAPACITY}`,
        unit: 'CKB',
      },
    ]

    return list
  }, [Order.receive, seller])

  return (
    <OrderResult>
      <List list={totalPayDetail} />
      <List list={tradeDetails} isDeatil />
      <List list={payDetail} />
      <Divider style={{ margin: '20px 0' }} />
      <List list={receiveDetail} />
      <CrossMeta />
    </OrderResult>
  )
}

export default CrossChain
