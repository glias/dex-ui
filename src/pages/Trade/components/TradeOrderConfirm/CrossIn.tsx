import React, { useMemo } from 'react'
import { Divider } from 'antd'
import BigNumber from 'bignumber.js'
import { toFormatWithoutTrailingZero } from 'utils/fee'
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
    return toFormatWithoutTrailingZero(new BigNumber(Order.pay).times(COMMISSION_FEE).toString())
  }, [Order.pay])

  const totalPay = useMemo(() => {
    const pay = new BigNumber(Order.pay).plus(new BigNumber(tradeFee))
    return toFormatWithoutTrailingZero(pay.toString())
  }, [Order.pay, tradeFee])

  // TODO: pay/receive/price as props
  const pay = useMemo(() => {
    return toFormatWithoutTrailingZero(Order.pay)
  }, [Order.pay])

  const receive = useMemo(() => {
    return toFormatWithoutTrailingZero(Order.pay)
  }, [Order.pay])

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
        desc: i18n.t('trade.result.crossChain'),
        value: toFormatWithoutTrailingZero(pay),
        unit: buyer,
      },
      {
        desc: i18n.t('trade.result.crossFee'),
        value: i18n.t('trade.result.freeNow'),
        unit: 'free-now',
      },
    ]
    return list
  }, [buyer, pay])

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
      <Divider style={{ margin: '20px 0' }} />
      <List list={receiveDetail} />
      <CrossMeta />
    </OrderResult>
  )
}

export default CrossChain
