/* eslint-disable import/prefer-default-export */
import { useEffect } from 'react'

export const useDidMount = (cb: () => void) => {
  useEffect(cb, [])
}
