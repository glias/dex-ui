import React, { useState } from 'react'
import { Address, AddressType, Amount } from '@lay2/pw-core'
import { useContainer } from 'unstated-next'
import { Button, Divider } from 'antd'
import {
  TradePairConfirmBox,
  OrderBox,
  PairOrder,
  OrderButton,
  TradePairConfirmHeader,
  TradePairConfirmContent,
} from './styled'
import i18n from '../../../../utils/i18n'
import OrderContainer, { OrderStep, OrderType } from '../../../../containers/order'
import type { SubmittedOrder } from '../../../../containers/order'
import WalletContainer from '../../../../containers/wallet'
import PlaceOrderBuilder from '../../../../pw/placeOrderBuilder'
import { calcBuyAmount, calcBuyReceive, calcSellReceive } from '../../../../utils/fee'

export default function TradePairConfirm() {
  const Wallet = useContainer(WalletContainer)
  const Order = useContainer(OrderContainer)
  const [buyer, seller] = Order.pair
  const [disabled, setDisabled] = useState(false)

  const onConfirm = async () => {
    setDisabled(true)
    const buyAmount = calcBuyAmount(Order.pay)
    const builder = new PlaceOrderBuilder(
      new Address(Wallet.ckbWallet.address, AddressType.ckb),
      Order.orderType === OrderType.Buy ? new Amount(buyAmount) : new Amount(Order.pay),
      Order.pay,
      Order.orderType,
      Order.price,
    )

    const txHash = await Wallet.pw?.sendTransaction(builder)

    if (txHash) {
      const isBid = Order.orderType === OrderType.Buy
      const receiveCalc = isBid ? calcBuyReceive : calcSellReceive

      const submittedOrder: SubmittedOrder = {
        key: `${txHash}:0x0`,
        isBid,
        status: 'pending',
        pay: Order.pay,
        receive: receiveCalc(Order.pay, Order.price),
        price: Order.price,
      }
      setDisabled(true)
      Order.setAndCacheSubmittedOrders(orders => [...orders, submittedOrder])
      Order.setTxHash(txHash)
      Order.setStep(OrderStep.Result)
    }
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
        <div>{i18n.t(`trade.reviewOrder`)}</div>
      </TradePairConfirmHeader>
      <TradePairConfirmContent>
        <PairOrder>
          <div>{buyer}</div>
          <Button type="text" size="large" className="circle-icon">
            <i className="ai-right-circle" />
          </Button>
          <div>{seller}</div>
        </PairOrder>
        <OrderBox>
          <ul>
            <li>
              <div>{i18n.t(`trade.pay`)}</div>
              <div>
                <span>{Order.pay}</span>
                <span>{buyer}</span>
              </div>
            </li>
            <li>
              <div>{i18n.t(`trade.price`)}</div>
              <div>
                <span>{Order.price}</span>
                <span>{`${seller} per ${buyer}`}</span>
              </div>
            </li>
            <Divider />
            <li>
              <div>{i18n.t(`trade.receive`)}</div>
              <div>
                <span>{Order.receive}</span>
                <span>{seller}</span>
              </div>
            </li>
            <li className="execution-fee">
              <div>
                {i18n.t(`trade.executionFee`)}
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
          <Button
            type="text"
            size="large"
            onClick={onConfirm}
            disabled={disabled}
            loading={disabled}
            style={{
              color: 'rgba(0, 106, 151, 1)',
            }}
          >
            {i18n.t(`trade.confirmOrder`)}
          </Button>
        </OrderButton>
      </TradePairConfirmContent>
    </TradePairConfirmBox>
  )
}
