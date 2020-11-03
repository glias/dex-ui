import React, { useState, useCallback, useMemo, useEffect } from 'react'
import PWCore, { Builder } from '@lay2/pw-core'
import { useContainer } from 'unstated-next'
import BigNumber from 'bignumber.js'
import { Button, Divider, Tooltip, Modal } from 'antd'
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
import { calcBuyReceive, calcSellReceive } from '../../../../utils/fee'
import { COMMISSION_FEE } from '../../../../utils'

export default function TradePairConfirm() {
  const Wallet = useContainer(WalletContainer)
  const Order = useContainer(OrderContainer)
  const [buyer, seller] = Order.pair
  const [disabled, setDisabled] = useState(false)
  const { address } = Wallet.ckbWallet

  useEffect(() => {
    if (address === '') {
      setDisabled(false)
      Order.reset()
      Order.setStep(OrderStep.Order)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  const onConfirm = useCallback(async () => {
    setDisabled(true)
    try {
      const txHash = await Wallet.pw?.sendTransaction(Order.tx!)

      const isBid = Order.orderType === OrderType.Buy
      const receiveCalc = isBid ? calcBuyReceive : calcSellReceive

      const submittedOrder: SubmittedOrder = {
        key: `${txHash}:0x0`,
        isBid,
        status: 'pending',
        pay: Order.pay,
        receive: receiveCalc(Order.pay, Order.price),
        price: Order.price,
        createdAt: `${Date.now()}`,
      }
      Order.setAndCacheSubmittedOrders(orders => [submittedOrder, ...orders])
      Order.setTxHash(txHash!)
      Order.setStep(OrderStep.Result)
      Wallet.reloadWallet(PWCore.provider.address.toCKBAddress())
    } catch (error) {
      Modal.error({ title: 'Submission Error', content: error.message })
    } finally {
      setDisabled(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    Wallet.reloadWallet,
    Order.setStep,
    Order.setTxHash,
    Order.setAndCacheSubmittedOrders,
    Order.pay,
    Order.price,
    Wallet.pw,
    Order.tx,
  ])

  const transactionFee = useMemo(() => {
    return Order.tx ? Builder.calcFee(Order.tx).toString() : 0
  }, [Order.tx])

  const executionFee = useMemo(() => {
    return new BigNumber(Order.pay || '0')
      .div(1 + COMMISSION_FEE)
      .times(COMMISSION_FEE)
      .toFixed(8, 1)
      .toString()
  }, [Order.pay])

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
          <span className="circle-icon">
            <i className="ai-right-circle" />
          </span>
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
                <span>{`${seller}/${buyer}`}</span>
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
                <Tooltip title={i18n.t('trade.executionFeeDesc')}>
                  <i className="ai-question-circle-o" />
                </Tooltip>
              </div>
              <div>
                <span>{executionFee}</span>
                <span>{buyer}</span>
              </div>
            </li>
            <li className="execution-fee">
              <div>
                {i18n.t(`trade.transactionFee`)}
                <Tooltip title={i18n.t('trade.transactionFeeDesc')}>
                  <i className="ai-question-circle-o" />
                </Tooltip>
              </div>
              <div>
                <span>{transactionFee}</span>
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
