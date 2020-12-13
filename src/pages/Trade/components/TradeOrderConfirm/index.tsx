import React, { useState, useCallback, useEffect } from 'react'
import PWCore, { Transaction } from '@lay2/pw-core'
import { useContainer } from 'unstated-next'
import ConfirmButton from 'components/ConfirmButton'
import HeaderWithGoback from 'components/HeaderWithGoback'
import { Divider, Modal } from 'antd'
import { CrossChainOrder, CrossChainOrderStatus, relayEthToCKB } from 'APIs'
import { TradePairConfirmBox, TradePairConfirmContent, Footer } from './styled'
import i18n from '../../../../utils/i18n'
import OrderContainer, { OrderMode, OrderStep, OrderType } from '../../../../containers/order'
import type { SubmittedOrder } from '../../../../containers/order'
import WalletContainer from '../../../../containers/wallet'
import {
  calcAskReceive,
  calcBidReceive,
  calcCrossOutFee,
  calcTotalPay,
  removeTrailingZero,
} from '../../../../utils/fee'
import { spentCells } from '../../../../utils'
import { Pairs } from './pairs'
import CrossChain from './CrossChain'
import CrossIn from './CrossIn'
import CrossOut from './CrossOut'
import NormalOrder from './NormalOrder'

export default function TradePairConfirm() {
  const Wallet = useContainer(WalletContainer)
  const Order = useContainer(OrderContainer)
  const [disabled, setDisabled] = useState(false)
  const { address } = Wallet.ckbWallet
  const {
    setStep,
    setTxHash,
    setAndCacheSubmittedOrders,
    pay,
    price,
    orderType,
    setAndCacheCrossChainOrders,
    pair,
  } = Order
  const [firstToken] = pair
  const { reloadWallet, ethWallet, web3 } = Wallet

  useEffect(() => {
    if (address === '') {
      setDisabled(false)
      Order.reset()
      Order.setStep(OrderStep.Order)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  // eslint-disable-next-line
  const placeCrossChain = useCallback<(tx: any) => Promise<string>>(
    (tx: any) => {
      // eslint-disable-next-line no-param-reassign
      delete tx.gas_price
      // eslint-disable-next-line no-param-reassign
      delete tx.nonce

      return new Promise((resolve, reject) => {
        Wallet.web3!.eth.sendTransaction({
          ...tx,
          from: Wallet.ethWallet.address,
        })
          .once('transactionHash', hash => {
            if (OrderMode.CrossChain === Order.orderMode) {
              const submittedOrder: SubmittedOrder = {
                key: `${hash}:0x0`,
                isBid: false,
                status: 'pending',
                pay: calcTotalPay(pay),
                receive: calcAskReceive(pay, price),
                price,
                executed: '0%',
                createdAt: `${Date.now()}`,
                tokenName: Order.pair.find(t => t !== 'CKB')! ?? '',
                orderCells: [
                  { tx_hash: hash!, index: '' },
                  { tx_hash: '', index: '' },
                ],
              }
              setAndCacheSubmittedOrders(orders => [submittedOrder, ...orders])
            }
            if (OrderMode.CrossIn === Order.orderMode) {
              const crossChainOrder: CrossChainOrder = {
                tokenName: firstToken,
                amount: pay,
                timestamp: `${Date.now()}`,
                ckbTxHash: '',
                ethTxHash: hash,
                status: CrossChainOrderStatus.ConfirmInETH,
                isLock: true,
              }
              setAndCacheCrossChainOrders(orders => [crossChainOrder, ...orders])
            }
            resolve(hash)
          })
          .on('error', err => {
            reject(err)
          })
      })
    },
    [
      Wallet.ethWallet.address,
      setAndCacheSubmittedOrders,
      pay,
      price,
      Order.pair,
      Wallet.web3,
      Order.orderMode,
      firstToken,
      setAndCacheCrossChainOrders,
    ],
  )

  const placeNormalOrder = useCallback(
    async (tx: Transaction) => {
      const txHash = await Wallet.pw?.sendTransaction(tx)
      spentCells.add(tx.raw.inputs.map(input => input.previousOutput.serializeJson()) as any)

      const isBid = orderType === OrderType.Bid
      const receiveCalc = isBid ? calcBidReceive : calcAskReceive

      const submittedOrder: SubmittedOrder = {
        key: `${txHash}:0x0`,
        isBid,
        status: 'pending',
        pay: calcTotalPay(pay),
        receive: receiveCalc(pay, price),
        price,
        executed: '0%',
        createdAt: `${Date.now()}`,
        tokenName: Order.pair.find(t => t !== 'CKB')! ?? '',
        orderCells: [{ tx_hash: txHash!, index: '' }],
      }
      setAndCacheSubmittedOrders(orders => [submittedOrder, ...orders])
      setTxHash(txHash!)
      setStep(OrderStep.Result)
    },
    [setStep, setTxHash, setAndCacheSubmittedOrders, pay, price, Wallet.pw, orderType, Order.pair],
  )

  const burn = useCallback(
    async (tx: Transaction) => {
      const txHash = await Wallet.pw!.sendTransaction(tx)
      const crossChainOrder: CrossChainOrder = {
        tokenName: firstToken.slice(2),
        amount: removeTrailingZero(calcCrossOutFee(pay)),
        timestamp: `${Date.now()}`,
        ckbTxHash: txHash,
        ethTxHash: '',
        status: CrossChainOrderStatus.ConfirmInCKB,
        isLock: false,
      }
      setAndCacheCrossChainOrders(orders => [crossChainOrder, ...orders])
      setTxHash(txHash!)
      setStep(OrderStep.Result)
    },
    [Wallet.pw, setTxHash, setStep, setAndCacheCrossChainOrders, firstToken, pay],
  )

  const onConfirm = useCallback(async () => {
    setDisabled(true)
    try {
      const tx = Order.tx!
      switch (Order.orderMode) {
        case OrderMode.CrossChain:
        case OrderMode.CrossIn: {
          const txHash = await placeCrossChain(tx)
          await relayEthToCKB(txHash)
          setTxHash(txHash)
          setStep(OrderStep.Result)
          break
        }
        case OrderMode.CrossOut: {
          await burn(tx)
          break
        }
        case OrderMode.Order: {
          await placeNormalOrder(tx)
          break
        }
        default:
          break
      }

      reloadWallet(PWCore.provider.address.toCKBAddress(), ethWallet.address, web3!)
    } catch (error) {
      Modal.error({ title: 'Submission Error', content: error.message })
    } finally {
      setDisabled(false)
    }
  }, [
    reloadWallet,
    Order.tx,
    placeCrossChain,
    placeNormalOrder,
    Order.orderMode,
    setStep,
    setTxHash,
    burn,
    ethWallet.address,
    web3,
  ])

  const result: Record<OrderMode, JSX.Element> = {
    [OrderMode.Order]: <NormalOrder />,
    [OrderMode.CrossChain]: <CrossChain />,
    [OrderMode.CrossIn]: <CrossIn />,
    [OrderMode.CrossOut]: <CrossOut />,
  }

  return (
    <TradePairConfirmBox>
      <HeaderWithGoback title={i18n.t(`trade.reviewOrder`)} onClick={() => Order.setStep(OrderStep.Order)} />
      <TradePairConfirmContent>
        <Pairs pairs={Order.pair} />
        <Divider />
        {result[Order.orderMode]}
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
