/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState } from 'react'
import { Button } from 'antd'
import { useContainer } from 'unstated-next'
import OrderContainer from '../../../../containers/order'
import { TracePairLine } from './styled'

const TracePairCoin = () => {
  const [transform, setTransform] = useState(false)
  const Order = useContainer(OrderContainer)
  const [buyer, seller] = Order.pair
  console.log(buyer)

  const togglePair = () => {
    Order.togglePair()
    setTransform(!transform)
  }

  return (
    <TracePairLine>
      <span>{buyer}</span>
      <Button type="text" onClick={() => togglePair()}>
        <i
          className={transform ? 'ai-left-circle' : 'ai-right-circle'}
          style={{
            color: 'rgba(0, 106, 151, 1)',
          }}
        />
      </Button>
      <span>{seller}</span>
    </TracePairLine>
  )
}

export default TracePairCoin
