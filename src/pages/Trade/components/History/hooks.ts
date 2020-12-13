import { useEffect, MutableRefObject, useCallback } from 'react'
import { Address, OutPoint, AddressType } from '@lay2/pw-core'
import BigNumber from 'bignumber.js'
import Web3 from 'web3'
import { useContainer } from 'unstated-next'
import OrderContainer from 'containers/order'
import { ErrorCode } from 'exceptions'
import { submittedOrders } from 'utils/cache'
import { TransactionStatus } from 'components/Header/AssetsManager/api'
import {
  checkSubmittedTxs,
  ckb,
  getAllHistoryOrders,
  getForceBridgeHistory,
  getTransactionHeader,
} from '../../../../APIs'
import CancelOrderBuilder from '../../../../pw/cancelOrderBuilder'
import { OrderCell, parseOrderRecord, pendingOrders, spentCells } from '../../../../utils'
import type { RawOrder } from '../../../../utils'
import { OrderInList } from '.'

export interface HistoryState {
  orderList: Array<Order>
  pendingIdList: Array<string>
  isLoading: boolean
  currentOrder: OrderInList | null
}

/* eslint-disable-next-line no-shadow */
export enum ActionType {
  UpdateOrderList,
  AddPendingId,
  RemovePendingId,
  UpdateLoading,
  UpdateCurrentOrderStatus,
  updateCurrentOrder,
  EndCurrentOrderPending,
}

export type HistoryAction =
  | { type: ActionType.UpdateOrderList; value: Array<Order> }
  | { type: ActionType.AddPendingId; value: string }
  | { type: ActionType.RemovePendingId; value: string }
  | { type: ActionType.UpdateLoading; value: boolean }
  | { type: ActionType.UpdateCurrentOrderStatus; value: OrderCell[] }
  | { type: ActionType.updateCurrentOrder; value: OrderInList }
  | { type: ActionType.EndCurrentOrderPending }

export const reducer: React.Reducer<HistoryState, HistoryAction> = (state, action) => {
  switch (action.type) {
    case ActionType.UpdateOrderList: {
      return { ...state, orderList: action.value }
    }
    case ActionType.AddPendingId: {
      if (!state.pendingIdList.includes(action.value)) {
        return {
          ...state,
          pendingIdList: [...state.pendingIdList, action.value],
        }
      }
      return state
    }
    case ActionType.RemovePendingId: {
      return { ...state, pendingIdList: state.pendingIdList.filter(o => o !== action.value) }
    }
    case ActionType.UpdateLoading: {
      return { ...state, isLoading: action.value }
    }
    case ActionType.UpdateCurrentOrderStatus: {
      return {
        ...state,
        currentOrder: {
          ...state.currentOrder!,
          orderCells: action.value,
        },
      }
    }
    case ActionType.updateCurrentOrder: {
      return {
        ...state,
        currentOrder: action.value,
      }
    }
    default: {
      return state
    }
  }
}

type Order = ReturnType<typeof parseOrderRecord>

export const usePollingOrderStatus = ({
  web3,
  status,
  cells,
  fetchListRef,
  dispatch,
  isCrossChain,
  ckbAddress,
  ethAddress,
  pending,
  key,
}: {
  web3: Web3 | null
  status: OrderInList['status']
  cells: OrderCell[]
  isCrossChain: boolean
  fetchListRef: MutableRefObject<ReturnType<typeof setInterval> | undefined>
  dispatch: React.Dispatch<HistoryAction>
  ckbAddress: string
  pending: boolean
  ethAddress: string
  key: string
}) => {
  useEffect(() => {
    if ((status === 'pending' || pending) && web3) {
      const checkEthStatus = () => {
        const hash = cells?.[0]?.tx_hash
        web3.eth
          .getTransactionReceipt(hash)
          .then(res => {
            if (res) {
              // eslint-disable-next-line no-param-reassign
              cells[0].isLoaded = true
              dispatch({
                type: ActionType.UpdateCurrentOrderStatus,
                value: cells,
              })
            }
          })
          .catch(err => {
            // eslint-disable-next-line no-console
            console.log(err)
          })
      }

      const checkCkbStatus = (index: number) => {
        getForceBridgeHistory(ckbAddress, ethAddress).then(res => {
          const { ckb_to_eth, eth_to_ckb } = res.data
          const orders = ckb_to_eth.concat(eth_to_ckb)
          const forceBridgeItem = orders.find(p => p.eth_tx_hash === cells?.[index]?.tx_hash)
          if (forceBridgeItem && forceBridgeItem.ckb_tx_hash) {
            // eslint-disable-next-line no-param-reassign
            cells[index].tx_hash = forceBridgeItem.ckb_tx_hash!
            dispatch({
              type: ActionType.UpdateCurrentOrderStatus,
              value: cells,
            })

            checkCkbTransaction(forceBridgeItem.ckb_tx_hash!, index)
          }
        })
      }

      const checkCkbTransaction = (txHash: string, index: number) => {
        if (!txHash) {
          return
        }

        ckb.rpc.getTransaction(txHash).then(res => {
          if (res?.txStatus?.status === TransactionStatus.Committed) {
            // eslint-disable-next-line no-param-reassign
            cells[index].isLoaded = true
            dispatch({
              type: ActionType.UpdateCurrentOrderStatus,
              value: cells,
            })
            if (pending) {
              pendingOrders.remove(`${key}-pending`)
            }
          }
        })
      }

      const checkStatus = () => {
        if (isCrossChain) {
          checkEthStatus()
          checkCkbStatus(0)
        } else {
          const index = pending ? cells.length - 1 : 0
          checkCkbTransaction(cells?.[index]?.tx_hash, index)
        }
      }
      checkStatus()
      const TIMER = 3000

      /* eslint-disable-next-line no-param-reassign */
      fetchListRef.current = setInterval(checkStatus, TIMER)
    }

    return () => {
      if (fetchListRef.current) {
        clearInterval(fetchListRef.current)
      }
    }
  }, [web3, status, cells, isCrossChain, ckbAddress, fetchListRef, dispatch, pending, key, ethAddress])
}

