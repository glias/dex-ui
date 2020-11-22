import React, { useState, useCallback, useMemo, useEffect } from 'react'
import PWCore, { Amount, Builder, AmountUnit } from '@lay2/pw-core'
import { useContainer } from 'unstated-next'
import BigNumber from 'bignumber.js'
import ConfirmButton from 'components/ConfirmButton'
import { Divider, Modal } from 'antd'
import { TradePairConfirmBox, TradePairConfirmContent, OrderResult, Footer } from './styled'
import i18n from '../../../../utils/i18n'
import OrderContainer, { OrderStep, OrderType } from '../../../../containers/order'
import type { SubmittedOrder } from '../../../../containers/order'
import WalletContainer from '../../../../containers/wallet'
import { calcBuyReceive, calcSellReceive } from '../../../../utils/fee'
import { COMMISSION_FEE, MAX_TRANSACTION_FEE, ORDER_CELL_CAPACITY } from '../../../../constants'
import { spentCells } from '../../../../utils'
import { Header } from './header'
import { Pairs } from './pairs'
import { List, Item } from './list'
import { Meta } from './meta'

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
      const tx = Order.tx!
      const txHash = await Wallet.pw?.sendTransaction(tx)
      spentCells.add(tx.raw.inputs.map(input => input.previousOutput.serializeJson()) as any)

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
    return Order.tx ? Builder.calcFee(Order.tx).toString() : '0'
  }, [Order.tx])

  const tradeFee = useMemo(() => {
    return new BigNumber(Order.pay).times(COMMISSION_FEE).toString()
  }, [Order.pay])

  const totalPay = useMemo(() => {
    let pay = new BigNumber(Order.pay).plus(new BigNumber(tradeFee))
    if (buyer === 'CKB') {
      pay = pay.plus(new BigNumber(transactionFee))
    }
    return pay.toString()
  }, [Order.pay, buyer, tradeFee, transactionFee])

  const lockedCkbAmount = useMemo(() => {
    if (Order.tx) {
      const [orderOutput] = Order.tx.raw.outputs
      return orderOutput.capacity.toString(AmountUnit.ckb)
    }
    return '0'
  }, [Order.tx])

  const totalPayList = useMemo(() => {
    const list: Item[] = [
      {
        desc: i18n.t(`trade.totalPay`),
        value: totalPay,
        unit: buyer,
      },
    ]

    if (Order.tx && Order.orderType === OrderType.Sell) {
      list.push({
        desc: '',
        value: new Amount(ORDER_CELL_CAPACITY.toString())
          .add(new Amount(transactionFee))
          .add(new Amount(`${MAX_TRANSACTION_FEE}`))
          .toString(),
        unit: 'CKB',
      })
    }

    return list
  }, [Order.orderType, totalPay, Order.tx, buyer, transactionFee])

  const tradeDetails = useMemo(() => {
    const list: Item[] = [
      {
        desc: i18n.t('trade.result.trade'),
        value: Order.pay,
        unit: buyer,
      },
      {
        desc: i18n.t('trade.result.tradeFee'),
        value: tradeFee,
        unit: buyer,
      },
      {
        desc: i18n.t('trade.result.transactionFee'),
        value: transactionFee,
        unit: 'CKB',
      },
    ]
    return list
  }, [tradeFee, buyer, transactionFee, Order.pay])

  const payDetail = useMemo(() => {
    const list: Item[] = [
      {
        desc: i18n.t(`trade.price`),
        value: Order.price,
        unit: `${seller} per ${buyer}`,
      },
    ]

    return list
  }, [Order.price, seller, buyer])

  const receiveDetail = useMemo(() => {
    const list: Item[] = [
      {
        desc: i18n.t(`trade.result.receive`),
        value: Order.receive,
        unit: seller,
      },
    ]

    return list
  }, [Order.receive, seller])

  return (
    <TradePairConfirmBox>
      <Header />
      <TradePairConfirmContent>
        <Pairs pairs={Order.pair} />
        <Divider />
        <OrderResult>
          <List list={totalPayList} />
          <List list={tradeDetails} isDeatil />
          <Meta amount={lockedCkbAmount} />
          <List list={payDetail} />
          <Divider style={{ margin: '20px 0' }} />
          <List list={receiveDetail} />
        </OrderResult>
      </TradePairConfirmContent>
      <Footer>
        <ConfirmButton
          onClick={onConfirm}
          disabled={disabled}
          loading={disabled}
          text={i18n.t(`trade.confirmOrder`)}
          bgColor={Order.confirmButtonColor}
        />
      </Footer>
    </TradePairConfirmBox>
  )
}
