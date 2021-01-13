import React, { useMemo } from 'react'
import { Divider } from 'antd'
import { toFormatWithoutTrailingZero } from 'utils/fee'
import i18n from 'utils/i18n'
import { useContainer } from 'unstated-next'
import OrderContainer from 'containers/order'
import { ORDER_CELL_CAPACITY } from 'constants/number'
import { List, Item } from './list'
import { OrderResult } from './styled'
import { CrossMeta } from './CrossMeta'

const CrossIn = () => {
  const Order = useContainer(OrderContainer)
  const [buyer, seller] = Order.pair

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
        value: pay,
        unit: buyer,
      },
    ]

    return list
  }, [pay, buyer])

  const tradeDetails = useMemo(() => {
    const list: Item[] = [
      {
        desc: i18n.t('trade.result.crossChain'),
        value: pay,
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

export default CrossIn
