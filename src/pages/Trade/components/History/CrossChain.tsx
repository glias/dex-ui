import { CheckCircleOutlined, LoadingOutlined, SyncOutlined } from '@ant-design/icons'
import { Button, Modal, Spin, Table, Tooltip } from 'antd'
import { ckb, CrossChainOrder, CrossChainOrderStatus, getPureCrossChainHistory } from 'APIs'
import WalletContainer from 'containers/wallet'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useContainer } from 'unstated-next'
import { getTimeString } from 'utils'
import { ETHER_SCAN_URL, EXPLORER_URL } from 'constants/url'
import styled from 'styled-components'
import Web3 from 'web3'
import OrderContainer from 'containers/order'
import { ReactComponent as InfoSvg } from '../../../../assets/svg/info.svg'
import styles from './history.module.css'

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
    dataIndex: 'timestamp',
    key: 'timestamp',
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
    dataIndex: 'tokenName',
    key: 'tokenName',
    ellipsis: {
      showTitle: false,
    },
    render: (tokenName: string) => {
      const isShadow = tokenName.startsWith('ck')
      const firstToken = isShadow ? tokenName.slice(2) : tokenName
      const secondToken = firstToken.startsWith('ck') ? firstToken.slice(2) : `ck${firstToken}`
      const pair = `${firstToken} ➜ ${secondToken}`
      return <span style={{ textTransform: 'none' }}>{pair}</span>
    },
  },
  {
    title: 'amount',
    dataIndex: 'amount',
    key: 'amount',
    ellipsis: {
      showTitle: false,
    },
    render: (amount: string) => {
      return <Tooltip title={amount}>{amount}</Tooltip>
    },
  },
  {
    title: 'status',
    dataIndex: 'status',
    key: 'status',
    ellipsis: {
      showTitle: false,
    },
    render: (status: CrossChainOrderStatus) => {
      return (
        <span>
          {status === CrossChainOrderStatus.Completed ? (
            status
          ) : (
            <Spin indicator={<SyncOutlined spin translate="loading" />} />
          )}
        </span>
      )
    },
  },
]

function buildTxHash(txhash: string) {
  return `${txhash.startsWith('0x') ? '' : '0x'}${txhash.slice(0, 25)}...${txhash.slice(
    txhash.length - 4,
    txhash.length,
  )}`
}

function buildURL(txhash: string) {
  return txhash.startsWith('0x') ? `${ETHER_SCAN_URL}tx/${txhash}` : `${EXPLORER_URL}transaction/0x${txhash}`
}

const OrderModal = ({
  currentOrder,
  modalVisable,
  setModalVisable,
  web3,
}: {
  modalVisable: boolean
  currentOrder: CrossChainOrder
  setModalVisable: Function
  web3: Web3
}) => {
  const [order, setOrder] = useState(currentOrder)
  const setOrderStatus = useCallback((status: CrossChainOrderStatus) => {
    setOrder(prev => {
      return {
        ...prev,
        status,
      }
    })
  }, [])
  const ckbTx = order.ckbTxHash ?? '-'
  const ethTx = order.ethTxHash ?? '-'
  const isLock = order.tokenName.startsWith('ck')
  const firstTx = isLock ? ethTx : ckbTx
  const secondTx = isLock ? ckbTx : ethTx
  const firstDescription = `Confirm in ${isLock ? 'ETH' : 'CKB'} chain`
  const secondDescription = `Confirm in ${!isLock ? 'ETH' : 'CKB'} chain`
  const { status } = order
  const isFirstTxLoading = useMemo(() => {
    if (status === CrossChainOrderStatus.Completed) {
      return false
    }
    if (isLock && status === CrossChainOrderStatus.ConfirmInETH) {
      return true
    }
    if (!isLock && status === CrossChainOrderStatus.ConfirmInCKB) {
      return true
    }
    return false
  }, [status, isLock])

  const isSecondTxLoading = useMemo(() => {
    if (status === CrossChainOrderStatus.Completed) {
      return false
    }
    return true
  }, [status])

  useEffect(() => {
    const INTERVAL_TIME = 5000
    const checkStatus = () => {
      if (status === CrossChainOrderStatus.Completed) {
        return
      }

      if (isLock) {
        web3.eth.getTransactionReceipt(firstTx).then(res => {
          if (res) {
            setOrderStatus(CrossChainOrderStatus.ConfirmInCKB)
          }
        })
      } else {
        ckb.rpc.getTransaction(firstTx).then(res => {
          if (res?.txStatus?.status === 'committed') {
            setOrderStatus(CrossChainOrderStatus.ConfirmInETH)
          }
        })
      }
    }

    checkStatus()

    const interval = setInterval(() => {
      checkStatus()
    }, INTERVAL_TIME)

    return () => clearInterval(interval)
  }, [isLock, web3, setOrderStatus, firstTx, status])
  return (
    <ModalContainer
      className={styles.modal}
      wrapClassName={styles.modal}
      visible={modalVisable}
      title="Order Info"
      footer={null}
      onCancel={() => setModalVisable(false)}
    >
      <div className={styles.records}>
        <div className={styles.record}>
          <span className={styles.chain}>
            {firstDescription}
            {isFirstTxLoading ? (
              <LoadingOutlined translate="loading" className={styles.check} />
            ) : (
              <CheckCircleOutlined translate="check" className={styles.check} />
            )}
          </span>
          <span className={styles.hash}>
            <a target="_blank" rel="noopener noreferrer" href={buildURL(firstTx)}>
              {buildTxHash(firstTx)}
            </a>
          </span>
        </div>
        <div className={styles.record}>
          <span className={styles.chain}>
            {secondDescription}
            {isSecondTxLoading ? (
              <LoadingOutlined translate="loading" className={styles.check} />
            ) : (
              <CheckCircleOutlined translate="check" className={styles.check} />
            )}
          </span>
          <span className={styles.hash}>
            {secondTx.length < 10 ? (
              '-'
            ) : (
              <a target="_blank" rel="noopener noreferrer" href={buildURL(secondTx)}>
                {buildTxHash(secondTx)}
              </a>
            )}
          </span>
        </div>
      </div>
    </ModalContainer>
  )
}

