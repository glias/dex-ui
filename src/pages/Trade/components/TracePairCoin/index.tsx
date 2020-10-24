/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react'
import { useContainer } from 'unstated-next'
import OrderContainer from '../../../../containers/order'
import { TracePairLine } from './styled'

const TracePairCoin = () => {
  const Order = useContainer(OrderContainer)
  const [buyer, seller] = Order.pair

  return (
    <TracePairLine>
      <span>{buyer}</span>
      <span onClick={() => Order.togglePair()}>
        <i
          className="ai-right-circle"
          style={{
            color: 'rgba(0, 106, 151, 1)',
          }}
        />
      </span>
      <span>{seller}</span>
    </TracePairLine>
  )
}

export default TracePairCoin
