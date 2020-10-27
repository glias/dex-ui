import { useEffect, MutableRefObject, useCallback } from 'react'
import PWCore, { Address, Amount, OutPoint, AddressType } from '@lay2/pw-core'
import { getHistoryOrders } from '../../../../APIs'
import { parseOrderRecord, CKB_NODE_URL, pendingOrders } from '../../../../utils'
import CancelOrderBuilder from '../../../../pw/cancelOrderBuilder'
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
      const completedIds = action.value.filter(o => o.status !== 'open').map(o => o.key)
      return {
        ...state,
        orderList: action.value,
        pendingIdList: state.pendingIdList.filter(id => !completedIds.includes(id)),
      }
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
}: {
  lockArgs: string
  dispatch: React.Dispatch<HistoryAction>
  fetchListRef: MutableRefObject<ReturnType<typeof setInterval> | undefined>
}) => {
  useEffect(() => {
    dispatch({ type: ActionType.UpdateOrderList, value: [] as Array<Order> })

    if (lockArgs) {
      const fetchData = () =>
        getHistoryOrders(lockArgs)
          .then(res => {
            const parsed = res.data.reverse().map((item: RawOrder) => {
              const order = parseOrderRecord(item)
              if (order.status !== 'open') {
                pendingOrders.remove(order.key)
              }
              return order
            })
            dispatch({ type: ActionType.UpdateOrderList, value: parsed })
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
    }

    return () => {
      if (fetchListRef.current) {
        clearInterval(fetchListRef.current)
      }
    }
  }, [lockArgs, dispatch, fetchListRef])
}

export const useHandleWithdrawOrder = (address: string, dispatch: React.Dispatch<HistoryAction>) => {
  return useCallback(
    async orderId => {
      if (!address) {
        return null
      }

      const [txHash, index] = orderId.split(':')

      const builder = new CancelOrderBuilder(
        new Address(address, AddressType.ckb),
        new OutPoint(txHash, index),
        new Amount('80'),
      )

      const pw = new PWCore(CKB_NODE_URL)

      try {
        dispatch({ type: ActionType.AddPendingId, value: orderId })
        const hash = await pw.sendTransaction(builder)
        pendingOrders.add(orderId, txHash)
        return hash
      } catch (error) {
        dispatch({ type: ActionType.RemovePendingId, value: orderId })
        return null
      }
    },
    [address, dispatch],
  )
}

export default { reducer, usePollOrderList, useHandleWithdrawOrder }
