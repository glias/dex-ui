import React from 'react'
import { Button } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { TRACEORDER_STEP } from '../../../../context/actions/types'
import i18n from '../../../../utils/i18n'
import orderPlace from '../../../../assets/img/orderPlaced.png'
import declined from '../../../../assets/img/declined.png'
import { traceState } from '../../../../context/reducers/trace'
import { OrderButton, TracePairResultBox, TradePairConfirmHeader, TradePairConfirmContent } from './styled'

export default () => {
  const dispatch = useDispatch()
  const isOrderSuccess = useSelector((state: traceState) => state.isOrderSuccess)
  const tradeResultStr = isOrderSuccess ? i18n.t(`trade.TradeSuccess`) : i18n.t(`trade.TradeFailed`)
  const handleClickSubmit = () => {
    dispatch({
      type: TRACEORDER_STEP,
      payload: {
        orderStep: 1,
      },
    })
  }
  const tradeSuccessBox = () => (
    <div className="trace-success">
      <div className="order-place">
        <img src={orderPlace} alt="Order Place" />
      </div>
      <div>order Place</div>
      <div>View you CKB Explorer</div>
    </div>
  )

  const tradeFailedBox = () => (
    <div className="trace-failed">
      <div className="order-place">
        <img src={declined} alt="Order Declined" />
      </div>
      <div>Order Declined</div>
    </div>
  )
  return (
    <TracePairResultBox>
      <TradePairConfirmHeader>
        <span>Review Order</span>
      </TradePairConfirmHeader>
      <TradePairConfirmContent>{isOrderSuccess ? tradeSuccessBox() : tradeFailedBox()}</TradePairConfirmContent>
      <OrderButton>
        <Button type="text" size="large" onClick={() => handleClickSubmit()}>
          {tradeResultStr}
        </Button>
      </OrderButton>
    </TracePairResultBox>
  )
}
