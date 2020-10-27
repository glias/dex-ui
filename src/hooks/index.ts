/* eslint-disable import/prefer-default-export */
import { useEffect } from 'react'

export const useDidMount = (cb: () => void) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(cb, [])
}
