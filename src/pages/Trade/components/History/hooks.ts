import { useEffect, MutableRefObject, useCallback } from 'react'
import { Address, OutPoint, AddressType } from '@lay2/pw-core'
import { getHistoryOrders } from '../../../../APIs'
import CancelOrderBuilder from '../../../../pw/cancelOrderBuilder'
import { parseOrderRecord, pendingOrders, REJECT_ERROR_CODE, spentCells } from '../../../../utils'
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
              if (['aborted', 'claimed'].includes(order.status ?? '')) {
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
    } else {
      dispatch({ type: ActionType.UpdateOrderList, value: [] })
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
