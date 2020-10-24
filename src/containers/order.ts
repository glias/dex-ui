import { useState, useMemo } from 'react'
import { createContainer } from 'unstated-next'

// eslint-disable-next-line no-shadow
export enum OrderStep {
  Order,
  Comfirm,
  Result,
}

export function useOrder() {
  const [step, setStep] = useState<OrderStep>(OrderStep.Order)
  const [pay, setPay] = useState('')
  const [price, setPrice] = useState('')
  const [txHash, setTxHash] = useState('')

  const receive = useMemo(() => {
    if (price && pay) {
      return (parseFloat(price) * parseFloat(pay)).toFixed(2)
    }

    return '0.00'
  }, [price, pay])

  function reset() {
    setPay('')
    setPrice('')
  }

  return {
    step,
    setStep,
    pay,
    setPay,
    price,
    setPrice,
    receive,
    reset,
    txHash,
    setTxHash,
  }
}

export const OrderContainer = createContainer(useOrder)

export default OrderContainer
