import React, { useMemo } from 'react'
import { Divider } from 'antd'
import BigNumber from 'bignumber.js'
import { toFormatWithoutTrailingZero } from 'utils/fee'
import i18n from 'utils/i18n'
import { useContainer } from 'unstated-next'
import OrderContainer from 'containers/order'
import { COMMISSION_FEE, ORDER_CELL_CAPACITY } from 'constants/number'
import { List, Item } from './list'
import { MetaContainer, OrderResult } from './styled'
import { CrossMeta } from './CrossMeta'

const CrossChain = () => {
  const Order = useContainer(OrderContainer)
  const [buyer, seller] = Order.pair
  const tradeFee = useMemo(() => {
    return toFormatWithoutTrailingZero(new BigNumber(Order.pay).times(COMMISSION_FEE).toString())
  }, [Order.pay])

  const actualPay = useMemo(() => {
    const pay = new BigNumber(Order.pay).minus(new BigNumber(tradeFee))
    return toFormatWithoutTrailingZero(pay.toString())
  }, [Order.pay, tradeFee])

  const pay = useMemo(() => {
    return toFormatWithoutTrailingZero(Order.pay)
  }, [Order.pay])

  const price = useMemo(() => {
    return toFormatWithoutTrailingZero(Order.price)
  }, [Order.price])

  const receive = useMemo(() => {
    return toFormatWithoutTrailingZero(Order.receive)
  }, [Order.receive])

  const totalPayDetail = useMemo(() => {
    const list: Item[] = [
      {
        desc: i18n.t(`trade.totalPay`),
        value: pay,
        unit: buyer,
      },
    ]

    return list
  }, [pay, buyer])

  const tradeDetails = useMemo(() => {
    const list: Item[] = [
      {
        desc: i18n.t('trade.result.trade'),
        value: actualPay,
        unit: buyer,
      },
      {
        desc: i18n.t('trade.result.crossFee'),
        value: i18n.t('trade.result.freeNow'),
        unit: 'free-now',
      },
      {
        desc: i18n.t('trade.result.tradeFee'),
        value: tradeFee,
        unit: buyer,
      },
    ]
    return list
  }, [tradeFee, buyer, actualPay])

  const priceDetail = useMemo(() => {
    const list: Item[] = [
      {
        desc: i18n.t(`trade.price`),
        value: price,
        unit: `CKB per ${buyer}`,
      },
    ]

    return list
  }, [price, buyer])

  const receiveDetail = useMemo(() => {
    const list: Item[] = [
      {
        desc: i18n.t(`trade.result.receive`),
        value: receive,
        unit: seller,
      },
      {
        desc: '',
        value: `+ ${ORDER_CELL_CAPACITY}`,
        unit: 'CKB',
      },
    ]

    return list
  }, [receive, seller])

  return (
    <OrderResult>
      <List list={totalPayDetail} />
      <List list={tradeDetails} isDeatil />
      <List list={priceDetail} />
      <Divider style={{ margin: '20px 0' }} />
      <List list={receiveDetail} />
      <CrossMeta />
      <MetaContainer>
        Placing this order may take 5-15 minutes. Need to wait for the confirmation of 15 blocks on the Ethereum to
        ensure the security.
      </MetaContainer>
    </OrderResult>
  )
}

export default CrossChain
