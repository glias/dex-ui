import React, { useRef, useMemo, useReducer } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { PageHeader, Table, Button, Spin, Tooltip } from 'antd'
import { SyncOutlined } from '@ant-design/icons'
import { useContainer } from 'unstated-next'
import PWCore from '@lay2/pw-core'
import WalletContainer from '../../../../containers/wallet'
import OrderContainer from '../../../../containers/order'
import type { SubmittedOrder } from '../../../../containers/order'
import { pendingOrders, HISTORY_QUERY_KEY, EXPLORER_URL } from '../../../../utils'
import type { OrderRecordAction, OrderRecord } from '../../../../utils'
import { reducer, usePollOrderList, useHandleWithdrawOrder } from './hooks'
import styles from './history.module.css'

type OrderInList = OrderRecord | SubmittedOrder
const SUDT_SYMBOL = 'DAI'

const routes = [
  {
    name: 'all',
    path: 'all',
  },
  {
    name: 'pending',
    path: 'pending',
  },
  {
    name: 'opening',
    path: 'opening',
  },
  {
    name: 'completed',
    path: 'completed',
  },
  {
    name: 'claimed',
    path: 'claimed',
  },
  {
    name: 'aborted',
    path: 'aborted',
  },
]

const columns = [
  {
    title: 'pay',
    dataIndex: 'pay',
    key: 'pay',
    ellipsis: {
      showTitle: false,
    },
    render: (amount: string, order: OrderInList) => {
      const text = `${amount} ${order.isBid ? 'CKB' : SUDT_SYMBOL}`
      return <Tooltip title={text}>{text}</Tooltip>
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
      const text = `${amount} ${order.isBid ? SUDT_SYMBOL : 'CKB'}`
      return <Tooltip title={text}>{text}</Tooltip>
    },
  },
  {
    title: 'price',
    dataIndex: 'price',
    key: 'price',
    ellipsis: {
      showTitle: false,
    },
    render: (price: string) => {
      const text = `${price} CKB/${SUDT_SYMBOL}`
      return <Tooltip title={text}>{text}</Tooltip>
    },
  },
  {
    title: 'status',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: OrderInList['status'], order: OrderInList) => {
      const [txHash, index] = order.key.split(':')

      return (
        <a
          className={styles.status}
          data-status={status}
          href={`${EXPLORER_URL}transaction/${txHash}#${+index}`}
          target="_blank"
          rel="noreferrer noopener"
        >
          {status}
        </a>
      )
    },
  },
  {
    title: 'executed',
    dataIndex: 'executed',
    key: 'executed',
    width: 90,
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

  const lockHash = useMemo(() => (address ? PWCore.provider?.address?.toLockScript().toHash() : ''), [address])

  usePollOrderList({ lockArgs: lockHash, fetchListRef, dispatch })

  const actionColumn = {
    title: 'action',
    dataIndex: 'action',
    key: 'action',
    width: 100,
    render: (action: OrderRecordAction | undefined, order: OrderInList) => {
      const handleClick = () => {
        handleWithdraw(order.key)
      }
      if (state.pendingIdList.includes(order.key)) {
        return <Spin indicator={<SyncOutlined spin translate="loadaing" />} />
      }
      switch (action) {
        case 'claim': {
          return <Button onClick={handleClick}>Claim</Button>
        }
        case 'opening': {
          return <Button onClick={handleClick}>Cancel</Button>
        }
        default: {
          return ''
        }
      }
    },
  }

  const orderList: Array<OrderInList> = [
    ...submittedOrderList,
    ...state.orderList.filter(order => !submittedOrderList.some(submitted => submitted.key === order.key)),
  ].filter(order => orderFilter(type, order))

  return (
    <div className={styles.container}>
      <PageHeader
        className={styles.header}
        title="My Orders"
        extra={routes.map(route => (
          <Link
            key={route.name}
            to={`?${HISTORY_QUERY_KEY.type}=${route.path}`}
            className={styles.navItem}
            data-is-active={type === route.name}
          >
            {route.name}
          </Link>
        ))}
      />
      <Table
        loading={state.isLoading}
        className={styles.orders}
        columns={[...columns, actionColumn]}
        dataSource={orderList}
      />
    </div>
  )
}
export default History
