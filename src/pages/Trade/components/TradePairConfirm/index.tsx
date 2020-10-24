import React from 'react'
import { Address, AddressType, Amount } from '@lay2/pw-core'
import { useContainer } from 'unstated-next'
import { Button, Divider } from 'antd'
import { useSelector } from 'react-redux'
import {
  TradePairConfirmBox,
  OrderBox,
  PairOrder,
  OrderButton,
  TradePairConfirmHeader,
  TradePairConfirmContent,
} from './styled'
import OrderContainer, { OrderStep } from '../../../../containers/order'
import WalletContainer from '../../../../containers/wallet'
import PlaceOrderBuilder from '../../../../pw/placeOrderBuilder'

export default function TradePairConfirm() {
  const currentPair = useSelector((state: any) => state.trace.currentPair)
  const Wallet = useContainer(WalletContainer)
  const Order = useContainer(OrderContainer)
  const onConfirm = async () => {
    const builder = new PlaceOrderBuilder(
      new Address(Wallet.ckbWallet.address, AddressType.ckb),
      new Amount('400'),
      '0x0000000000000000000000000000000000286bee00000000000000000000000000743ba40b00000000',
    )

    const txHash = await Wallet.pw?.sendTransaction(builder)
    if (txHash) {
      Order.setTxHash(txHash)
    }
    Order.setStep(OrderStep.Result)
  }

  return (
    <TradePairConfirmBox>
      <TradePairConfirmHeader>
        <Button
          type="text"
          size="large"
          onClick={() => {
            Order.setStep(OrderStep.Order)
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
                <span>{Order.pay}</span>
                <span>{currentPair}</span>
              </div>
            </li>
            <li>
              <div>Price</div>
              <div>
                <span>{Order.price}</span>
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
                <span>{Order.receive}</span>
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
          <Button type="text" size="large" onClick={onConfirm}>
            Confirm Order
          </Button>
        </OrderButton>
      </TradePairConfirmContent>
    </TradePairConfirmBox>
  )
}
