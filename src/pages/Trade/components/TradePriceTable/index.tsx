import OrderContainer from 'containers/order'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import i18n from 'utils/i18n'
import { getOrders, Orders, getCurrentPrice } from 'APIs'
import { useContainer } from 'unstated-next'
import { ERC20_LIST, SUDT_LIST } from 'constants/sudt'
import BigNumber from 'bignumber.js'
import WalletContainer from 'containers/wallet'
import { PRICE_DECIMAL, CKB_DECIMAL, CKB_DECIMAL_INT } from 'constants/number'
import { calcTotalPay, displayPayOrReceive, displayPrice, removeTrailingZero } from 'utils/fee'
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
    <Td position={isBid ? 'center' : 'left'} fontWeight="normal" color="#606060">
      <span>{pay}</span>
    </Td>
  )
  const receiveElement = (
    <Td position={!isBid ? 'center' : 'left'} color="#606060" fontWeight="normal">
      <span>{receive}</span>
    </Td>
  )

  const isEmpty = useMemo(() => {
    return price === '--'
  }, [price])

  const onClick = useCallback(() => {
    // eslint-disable-next-line no-unused-expressions
    setPrice?.(
      removeTrailingZero(
        price
          .split('')
          .filter(word => word !== ',')
          .join(''),
      ),
    )
  }, [setPrice, price])

  return (
    <Tr onClick={isEmpty ? undefined : onClick} cursor={isEmpty ? 'auto' : 'pointer'}>
      <Progress isBid={isBid} width={!progress ? undefined : `${progress}%`}>
        {!isBid ? payElement : receiveElement}
        {isBid ? payElement : receiveElement}
        <Td position="flex-end" fontWeight="bold">
          <span>{price}</span>
        </Td>
      </Progress>
    </Tr>
  )
}

const TableBody = ({ orders, sudt, isBid, maxCKB }: { orders: Orders; sudt: SUDT; isBid: boolean; maxCKB: string }) => {
  const { setPrice } = useContainer(OrderContainer)
  const decimal = sudt.info?.decimals ?? CKB_DECIMAL_INT
  const base = new BigNumber(10)
  const renderedOrders: Array<Orders | { empty: boolean }> = []
  let maxPrice = new BigNumber(0)
  for (let i = 0; i < 7; i++) {
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
      // eslint-disable-next-line no-lonely-if
      if (!isBid) {
        renderedOrders.unshift({ empty: true })
      } else {
        renderedOrders.push({ empty: true })
      }
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
        const price = removeTrailingZero(
          new BigNumber(order.price)
            .div(PRICE_DECIMAL)
            .times(new BigNumber(10).pow(decimal - CKB_DECIMAL_INT))
            .toString(),
        )

        if (isBid) {
          const receive = new BigNumber(order.receive).div(base.pow(decimal))
          const ckbPay = receive.times(price)
          const totalPay = calcTotalPay(ckbPay.toString())
          const pay = new BigNumber(totalPay).toFixed(4)
          const progress = new BigNumber(totalPay).dividedBy(maxCKB).times(100).toFixed(0)
          return (
            <List
              setPrice={setPrice}
              progress={progress}
              price={displayPrice(price)}
              pay={displayPayOrReceive(pay)}
              receive={displayPayOrReceive(receive.toString())}
              key={key}
              isBid={isBid}
            />
          )
        }
        const receive = new BigNumber(order.receive).div(CKB_DECIMAL)
        const pay = receive.div(price)
        const totalPay = calcTotalPay(pay.toString())
        const progress = receive.dividedBy(maxCKB).times(100).toFixed(0)
        return (
          <List
            setPrice={setPrice}
            progress={progress}
            price={displayPrice(price)}
            pay={displayPayOrReceive(totalPay)}
            receive={displayPayOrReceive(receive.toString())}
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
  const { setPrice } = useContainer(OrderContainer)
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

  const [currentPrice, setCurrentPrice] = useState('--')

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
    getCurrentPrice(sudt)
      .then(res => {
        const { data } = res
        const price = new BigNumber(data)
          .div(PRICE_DECIMAL)
          .times(new BigNumber(10).pow(sudt?.info?.decimals! - CKB_DECIMAL_INT))
          .toString()
        setCurrentPrice(price === 'NaN' ? i18n.t('trade.priceTable.empty') : removeTrailingZero(price))
      })
      .catch(() => {
        setCurrentPrice(i18n.t('trade.priceTable.empty'))
      })
  }, [sudt, lockHash])

  const hasCurrentPrice = useMemo(() => {
    return currentPrice !== i18n.t('trade.priceTable.empty')
  }, [currentPrice])

  const bestPriceOnClick = useCallback(() => {
    if (hasCurrentPrice) {
      setPrice(currentPrice)
    }
  }, [hasCurrentPrice, currentPrice, setPrice])

  const maxCKB = useMemo(() => {
    let max = new BigNumber(0)
    const base = new BigNumber(10)
    const decimal = sudt?.info?.decimals ?? CKB_DECIMAL_INT
    for (let i = 0; i < orders.askOrders.length; i++) {
      const order = orders.askOrders[i]
      const ckbAmount = new BigNumber(order.receive)
      if (ckbAmount.isGreaterThan(max)) {
        max = ckbAmount
      }
    }

    for (let i = 0; i < orders.bidOrders.length; i++) {
      const order = orders.bidOrders[i]
      const price = removeTrailingZero(
        new BigNumber(order.price)
          .div(PRICE_DECIMAL)
          .times(new BigNumber(10).pow(decimal - CKB_DECIMAL_INT))
          .toString(),
      )

      const receive = new BigNumber(order.receive).div(base.pow(decimal))
      const ckbPay = receive.times(price)
      const totalPay = calcTotalPay(ckbPay.toString())
      const pay = new BigNumber(totalPay).times(CKB_DECIMAL)
      // eslint-disable-next-line no-console
      // console.log(pay.toString(), max.toString())

      if (pay.isGreaterThan(max)) {
        max = pay
      }
    }

    // eslint-disable-next-line no-console
    console.log(max.toString())

    return max.div(CKB_DECIMAL).toString()
  }, [orders.askOrders, orders.bidOrders, sudt])

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
        <TableBody isBid={false} orders={orders.askOrders} sudt={sudt} maxCKB={maxCKB} />
      </AskTable>
      <BestPrice onClick={bestPriceOnClick} cursor={hasCurrentPrice ? 'pointer' : 'auto'}>
        <div className="price">{currentPrice}</div>
      </BestPrice>
      <BidTable>
        <TableBody isBid orders={orders.bidOrders} sudt={sudt} maxCKB={maxCKB} />
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
