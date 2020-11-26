import React, { useRef, useMemo, useReducer, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import { TradeFrame } from 'pages/Trade/styled'
import { PageHeader, Table, Button, Spin, Tooltip, Modal, Divider, Progress, Input } from 'antd'
import { SyncOutlined, SearchOutlined } from '@ant-design/icons'
import { useContainer } from 'unstated-next'
import { removeTrailingZero } from 'utils/fee'
import PWCore from '@lay2/pw-core'
import WalletContainer from '../../../../containers/wallet'
import OrderContainer from '../../../../containers/order'
import type { SubmittedOrder } from '../../../../containers/order'
import { getTimeString, pendingOrders } from '../../../../utils'
import { HISTORY_QUERY_KEY, SUDT_GLIA } from '../../../../constants'
import type { OrderRecord } from '../../../../utils'
import { reducer, usePollOrderList, useHandleWithdrawOrder } from './hooks'
import styles from './history.module.css'

type OrderInList = OrderRecord | SubmittedOrder

const columns = [
  {
    title: 'Time',
    dataIndex: 'createdAt',
    key: 'createdAt',
    ellipsis: {
      showTitle: false,
    },
    render: (timestamp: string) => {
      const date = new Date(Number(timestamp))
      return (
        <div>
          {date.toLocaleDateString()}
          <div>{getTimeString(timestamp)}</div>
        </div>
      )
    },
  },
  {
    title: 'pair',
    dataIndex: 'price',
    key: 'price',
    ellipsis: {
      showTitle: false,
    },
    render: (_: any, order: OrderInList) => {
      const bid = ['CKB', order.tokenName].join(' -> ')
      const ask = [order.tokenName, 'CKB'].join(' -> ')
      return <span>{order.isBid ? bid : ask}</span>
    },
  },
  {
    title: 'price',
    dataIndex: 'price',
    key: 'price',
    ellipsis: {
      showTitle: false,
    },
    render: (price: string, order: OrderInList) => {
      const unit = `CKB per ${order.tokenName}`
      return (
        <Tooltip title={price}>
          {price}
          <div className={styles.unit}>{unit}</div>
        </Tooltip>
      )
    },
  },
  {
    title: 'pay',
    dataIndex: 'pay',
    key: 'pay',
    ellipsis: {
      showTitle: false,
    },
    render: (amount: string, order: OrderInList) => {
      const unit = `${!order.isBid ? order.tokenName : 'CKB'}`
      return (
        <Tooltip title={amount}>
          {removeTrailingZero(amount)}
          <div className={styles.unit}>{unit}</div>
        </Tooltip>
      )
    },
  },
  {
    title: 'receive',
    dataIndex: 'receive',
    key: 'receive',
    ellipsis: {
      showTitle: false,
    },
    render: (amount: string, order: OrderInList) => {
      const unit = `${order.isBid ? order.tokenName : 'CKB'}`
      return (
        <Tooltip title={amount}>
          {amount}
          <div className={styles.unit}>{unit}</div>
        </Tooltip>
      )
    },
  },
  {
    title: 'Filled(%)',
    dataIndex: 'executed',
    key: 'price',
    render: (executed: string) => {
      return (
        <Progress type="circle" className={styles.bold} width={28} percent={parseInt(executed, 10)} format={e => e} />
      )
    },
  },
  {
    title: 'Filled Price',
    dataIndex: 'filledPrice',
    key: 'filledPrice',
    render: (_: string, order: OrderInList) => {
      // @ts-ignore
      const { paidAmount, tradedAmount } = order
      const unit = `CKB per ${order.tokenName}`
      let result = '-'
      if (paidAmount && paidAmount !== '0' && tradedAmount && tradedAmount !== '0') {
        result = removeTrailingZero(new BigNumber(paidAmount).div(tradedAmount).toFixed(10, 1))
      }
      return (
        <Tooltip title={result}>
          {result}
          {result === '-' ? null : <div className={styles.unit}>{unit}</div>}
        </Tooltip>
      )
    },
  },
]

const orderFilter = (type: string, order: OrderInList) => {
  switch (type) {
    case 'pending':
    case 'opening':
    case 'aborted':
    case 'completed':
    case 'claimed': {
      return order.status === type
    }
    default: {
      return true
    }
  }
}

const History = () => {
  const [state, dispatch] = useReducer(reducer, {
    orderList: [],
    pendingIdList: Object.keys(pendingOrders.get()),
    isLoading: false,
  })
  const fetchListRef = useRef<ReturnType<typeof setInterval> | undefined>()

  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const type = query.get(HISTORY_QUERY_KEY.type) || 'all'
  const wallet = useContainer(WalletContainer)
  const { submittedOrders: submittedOrderList } = useContainer(OrderContainer)

  const { address } = wallet.ckbWallet
  const handleWithdraw = useHandleWithdrawOrder(address, dispatch)

  const [searchValue, setSearchValue] = useState('')

  const searchFilter = useCallback(
    (order: OrderInList) => {
      if (searchValue) {
        return order.tokenName.toLowerCase().includes(searchValue.toLowerCase())
      }
      return Boolean
    },
    [searchValue],
  )

  const lockHash = useMemo(() => (address ? PWCore.provider?.address?.toLockScript().toHash() : ''), [address])

  usePollOrderList({ lockArgs: lockHash, fetchListRef, dispatch, sudt: SUDT_GLIA })

  const actionColumn = {
    title: 'action',
    dataIndex: 'action',
    key: 'action',
    width: 120,
    render: (_: unknown, order: OrderInList) => {
      const handleClick = () => {
        handleWithdraw(order.key).catch(error => {
          Modal.error({ title: 'Transaction Error', content: error.message })
        })
      }
      if (state.pendingIdList.includes(order.key)) {
        return <Spin indicator={<SyncOutlined spin translate="loadaing" />} />
      }
      switch (order.status) {
        case 'completed': {
          return (
            <Button onClick={handleClick} className={styles.action}>
              Claim
            </Button>
          )
        }
        case 'opening': {
          return (
            <Button onClick={handleClick} className={styles.action}>
              Cancel
            </Button>
          )
        }
        default: {
          return ''
        }
      }
    },
  }

  const orderList: Array<OrderInList> = [
    ...submittedOrderList.map(o => ({ ...o, key: `${o.key}:${o.createdAt}` })),
    ...state.orderList.filter(order => !submittedOrderList.some(submitted => submitted.key === order.key)),
  ].filter(order => orderFilter(type, order))

  const [showOpenOrder, setShowOpenOrder] = useState(true)

  const orders = useMemo(() => {
    if (showOpenOrder) {
      return orderList.filter(searchFilter).filter(o => o.status !== 'aborted' && o.status !== 'claimed')
    }
    return orderList.filter(searchFilter).filter(o => o.status === 'aborted' || o.status === 'claimed')
  }, [orderList, showOpenOrder, searchFilter])

  const header = (
    <div className={styles.switcher}>
      <button type="button" className={showOpenOrder ? styles.active : ''} onClick={() => setShowOpenOrder(true)}>
        My Open Orders
      </button>
      <Divider type="vertical" className={styles.divider} />
      <button type="button" className={!showOpenOrder ? styles.active : ''} onClick={() => setShowOpenOrder(false)}>
        Order History
      </button>
    </div>
  )

  const input = (
    <Input
      prefix={<SearchOutlined translate="" />}
      placeholder="Search Token"
      onChange={e => setSearchValue(e.target.value)}
      value={searchValue}
      className={styles.input}
    />
  )

  return (
    <TradeFrame width="100%" height="auto">
      <PageHeader className={styles.header} title={header} extra={input} />
      <Table
        loading={state.isLoading}
        className={styles.orders}
        columns={[...columns, actionColumn]}
        dataSource={orders}
        rowClassName={(_, index) => (index % 2 === 0 ? `${styles.even} ${styles.td}` : `${styles.td}`)}
        onHeaderRow={() => ({ className: styles.thead })}
      />
    </TradeFrame>
  )
}
export default History
