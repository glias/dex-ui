/* eslint-disable import/prefer-default-export */
import { useEffect, useRef } from 'react'

export const useDidMount = (cb: () => void) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(cb, [])
}

type RefValue<T> = { value: T }

export function useConstant<T>(initValueThunk: () => T): T {
  const ref = useRef<RefValue<T>>()

  if (!ref.current) ref.current = { value: initValueThunk() }

  return ref.current.value
}
