import { useEffect, MutableRefObject, useCallback } from 'react'
import { Address, OutPoint, AddressType } from '@lay2/pw-core'
import BigNumber from 'bignumber.js'
import { getAllHistoryOrders, getForceBridgeHistory, getTransactionHeader } from '../../../../APIs'
import CancelOrderBuilder from '../../../../pw/cancelOrderBuilder'
import { parseOrderRecord, pendingOrders, spentCells } from '../../../../utils'
import { REJECT_ERROR_CODE } from '../../../../constants'
import type { RawOrder } from '../../../../utils'

export interface HistoryState {
  orderList: Array<Order>
  pendingIdList: Array<string>
  isLoading: boolean
}

/* eslint-disable-next-line no-shadow */
export enum ActionType {
  UpdateOrderList,
  AddPendingId,
  RemovePendingId,
  UpdateLoading,
}

export type HistoryAction =
  | { type: ActionType.UpdateOrderList; value: Array<Order> }
  | { type: ActionType.AddPendingId; value: string }
  | { type: ActionType.RemovePendingId; value: string }
  | { type: ActionType.UpdateLoading; value: boolean }

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
    default: {
      return state
    }
  }
}

type Order = ReturnType<typeof parseOrderRecord>

export const usePollOrderList = ({
  lockArgs,
  dispatch,
  fetchListRef,
  ckbAddress,
}: {
  lockArgs: string
  dispatch: React.Dispatch<HistoryAction>
  fetchListRef: MutableRefObject<ReturnType<typeof setInterval> | undefined>
  ckbAddress: string
}) => {
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
              const { crosschain_history: orderHistory } = (await getForceBridgeHistory(ckbAddress)).data
              for (let i = 0; i < orderHistory.length; i++) {
                const order = orderHistory[i]
                const index = res.findIndex(r => r.order_cells?.[0]?.tx_hash === `0x${order.ckb_tx_hash}`)
                if (index < 0) {
                  // eslint-disable-next-line no-continue
                  continue
                }
                const matchedOrder = parsed[index]
                if (!matchedOrder) {
                  // eslint-disable-next-line no-continue
                  continue
                }
                matchedOrder.tokenName = matchedOrder.tokenName.slice(2)
                // eslint-disable-next-line no-unused-expressions
                matchedOrder.orderCells?.unshift({
                  tx_hash: order.eth_lock_tx_hash,
                  index: '',
                })
              }
            } catch (error) {
              // eslint-disable-next-line no-console
              console.log(error)
            }
            const resList = await getTransactionHeader(res.map((item: RawOrder) => item.block_hash))
            for (let i = 0; i < resList.length; i++) {
              const blockHeader = resList[i]
              parsed[i].createdAt = blockHeader.timestamp
            }
            dispatch({
              type: ActionType.UpdateOrderList,
              value: parsed.sort((a, b) => (new BigNumber(a.createdAt).isLessThan(b.createdAt) ? 1 : -1)),
            })
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
  }, [lockArgs, dispatch, fetchListRef, ckbAddress])
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
        return hash
      } catch (error) {
        dispatch({ type: ActionType.RemovePendingId, value: orderId })
        if (error.code === REJECT_ERROR_CODE) {
          throw new Error('Transaction Declined')
        }
        throw error
      }
    },
    [address, dispatch],
  )
}

export default { reducer, usePollOrderList, useHandleWithdrawOrder }
