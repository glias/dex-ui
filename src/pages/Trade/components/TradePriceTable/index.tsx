import OrderContainer from 'containers/order'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import i18n from 'utils/i18n'
import { Tooltip } from 'antd'
import { getOrders, Orders, getCurrentPrice } from 'APIs'
import { useContainer } from 'unstated-next'
import { SUDTWithoutPw, SUDT_LIST } from 'constants/sudt'
import { ERC20_LIST } from 'constants/erc20'
import BigNumber from 'bignumber.js'
import WalletContainer from 'containers/wallet'
import { PRICE_DECIMAL, CKB_DECIMAL, CKB_DECIMAL_INT, COMMISSION_FEE } from 'constants/number'
import { displayPayOrReceive, displayPrice, removeTrailingZero } from 'utils/fee'
import { AmountUnit, SUDT } from '@lay2/pw-core'
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

const parseFormatedPrice = (price: string) => {
  return removeTrailingZero(
    price
      .split('')
      .filter(word => word !== ',')
      .join(''),
  )
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
    setPrice?.(parseFormatedPrice(displayPrice(price, isBid)))
  }, [setPrice, price, isBid])

  let priceClassName = isBid ? 'bid' : 'ask'

  if (isEmpty) {
    priceClassName = ''
  }

  return (
    <Tr onClick={isEmpty ? undefined : onClick} cursor={isEmpty ? 'auto' : 'pointer'}>
      <Progress isBid={isBid} width={!progress ? undefined : `${progress}%`}>
        {!isBid ? payElement : receiveElement}
        {isBid ? payElement : receiveElement}
        <Td position="flex-end" fontWeight="bold">
          <Tooltip title={price}>
            <span className={priceClassName}>{displayPrice(price, isBid)}</span>
          </Tooltip>
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
          new BigNumber(order.price).times(new BigNumber(10).pow(decimal - AmountUnit.ckb)).toString(),
        )

        if (isBid) {
          const receive = new BigNumber(order.receive).div(base.pow(decimal))
          const ckbPay = receive.times(price)
          const totalPay = ckbPay.div(1 - COMMISSION_FEE)
          const pay = new BigNumber(totalPay).toFixed(4)
          const progress = new BigNumber(totalPay).dividedBy(maxCKB).times(100).toFixed(0)
          return (
            <List
              setPrice={setPrice}
              progress={progress}
              price={price}
              pay={displayPayOrReceive(pay, true)}
              receive={displayPayOrReceive(receive.toString(), false)}
              key={key}
              isBid={isBid}
            />
          )
        }
        const receive = new BigNumber(order.receive).div(CKB_DECIMAL)
        const pay = receive.div(price)
        const totalPay = pay.div(1 - COMMISSION_FEE).toString()
        const progress = receive.dividedBy(maxCKB).times(100).toFixed(0)
        return (
          <List
            setPrice={setPrice}
            progress={progress}
            price={price}
            pay={displayPayOrReceive(totalPay, true)}
            receive={displayPayOrReceive(receive.toString(), false)}
            key={key}
            isBid={isBid}
          />
        )
      })}
    </TableContainer>
  )
}

interface OrderBook {
  bidOrders: Orders
  askOrders: Orders
  currentPrice: string
}