const CrossChainTable = () => {
  const [isLoading, setLoading] = useState(true)
  const { ckbWallet, web3 } = useContainer(WalletContainer)
  const { setAndCacheCrossChainOrders, crossChainOrders } = useContainer(OrderContainer)
  const [orders, setOrders] = useState<CrossChainOrder[]>([])
  const [currentOrder, setCurrentOrder] = useState<CrossChainOrder | null>(null)
  const [modalVisable, setModalVisable] = useState(false)

  useEffect(() => {
    const INTERVAL_TIME = 3000
    let interval: number
    if (ckbWallet.address && web3) {
      const getOrders = () => {
        getPureCrossChainHistory(ckbWallet.address, web3)
          .then(res => {
            setOrders(res)
            setAndCacheCrossChainOrders(cacheOrders => {
              return cacheOrders.filter(cache =>
                res.every(o => o.ckbTxHash !== cache.ckbTxHash && o.ethTxHash !== cache.ethTxHash),
              )
            })
          })
          .finally(() => setLoading(false))
      }

      getOrders()

      interval = setInterval(getOrders, INTERVAL_TIME)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [ckbWallet.address, web3, setAndCacheCrossChainOrders])

  const orderList = useMemo(() => {
    return [
      ...crossChainOrders,
      ...orders.filter(o =>
        crossChainOrders.every(cache => cache.ckbTxHash !== o.ckbTxHash && cache.ethTxHash !== o.ethTxHash),
      ),
    ]
  }, [crossChainOrders, orders])

  const actionColumn = {
    title: '',
    dataIndex: 'action',
    key: 'action',
    width: 60,
    render: (_: unknown, order: CrossChainOrder) => {
      return (
        <Button
          className={styles.status}
          onClick={() => {
            setCurrentOrder(order)
            setModalVisable(true)
          }}
        >
          <InfoSvg />
        </Button>
      )
    },
  }

  return (
    <>
      <Table
        className={styles.orders}
        dataSource={orderList}
        rowKey="timestamp"
        columns={[...columns, actionColumn]}
        loading={isLoading}
        rowClassName={(_, index) => (index % 2 === 0 ? `${styles.even} ${styles.td}` : `${styles.td}`)}
        onHeaderRow={() => ({ className: styles.thead })}
      />
      {currentOrder && web3 ? (
        <OrderModal
          currentOrder={currentOrder}
          modalVisable={modalVisable}
          setModalVisable={setModalVisable}
          web3={web3}
        />
      ) : null}
    </>
  )
}

export default CrossChainTable
