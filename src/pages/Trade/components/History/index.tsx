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
import { ErrorCode } from 'exceptions'
import { Meta } from 'components/SelectToken'
import WalletContainer from '../../../../containers/wallet'
import OrderContainer, { ShowStatus } from '../../../../containers/order'
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
import CrossChainHistory from './CrossChain'
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

  .ant-modal-body {
    i {
      margin-left: 4px;
    }

    svg {
      margin-right: 4px;
    }
  }

  .meta {
    .image {
      color: #1890ff;
      svg {
        width: 22px;
        height: 22px;
        margin-right: 0pc;
      }
    }
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
          {displayPrice(price, order.isBid)}
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
          {displayPayOrReceive(amount, true)}
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
          {displayPayOrReceive(amount, false)}
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
      const percent = parseInt(executed, 10)
      return (
        <Progress
          trailColor="#C4C4C4"
          type="circle"
          className={styles.bold}
          width={28}
          percent={percent}
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
          ? new BigNumber(paidAmount).times(1 - COMMISSION_FEE).div(tradedAmount)
          : new BigNumber(tradedAmount).div(new BigNumber(paidAmount).times(1 - COMMISSION_FEE))
        result = displayPrice(price.toString())
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

const getOrderCellType = (
  index: number,
  isLast: boolean,
  isCrossChain: boolean,
  status: OrderInList['status'],
  tokenName: string,
) => {
  if (index === 0) {
    return isCrossChain ? `Lock ${tokenName}` : 'Place Order'
  }
  if (isCrossChain && index === 1) {
    return 'Cross chain to place order'
  }
  if (isLast) {
    switch (status) {
      case 'aborted':
        return 'Cancel Order'
      case 'claimed':
        return 'Complete Order'
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
  const { web3, ckbWallet, ethWallet } = useContainer(WalletContainer)
  const [lastOutpointTxHash, lastOutpointIndex] = currentOrder.key.split(':')

  // @ts-ignore
  const { status, orderCells, executed, pending } = currentOrder
  const isCrossChain = ERC20_LIST.some(e => e.tokenName === currentOrder.tokenName) || currentOrder.tokenName === 'ETH'

  const cells = useMemo(() => {
    if ((status === 'aborted' || status === 'claimed') && !pending) {
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
    ethAddress: ethWallet.address,
    modalVisable,
  })

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
        <h3>Filled</h3>
      </div>
      <div className={styles.records}>
        {cells?.map((cell, index) => {
          const isLast = index === cells.length - 1
          const txHashLength = cell.tx_hash.length
          const txHash = `${cell.tx_hash.slice(0, 20)}...${cell.tx_hash.slice(txHashLength - 4, txHashLength)}`
          const url =
            isCrossChain && index === 0
              ? `${ETHER_SCAN_URL}tx/${cell.tx_hash}`
              : `${EXPLORER_URL}transaction/${cell.tx_hash}`
          const isLoading = (status === 'pending' || (pending && isLast)) && !cell.isLoaded
          const type = getOrderCellType(index, isLast, isCrossChain, status, currentOrder.tokenName)
          return (
            <div key={cell.tx_hash} className={styles.record}>
              <span className={styles.type}>
                {isLoading ? (
                  <LoadingOutlined translate="loading" className={styles.check} />
                ) : (
                  <CheckCircleOutlined translate="check" className={styles.check} />
                )}
                {type}
                {isCrossChain && type === 'Cross chain to place order' ? (
                  <Tooltip title="Cross chain to place order may take 5-15 minutes. We need to wait for the confirmation of 15 blocks on the Ethereum to ensure the security.">
                    <i className="ai-question-circle-o" />
                  </Tooltip>
                ) : null}
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
      {isCrossChain ? (
        <Meta
          info={`Please be notice if you want to cancel the order after placing it successfully, you will receive the ${currentOrder.tokenName} cross-chain asset on Nervos - ck${currentOrder.tokenName}.`}
        />
      ) : null}
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

  const location = useLocation()
  const [modalVisable, setModalVisable] = useState(false)
  const query = new URLSearchParams(location.search)
  const type = query.get(HISTORY_QUERY_KEY.type) || 'all'
  const wallet = useContainer(WalletContainer)
  const { submittedOrders: submittedOrderList, showStatus, setShowStatus } = useContainer(OrderContainer)
  const { address } = wallet.ckbWallet
  const { ethWallet } = wallet
  const handleWithdraw = useHandleWithdrawOrder(address, dispatch)

  const [searchValue, setSearchValue] = useState('')

  const searchFilter = useCallback(
    (order: OrderInList) => {
      if (searchValue) {
        if (searchValue.toLowerCase() === 'ckb') {
          return true
        }
        return order.tokenName.toLowerCase() === searchValue.toLowerCase()
      }
      return true
    },
    [searchValue],
  )

  const lockHash = useMemo(() => (address ? PWCore.provider?.address?.toLockScript().toHash() : ''), [address])

  usePollOrderList({ lockArgs: lockHash, dispatch, ckbAddress: address, ethAddress: ethWallet.address })

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
          const CKBNotEnough = (
            <span>
              You don&apos;t have enough CKB to complete this transaction, please go to&nbsp;
              <a target="_blank" rel="noopener noreferrer" href="https://faucet.nervos.org/" className={styles.faucet}>
                Nervos Aggron Faucet
              </a>
              &nbsp;and claim some CKB.
            </span>
          )
          const message = error.code !== ErrorCode.CKBNotEnough ? error.message : CKBNotEnough
          Modal.error({ title: 'Transaction Error', content: message || CKBNotEnough })
        })
      }

      if (state.pendingIdList.includes(order.key)) {
        const handleCancelStatusClick = () => {
          const txHash = pendingOrders.getOne(`${order.key}-pending`)
          statusOnClick({
            ...order,
            status: order.executed === '100%' ? 'claimed' : 'aborted',
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
        // Aggregator would claim automatic now, However, if there is only a small amount of order_amount left
        // and the price is divisible, then the aggregator thinks that the order is still possible to be aggregated
        // and does not claim it automatically, and this status is marked as `completed`.
        // This requires the user to manually terminate the order
        case 'completed': {
          return (
            <div className={styles.center}>
              <Button onClick={handleClick} className={styles.action}>
                Cancel
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

  const orders = useMemo(() => {
    if (showStatus === ShowStatus.Open) {
      return orderList.filter(searchFilter).filter(o => o.status !== 'aborted' && o.status !== 'claimed')
    }
    if (showStatus === ShowStatus.History) {
      return orderList.filter(searchFilter).filter(o => o.status === 'aborted' || o.status === 'claimed')
    }
    return []
  }, [orderList, showStatus, searchFilter])

  const header = (
    <div className={styles.switcher}>
      <button
        type="button"
        className={showStatus === ShowStatus.Open ? styles.active : ''}
        onClick={() => setShowStatus(ShowStatus.Open)}
      >
        My Open Orders
      </button>
      <Divider type="vertical" className={styles.divider} />
      <button
        type="button"
        className={showStatus === ShowStatus.History ? styles.active : ''}
        onClick={() => setShowStatus(ShowStatus.History)}
      >
        Order History
      </button>
      <Divider type="vertical" className={styles.divider} />
      <button
        type="button"
        className={showStatus === ShowStatus.CrossChain ? styles.active : ''}
        onClick={() => setShowStatus(ShowStatus.CrossChain)}
      >
        Cross Chain
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
      {showStatus === ShowStatus.CrossChain ? (
        <CrossChainHistory searchValue={searchValue} />
      ) : (
        <>
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
        </>
      )}
    </TradeFrame>
  )
}
export default History
