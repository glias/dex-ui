import React from 'react'
import { Button, Divider } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { TRACEORDER_STEP } from '../../../../context/actions/types'
import {
  TradePairConfirmBox,
  OrderBox,
  PairOrder,
  OrderButton,
  TradePairConfirmHeader,
  TradePairConfirmContent,
} from './styled'

export default () => {
  const currentPair = useSelector((state: any) => state.trace.currentPair)
  const dispatch = useDispatch()

  const handleClickConfirm = (step: number) => {
    dispatch({
      type: TRACEORDER_STEP,
      payload: {
        orderStep: step,
      },
    })
  }

  return (
    <TradePairConfirmBox>
      <TradePairConfirmHeader>
        <Button
          type="text"
          size="large"
          onClick={() => {
            handleClickConfirm(1)
          }}
        >
          <i className="ai-left" />
        </Button>
        <div>Review Order</div>
      </TradePairConfirmHeader>
      <TradePairConfirmContent>
        <PairOrder>
          <div>{currentPair}</div>
          <Button type="text" size="large" className="circle-icon">
            <i className="ai-right-circle" />
          </Button>
          <div>CKB</div>
        </PairOrder>
        <OrderBox>
          <ul>
            <li>
              <div>Pay</div>
              <div>
                <span>--</span>
                <span>{currentPair}</span>
              </div>
            </li>
            <li>
              <div>Price</div>
              <div>
                <span>--</span>
                <span>
                  CKB per
                  {currentPair}
                </span>
              </div>
            </li>
            <Divider />
            <li>
              <div>Receive</div>
              <div>
                <span>--</span>
                <span>CKB</span>
              </div>
            </li>
            <li className="execution-fee">
              <div>
                Execution Fee
                <i className="ai-question-circle-o" />
              </div>
              <div>
                <span>--</span>
                <span>CKB</span>
              </div>
            </li>
          </ul>
        </OrderBox>
        <OrderButton>
          <Button type="text" size="large" onClick={() => handleClickConfirm(3)}>
            Confirm Order
          </Button>
        </OrderButton>
      </TradePairConfirmContent>
    </TradePairConfirmBox>
  )
}
