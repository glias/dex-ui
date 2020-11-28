import OrderContainer from 'containers/order'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import i18n from 'utils/i18n'
import { getOrders, Orders } from 'APIs'
import { useContainer } from 'unstated-next'
import { ERC20_LIST, SUDT_LIST } from 'constants/sudt'
import BigNumber from 'bignumber.js'
import WalletContainer from 'containers/wallet'
import { PRICE_DECIMAL, CKB_DECIMAL } from 'constants/number'
import { calcBidReceive, removeTrailingZero, calcAskReceive } from 'utils/fee'
import PWCore, { SUDT } from '@lay2/pw-core'
import { Header, Container, AskTable, THead, Td, Tr, BestPrice, BidTable, TableContainer, Progress } from './styled'

interface ListProps {
  price: string
  pay: string
  receive: string
  isBid: boolean
  progress?: string
  // eslint-disable-next-line
  setPrice?: (price: string) => void
}

const TableHead = ({ price, pay, receive, isBid }: Omit<ListProps, 'progress' & 'setPrice'>) => {
  const payElement = (
    <Td position={isBid ? 'center' : 'flex-end'}>
      <span>{pay}</span>
    </Td>
  )
  const receiveElement = (
    <Td position={!isBid ? 'center' : 'flex-end'}>
      <span>{receive}</span>
    </Td>
  )
  return (
    <THead>
      <Td position="left">
        <span>{price}</span>
      </Td>
      {isBid ? payElement : receiveElement}
      {!isBid ? payElement : receiveElement}
    </THead>
  )
}

const List = ({ price, pay, receive, isBid, progress, setPrice }: ListProps) => {
  const payElement = (
    <Td position={!isBid ? 'center' : 'left'} fontWeight="normal" color="#606060">
      <span>{pay}</span>
    </Td>
  )
  const receiveElement = (
    <Td position={isBid ? 'center' : 'left'} color="#606060" fontWeight="normal">
      <span>{receive}</span>
    </Td>
  )

  const isEmpty = useMemo(() => {
    return price === '--'
  }, [price])

  const onClick = useCallback(() => {
    // eslint-disable-next-line no-unused-expressions
    setPrice?.(price)
  }, [setPrice, price])

  return (
    <Tr onClick={isEmpty ? undefined : onClick} cursor={isEmpty ? 'auto' : 'pointer'}>
      <Progress isBid={isBid} width={!progress ? undefined : `${progress}%`}>
        {isBid ? payElement : receiveElement}
        {!isBid ? payElement : receiveElement}
        <Td position="flex-end" fontWeight="bold">
          <span>{price}</span>
        </Td>
      </Progress>
    </Tr>
  )
}

const TableBody = ({ orders, sudt, isBid }: { orders: Orders; sudt: SUDT; isBid: boolean }) => {
  const { setPrice } = useContainer(OrderContainer)
  const decimal = sudt.info?.decimals ?? 8
  const base = new BigNumber(10)
  const renderedOrders: Array<Orders | { empty: boolean }> = []
  let maxPrice = new BigNumber(0)
  for (let i = 0; i < 5; i++) {
    const order = orders[i]
    if (order) {
      const price = new BigNumber(order.price).div(PRICE_DECIMAL)
      if (maxPrice.isLessThan(price)) {
        maxPrice = price
      }
      renderedOrders.push({
        ...order,
        empty: false,
      })
    } else {
      renderedOrders.push({ empty: true })
    }
  }

  return (
    <TableContainer isBid={isBid}>
      {renderedOrders.map((order: any, index) => {
        const key = index
        if (order.empty) {
          const empty = '--'
          return <List price={empty} pay={empty} receive={empty} key={key} isBid={isBid} />
        }
        const price = removeTrailingZero(new BigNumber(order.price).div(PRICE_DECIMAL).toString())
        const ckbPay = new BigNumber(order.order_amount).div(CKB_DECIMAL).toString()
        const sudtPay = new BigNumber(order.sudt_amount).div(base.pow(decimal)).toString()
        const pay = removeTrailingZero(isBid ? ckbPay : sudtPay)
        const progress = new BigNumber(order.price).dividedBy(maxPrice).div(PRICE_DECIMAL).times(100).toFixed(0)
        const receive = removeTrailingZero(isBid ? calcBidReceive(pay, price) : calcAskReceive(pay, price))
        return (
          <List
            setPrice={setPrice}
            progress={progress}
            price={price}
            pay={pay}
            receive={receive}
            key={key}
            isBid={isBid}
          />
        )
      })}
    </TableContainer>
  )
}

const TradePriceTable = () => {
  const Order = useContainer(OrderContainer)
  const Wallet = useContainer(WalletContainer)
  const { address } = Wallet.ckbWallet
  const { pair } = Order
  const [orders, setOrders] = useState<{ bidOrders: Orders; askOrders: Orders }>({
    bidOrders: [],
    askOrders: [],
  })
  const sudtToken = useMemo(() => {
    const token = pair.find(t => t !== 'CKB')!
    if (token === 'ETH' || ERC20_LIST.includes(token)) {
      return `ck${token}`
    }
    return token
  }, [pair])

  const sudt = useMemo(() => {
    return SUDT_LIST.find(s => s.info?.symbol === sudtToken)!
  }, [sudtToken])

  const lockHash = useMemo(() => (address ? PWCore.provider?.address?.toLockScript().toHash() : ''), [address])

  useEffect(() => {
    if (!lockHash) {
      return
    }
    getOrders(sudt).then(res => {
      const { data } = res
      setOrders({
        askOrders: data.ask_orders,
        bidOrders: data.bid_orders,
      })
    })
  }, [sudt, lockHash])

  return (
    <Container>
      <Header>{i18n.t('trade.priceTable.title', { token: sudtToken })}</Header>
      <AskTable>
        <TableHead
          price={i18n.t('trade.priceTable.price', { token: sudtToken })}
          pay={i18n.t('trade.priceTable.pay', { token: sudtToken })}
          receive={i18n.t('trade.priceTable.receive', { token: 'CKB' })}
          isBid={false}
        />
        <TableBody isBid={false} orders={orders.askOrders} sudt={sudt} />
      </AskTable>
      <BestPrice>
        <div className="price">0.00</div>
      </BestPrice>
      <BidTable>
        <TableBody isBid orders={orders.bidOrders} sudt={sudt} />
        <TableHead
          price={i18n.t('trade.priceTable.price', { token: sudtToken })}
          pay={i18n.t('trade.priceTable.pay', { token: 'CKB' })}
          receive={i18n.t('trade.priceTable.receive', { token: sudtToken })}
          isBid
        />
      </BidTable>
    </Container>
  )
}

export default TradePriceTable
