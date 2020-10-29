/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react'
import { Button } from 'antd'
import { useContainer } from 'unstated-next'
import OrderContainer from '../../../../containers/order'
import { TracePairLine } from './styled'

const TracePairCoin = ({ resetFields }: { resetFields: Function }) => {
  const Order = useContainer(OrderContainer)
  const [buyer, seller] = Order.pair

  const togglePair = () => {
    Order.togglePair()
    Order.reset()
    resetFields()
  }

  return (
    <TracePairLine>
      <span>{buyer}</span>
      <Button type="text" onClick={() => togglePair()} size="large">
        <i
          className="ai-right-circle"
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