export const usePollOrderList = ({
  lockArgs,
  dispatch,
  fetchListRef,
  ckbAddress,
  ethAddress,
}: {
  lockArgs: string
  dispatch: React.Dispatch<HistoryAction>
  fetchListRef: MutableRefObject<ReturnType<typeof setInterval> | undefined>
  ckbAddress: string
  ethAddress: string
}) => {
  const { setAndCacheSubmittedOrders } = useContainer(OrderContainer)

  useEffect(() => {
    dispatch({ type: ActionType.UpdateOrderList, value: [] as Array<Order> })

    if (lockArgs) {
      const fetchData = () =>
        getAllHistoryOrders(lockArgs)
          .then(async res => {
            const parsed = res.map((item: RawOrder) => {
              const order = parseOrderRecord(item)
              if (['aborted', 'claimed'].includes(order.status ?? '')) {
                pendingOrders.remove(order.key)
              }
              // @ts-ignore
              order.tokenName = item.tokenName
              return order
            })
            try {
              const resList = await getTransactionHeader(res.map((item: RawOrder) => item.block_hash))
              for (let i = 0; i < resList.length; i++) {
                const blockHeader = resList[i]
                parsed[i].createdAt = blockHeader.timestamp
              }
              const { eth_to_ckb, ckb_to_eth } = (await getForceBridgeHistory(ckbAddress, ethAddress)).data
              const orderHistory = eth_to_ckb.concat(ckb_to_eth)
              for (let i = 0; i < orderHistory.length; i++) {
                const order = orderHistory[i]
                const index = res.findIndex(r => r.order_cells?.[0]?.tx_hash === order.ckb_tx_hash)
                if (index < 0) {
                  // eslint-disable-next-line no-continue
                  continue
                }
                const matchedOrder = parsed[index]
                if (!matchedOrder) {
                  // eslint-disable-next-line no-continue
                  continue
                }
                setAndCacheSubmittedOrders(orders => {
                  return orders.filter(o => o.key.split(':')[0] !== order.eth_tx_hash)
                })
                matchedOrder.tokenName = matchedOrder.tokenName.slice(2)
                // eslint-disable-next-line no-unused-expressions
                matchedOrder.orderCells?.unshift({
                  tx_hash: order.eth_tx_hash,
                  index: '',
                })
              }
            } catch (error) {
              // eslint-disable-next-line no-console
              console.log(error)
            }

            const hashes: string[] = submittedOrders.get(ckbAddress).map((o: any) => o.key.split(':')[0])
            if (!hashes.length) {
              dispatch({
                type: ActionType.UpdateOrderList,
                value: parsed.sort((a, b) => (new BigNumber(a.createdAt).isLessThan(b.createdAt) ? 1 : -1)),
              })
            } else {
              checkSubmittedTxs(hashes)
                .then(resList => {
                  const unconfirmedHashes = hashes.filter((_, i) => !resList[i])
                  setAndCacheSubmittedOrders(orders =>
                    orders.filter(order => unconfirmedHashes.includes(order.key.split(':')[0])),
                  )

                  dispatch({
                    type: ActionType.UpdateOrderList,
                    value: parsed.sort((a, b) => (new BigNumber(a.createdAt).isLessThan(b.createdAt) ? 1 : -1)),
                  })
                })
                .catch(() => {
                  dispatch({
                    type: ActionType.UpdateOrderList,
                    value: parsed.sort((a, b) => (new BigNumber(a.createdAt).isLessThan(b.createdAt) ? 1 : -1)),
                  })
                })
            }
          })
          .catch(err => {
            console.warn(`[History Polling]: ${err.message}`)
          })
          .finally(() => {
            dispatch({ type: ActionType.UpdateLoading, value: false })
          })

      dispatch({ type: ActionType.UpdateLoading, value: true })
      const TIMER = 3000
      fetchData()
      /* eslint-disable-next-line no-param-reassign */
      fetchListRef.current = setInterval(fetchData, TIMER)
    } else {
      dispatch({ type: ActionType.UpdateOrderList, value: [] })
    }

    return () => {
      if (fetchListRef.current) {
        clearInterval(fetchListRef.current)
      }
    }
  }, [lockArgs, dispatch, fetchListRef, ckbAddress, setAndCacheSubmittedOrders, ethAddress])
}

export const useHandleWithdrawOrder = (address: string, dispatch: React.Dispatch<HistoryAction>) => {
  return useCallback(
    async orderId => {
      if (!address) {
        return null
      }

      const [txHash, index] = orderId.split(':')

      const builder = new CancelOrderBuilder(new Address(address, AddressType.ckb), new OutPoint(txHash, index))

      try {
        dispatch({ type: ActionType.AddPendingId, value: orderId })
        const tx = await builder.build()
        const hash = await builder.send(tx)
        spentCells.add(tx.raw.inputs.map(input => input.previousOutput.serializeJson()) as any)
        pendingOrders.add(orderId, txHash)
        pendingOrders.add(`${orderId}-pending`, hash)
        return hash
      } catch (error) {
        dispatch({ type: ActionType.RemovePendingId, value: orderId })
        if (error.code === ErrorCode.UserReject) {
          throw new Error('Transaction Declined')
        }
        throw error
      }
    },
    [address, dispatch],
  )
}

export default { reducer, usePollOrderList, useHandleWithdrawOrder }
