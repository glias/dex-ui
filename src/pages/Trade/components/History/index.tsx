/* eslint-disable react/jsx-no-bind */
import React, { useRef, useMemo, useReducer, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import { TradeFrame } from 'pages/Trade/styled'
import { PageHeader, Table, Button, Spin, Tooltip, Modal, Divider, Progress, Input } from 'antd'
import { SyncOutlined, SearchOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { useContainer } from 'unstated-next'
import { displayPayOrReceive, displayPrice } from 'utils/fee'
import PWCore from '@lay2/pw-core'
import styled from 'styled-components'
import WalletContainer from '../../../../containers/wallet'
import OrderContainer from '../../../../containers/order'
import type { SubmittedOrder } from '../../../../containers/order'
import { getTimeString, pendingOrders } from '../../../../utils'
import { COMMISSION_FEE, ERC20_LIST, ETHER_SCAN_URL, EXPLORER_URL, HISTORY_QUERY_KEY } from '../../../../constants'
import type { OrderRecord } from '../../../../utils'
import { ReactComponent as InfoSvg } from '../../../../assets/svg/info.svg'
import {
  reducer,
  usePollOrderList,
  useHandleWithdrawOrder,
  ActionType,
  usePollingOrderStatus,
  HistoryAction,
} from './hooks'
import styles from './history.module.css'

export type OrderInList = OrderRecord | SubmittedOrder

const ModalContainer = styled(Modal)`
  .ant-modal-content {
    border-radius: 16px !important;
  }

  .ant-modal-header {
    border-radius: 16px !important;
    border-bottom: none;
  }

  .ant-modal-title {
    font-weight: bold !important;
  }
`

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
      const bid = ['CKB', order.tokenName].join(' ➜ ')
      const ask = [order.tokenName, 'CKB'].join(' ➜ ')
      return <span style={{ textTransform: 'none' }}>{order.isBid ? bid : ask}</span>
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
          {displayPrice(price)}
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
          {displayPayOrReceive(amount)}
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
          {displayPayOrReceive(amount)}
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
        <Progress
          trailColor="#C4C4C4"
          type="circle"
          className={styles.bold}
          width={28}
          percent={parseInt(executed, 10)}
          format={e => e}
        />
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
        const price = order.isBid
          ? new BigNumber(paidAmount).div(1 + COMMISSION_FEE).div(tradedAmount)
          : new BigNumber(tradedAmount).div(new BigNumber(paidAmount).div(1 + COMMISSION_FEE))
        result = displayPayOrReceive(price.toString())
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

const getOrderCellType = (index: number, isLast: boolean, isCrossChain: boolean, status: OrderInList['status']) => {
  if (index === 0) {
    return isCrossChain ? 'Cross Chain' : 'Place Order'
  }
  if (isCrossChain && index === 1) {
    return 'Place Order'
  }
  if (isLast) {
    switch (status) {
      case 'aborted':
        return 'Cancel Order'
      case 'claimed':
        return 'Claim Order'
      default:
        return 'Match Order'
    }
  }
  return 'Match Order'
}

const OrderModal = ({
  currentOrder,
  modalVisable,
  setModalVisable,
  dispatch,
}: {
  modalVisable: boolean
  currentOrder: OrderInList
  setModalVisable: Function
  dispatch: React.Dispatch<HistoryAction>
}) => {
  const { web3, ckbWallet } = useContainer(WalletContainer)
  const [lastOutpointTxHash, lastOutpointIndex] = currentOrder.key.split(':')

  // @ts-ignore
  const { status, orderCells, executed, pending } = currentOrder
  const isCrossChain = ['ETH', ...ERC20_LIST].includes(currentOrder.tokenName)

  const cells = useMemo(() => {
    if (status === 'aborted' && !pending) {
      return orderCells?.concat({ tx_hash: lastOutpointTxHash, index: lastOutpointIndex }) ?? []
    }
    return orderCells || []
  }, [status, orderCells, lastOutpointTxHash, lastOutpointIndex, pending])

  const fetchListRef = useRef<ReturnType<typeof setInterval> | undefined>()

  usePollingOrderStatus({
    web3,
    dispatch,
    cells,
    isCrossChain,
    ckbAddress: ckbWallet.address,
    status,
    fetchListRef,
    pending,
    key: currentOrder.key,
  })

  const realStatus = useMemo(() => {
    if (status === 'pending') {
      const isAllLoaded = orderCells?.every(cell => cell.isLoaded)
      if (isAllLoaded) {
        return 'opening'
      }
      return 'pending'
    }
    return status
  }, [status, orderCells])

  return (
    <ModalContainer
      className={styles.modal}
      wrapClassName={styles.modal}
      visible={modalVisable}
      title="Order Info"
      footer={null}
      onCancel={() => setModalVisable(false)}
    >
      <div className={styles.modalBody}>
        <Progress percent={parseInt(executed, 10)} type="circle" trailColor="#C4C4C4" />
        <h3>{realStatus}</h3>
      </div>
      <div className={styles.records}>
        {cells?.map((cell, index) => {
          const isLast = index === cells.length - 1
          const txHashLength = cell.tx_hash.length
          const txHash = `${cell.tx_hash.slice(0, 30)}...${cell.tx_hash.slice(txHashLength - 4, txHashLength)}`
          const url =
            isCrossChain && index === 0
              ? `${ETHER_SCAN_URL}tx/${cell.tx_hash}`
              : `${EXPLORER_URL}transaction/${cell.tx_hash}`
          const isLoading = (status === 'pending' || (pending && isLast)) && !cell.isLoaded
          return (
            <div key={cell.tx_hash} className={styles.record}>
              <span className={styles.type}>
                {getOrderCellType(index, isLast, isCrossChain, status)}
                {isLoading ? (
                  <LoadingOutlined translate="loading" className={styles.check} />
                ) : (
                  <CheckCircleOutlined translate="check" className={styles.check} />
                )}
              </span>
              <span className={styles.hash}>
                {txHash === '...' ? (
                  '-'
                ) : (
                  <a target="_blank" rel="noopener noreferrer" href={url}>
                    {txHash}
                  </a>
                )}
              </span>
            </div>
          )
        })}
      </div>
    </ModalContainer>
  )
}

const History = () => {
  const [state, dispatch] = useReducer(reducer, {
    orderList: [],
    pendingIdList: Object.keys(pendingOrders.get()),
    isLoading: false,
    currentOrder: null,
  })
  const fetchListRef = useRef<ReturnType<typeof setInterval> | undefined>()

  const location = useLocation()
  const [modalVisable, setModalVisable] = useState(false)
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

  usePollOrderList({ lockArgs: lockHash, fetchListRef, dispatch, ckbAddress: address })

  const statusOnClick = useCallback((order: OrderInList) => {
    setModalVisable(true)
    dispatch({
      type: ActionType.updateCurrentOrder,
      value: order,
    })
  }, [])

  const actionColumn = {
    title: 'action',
    dataIndex: 'action',
    key: 'action',
    width: 150,
    render: (_: unknown, order: OrderInList) => {
      const handleClick = () => {
        handleWithdraw(order.key).catch(error => {
          Modal.error({ title: 'Transaction Error', content: error.message })
        })
      }

      if (state.pendingIdList.includes(order.key)) {
        const handleCancelStatusClick = () => {
          const txHash = pendingOrders.getOne(`${order.key}-pending`)
          statusOnClick({
            ...order,
            status: 'aborted',
            pending: true,
            orderCells: order.orderCells?.concat({ tx_hash: txHash ?? '', index: '0x' }),
          } as any)
        }
        return (
          <div className={styles.center}>
            <div className={styles.spinContainer}>
              <Spin indicator={<SyncOutlined spin translate="loading" />} />
            </div>
            <Button onClick={handleCancelStatusClick} className={styles.status}>
              <InfoSvg />
            </Button>
          </div>
        )
      }

      const status = (
        <Button onClick={() => statusOnClick(order)} className={styles.status}>
          <InfoSvg />
        </Button>
      )

      switch (order.status) {
        case 'completed': {
          return (
            <div className={styles.center}>
              <Button onClick={handleClick} className={styles.action}>
                Claim
              </Button>
              {status}
            </div>
          )
        }
        case 'opening': {
          return (
            <div className={styles.center}>
              <Button onClick={handleClick} className={styles.action}>
                Cancel
              </Button>
              {status}
            </div>
          )
        }
        case 'pending': {
          return (
            <div className={styles.center}>
              <div className={styles.spinContainer}>
                <Spin indicator={<SyncOutlined spin translate="loading" />} />
              </div>
              {status}
            </div>
          )
        }
        default: {
          return <div className={styles.center}>{status}</div>
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
      {state.currentOrder ? (
        <OrderModal
          currentOrder={state.currentOrder}
          modalVisable={modalVisable}
          setModalVisable={setModalVisable}
          dispatch={dispatch}
        />
      ) : null}
    </TradeFrame>
  )
}
export default History
