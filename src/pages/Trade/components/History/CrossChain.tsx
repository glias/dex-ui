import { CheckCircleOutlined, LoadingOutlined, SyncOutlined } from '@ant-design/icons'
import { Button, Modal, Spin, Table, Tooltip } from 'antd'
import { ckb, CrossChainOrder, CrossChainOrderStatus, getPureCrossChainHistory, isSameTxHash } from 'APIs'
import WalletContainer from 'containers/wallet'
import BigNumber from 'bignumber.js'
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
    render: (tokenName: string, order: CrossChainOrder) => {
      const firstToken = order.isLock ? tokenName : `ck${tokenName}`
      const secondToken = !order.isLock ? tokenName : `ck${tokenName}`
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
  return `${txhash.slice(0, 25)}...${txhash.slice(txhash.length - 4, txhash.length)}`
}

function buildURL(txhash: string, isETH: boolean) {
  return isETH ? `${ETHER_SCAN_URL}tx/${txhash}` : `${EXPLORER_URL}transaction/${txhash}`
}

const OrderModal = ({
  currentOrder,
  modalVisable,
  setModalVisable,
  setOrderStatus,
  web3,
}: {
  modalVisable: boolean
  currentOrder: CrossChainOrder
  setModalVisable: Function
  // eslint-disable-next-line
  setOrderStatus: (status: CrossChainOrderStatus) => void
  web3: Web3
}) => {
  const order = currentOrder
  const ckbTx = order.ckbTxHash ?? '-'
  const ethTx = order.ethTxHash ?? '-'
  const { isLock } = order
  const firstTx = isLock ? ethTx : ckbTx
  const secondTx = isLock ? ckbTx : ethTx
  const firstDescription = `Confirm on ${isLock ? 'Ethereum' : 'Nervos'}`
  const secondDescription = `Confirm on ${!isLock ? 'Ethereum' : 'Nervos'}`
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
            {isFirstTxLoading ? (
              <LoadingOutlined translate="loading" className={styles.check} />
            ) : (
              <CheckCircleOutlined translate="check" className={styles.check} />
            )}
            {firstDescription}
          </span>
          <span className={styles.hash}>
            <a target="_blank" rel="noopener noreferrer" href={buildURL(firstTx, isLock)}>
              {buildTxHash(firstTx)}
            </a>
          </span>
        </div>
        <div className={styles.record}>
          <span className={styles.chain}>
            {isSecondTxLoading ? (
              <LoadingOutlined translate="loading" className={styles.check} />
            ) : (
              <CheckCircleOutlined translate="check" className={styles.check} />
            )}
            {secondDescription}
            <Tooltip
              title={`This step may take 5-15 minutes. We need to wait for the confirmation of 15 blocks on the ${
                !isLock ? 'Ethereum' : 'Nervos'
              } to ensure the security.`}
            >
              <i className="ai-question-circle-o" />
            </Tooltip>
          </span>
          <span className={styles.hash}>
            {secondTx.length < 10 ? (
              '-'
            ) : (
              <a target="_blank" rel="noopener noreferrer" href={buildURL(secondTx, !isLock)}>
                {buildTxHash(secondTx)}
              </a>
            )}
          </span>
        </div>
      </div>
    </ModalContainer>
  )
}

const CrossChainTable = ({ searchValue }: { searchValue: string }) => {
  const [isLoading, setLoading] = useState(true)
  const { ckbWallet, web3, ethWallet } = useContainer(WalletContainer)
  const { setAndCacheCrossChainOrders, crossChainOrders } = useContainer(OrderContainer)
  const [orders, setOrders] = useState<CrossChainOrder[]>([])
  const [currentOrder, setCurrentOrder] = useState<CrossChainOrder | null>(null)
  const [modalVisable, setModalVisable] = useState(false)
  const setOrderStatus = useCallback((status: CrossChainOrderStatus) => {
    setCurrentOrder(prev => {
      return {
        ...prev!,
        status,
      }
    })
  }, [])

  const searchFilter = useCallback(
    (order: CrossChainOrder) => {
      if (searchValue) {
        return order.tokenName.toLowerCase().includes(searchValue.toLowerCase())
      }
      return Boolean
    },
    [searchValue],
  )

  useEffect(() => {
    const INTERVAL_TIME = 5000
    let interval: number
    if (ckbWallet.address && ethWallet.address && web3) {
      const getOrders = () => {
        getPureCrossChainHistory(ckbWallet.address, ethWallet.address)
          .then(res => {
            setOrders(res)
            setAndCacheCrossChainOrders(cacheOrders => {
              return cacheOrders.filter(cache => {
                const matched = res.find(
                  o => isSameTxHash(o.ckbTxHash, cache.ckbTxHash) || isSameTxHash(o.ethTxHash, cache.ethTxHash),
                )

                if (
                  matched &&
                  (isSameTxHash(matched.ckbTxHash, currentOrder?.ckbTxHash) ||
                    isSameTxHash(matched.ethTxHash, currentOrder?.ethTxHash))
                ) {
                  setCurrentOrder(matched)
                }

                return !matched
              })
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
  }, [ckbWallet.address, web3, setAndCacheCrossChainOrders, ethWallet.address, currentOrder])

  const orderList = useMemo(() => {
    return [
      ...crossChainOrders,
      ...orders.filter(o =>
        crossChainOrders.every(cache => cache.ckbTxHash !== o.ckbTxHash && cache.ethTxHash !== o.ethTxHash),
      ),
    ]
      .sort((a, b) => (new BigNumber(a.timestamp).isLessThan(b.timestamp) ? 1 : -1))
      .filter(searchFilter)
  }, [crossChainOrders, orders, searchFilter])

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
        rowKey={o => o.ckbTxHash || o.ethTxHash}
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
          setOrderStatus={setOrderStatus}
        />
      ) : null}
    </>
  )
}

export default CrossChainTable