const TradePriceTable = () => {
  const Order = useContainer(OrderContainer)
  const Wallet = useContainer(WalletContainer)
  const { connecting } = Wallet
  const { setPrice } = useContainer(OrderContainer)
  // const { address } = Wallet.ckbWallet
  const { pair } = Order

  const token = useMemo(() => {
    return pair.find(t => t !== 'CKB')!
  }, [pair])

  const sudtToken = useMemo(() => {
    if (token === 'ETH' || ERC20_LIST.some(e => e.tokenName === token)) {
      return `ck${token}`
    }
    return token
  }, [token])

  const sudt = useMemo(() => {
    const inst = SUDT_LIST.find(s => s.info?.symbol === sudtToken)!
    return new SUDTWithoutPw(inst.issuerLockHash, inst.info)
  }, [sudtToken])

  const [orderBook, setOrderBook] = useState<Record<string, OrderBook>>(Object.create(null))

  const currentOrderBook = useMemo(() => {
    return (
      orderBook?.[sudt?.issuerLockHash] ?? {
        bidOrders: [],
        askOrders: [],
        currentPrice: '--',
      }
    )
  }, [orderBook, sudt])

  const currentPrice = useMemo(() => {
    return currentOrderBook.currentPrice
  }, [currentOrderBook])

  useEffect(() => {
    const INTERVAL_TIME = 20000

    async function getPriceTable() {
      const { data: orders } = await getOrders(sudt)
      let price = i18n.t('trade.priceTable.empty')
      try {
        const { data } = await getCurrentPrice(sudt)
        const p = new BigNumber(data).times(new BigNumber(10).pow(sudt?.info?.decimals! - CKB_DECIMAL_INT)).toString()
        price = p === 'NaN' ? i18n.t('trade.priceTable.empty') : displayPrice(p)
      } catch (error) {
        //
      }
      setOrderBook(old => {
        return {
          ...old,
          [sudt?.issuerLockHash]: {
            askOrders: orders.ask_orders,
            bidOrders: orders.bid_orders,
            currentPrice: price,
          },
        }
      })
    }

    const interval = setInterval(() => {
      getPriceTable()
    }, INTERVAL_TIME)

    getPriceTable()

    return () => {
      clearInterval(interval)
    }
  }, [sudt, connecting])

  const hasCurrentPrice = useMemo(() => {
    return currentPrice !== i18n.t('trade.priceTable.empty')
  }, [currentPrice])

  const bestPriceOnClick = useCallback(() => {
    if (hasCurrentPrice) {
      setPrice(parseFormatedPrice(currentPrice))
    }
  }, [hasCurrentPrice, currentPrice, setPrice])

  const maxCKB = useMemo(() => {
    let max = new BigNumber(0)
    // const base = new BigNumber(10)
    // const decimal = sudt?.info?.decimals ?? CKB_DECIMAL_INT
    for (let i = 0; i < currentOrderBook.askOrders.length; i++) {
      const order = currentOrderBook.askOrders[i]
      const ckbAmount = new BigNumber(order.receive)
      if (ckbAmount.isGreaterThan(max)) {
        max = ckbAmount
      }
    }

    for (let i = 0; i < currentOrderBook.bidOrders.length; i++) {
      const order = currentOrderBook.bidOrders[i]
      const pay = new BigNumber(order.receive).times(new BigNumber(order.price))
      if (pay.isGreaterThan(max)) {
        max = pay
      }
    }

    return max.div(CKB_DECIMAL).toString()
  }, [currentOrderBook.askOrders, currentOrderBook.bidOrders])

  return (
    <Container>
      <Header>{i18n.t('trade.priceTable.title', { token })}</Header>
      <AskTable>
        <TableHead
          price={i18n.t('trade.priceTable.price', { token })}
          pay={i18n.t('trade.priceTable.pay', { token })}
          receive={i18n.t('trade.priceTable.receive', { token: 'CKB' })}
          isBid={false}
        />
        <TableBody isBid={false} orders={currentOrderBook.askOrders} sudt={sudt} maxCKB={maxCKB} />
      </AskTable>
      <BestPrice onClick={bestPriceOnClick} cursor={hasCurrentPrice ? 'pointer' : 'auto'}>
        <div className="price">{currentPrice}</div>
      </BestPrice>
      <BidTable>
        <TableBody isBid orders={currentOrderBook.bidOrders} sudt={sudt} maxCKB={maxCKB} />
        <TableHead
          price={i18n.t('trade.priceTable.price', { token })}
          pay={i18n.t('trade.priceTable.pay', { token: 'CKB' })}
          receive={i18n.t('trade.priceTable.receive', { token })}
          isBid
        />
      </BidTable>
    </Container>
  )
}

export default TradePriceTable
