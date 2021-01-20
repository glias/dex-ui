import React, { useState, useCallback, useEffect } from 'react'
import PWCore, { Transaction } from '@lay2/pw-core'
import { useContainer } from 'unstated-next'
import ConfirmButton from 'components/ConfirmButton'
import HeaderWithGoback from 'components/HeaderWithGoback'
import { Divider, Modal } from 'antd'
import { SUDT_LIST } from 'constants/sudt'
import { DEFAULT_PAY_DECIMAL } from 'constants/number'
import { CrossChainOrder, CrossChainOrderStatus } from 'APIs'
import { TradePairConfirmBox, TradePairConfirmContent, Footer } from './styled'
import i18n from '../../../../utils/i18n'
import OrderContainer, { OrderMode, OrderStep, OrderType } from '../../../../containers/order'
import type { SubmittedOrder } from '../../../../containers/order'
import WalletContainer from '../../../../containers/wallet'
import {
  calcAskReceive,
  calcBidReceive,
  calcCrossOutFee,
  displayPayOrReceive,
  // removeTrailingZero,
} from '../../../../utils/fee'
import { relayEthTxHash, spentCells } from '../../../../utils'
import { Pairs } from './pairs'
import CrossChain from './CrossChain'
import CrossIn from './CrossIn'
import CrossOut from './CrossOut'
import NormalOrder from './NormalOrder'

export default function TradePairConfirm() {
  const Wallet = useContainer(WalletContainer)
  const Order = useContainer(OrderContainer)
  const [disabled, setDisabled] = useState(false)
  const {
    setStep,
    setTxHash,
    setAndCacheSubmittedOrders,
    pay,
    price,
    orderType,
    setAndCacheCrossChainOrders,
    pair,
    reset,
  } = Order
  const [firstToken, secondToken] = pair
  const { reloadWallet, ethWallet, web3, connectStatus } = Wallet

  useEffect(() => {
    if (connectStatus === 'disconnected' || connectStatus === 'connecting') {
      setDisabled(false)
      reset()
      setStep(OrderStep.Order)
    }
  }, [connectStatus, reset, setStep])

  // eslint-disable-next-line
  const placeCrossChain = useCallback<(tx: any, cb: (hash: string) => Promise<void>) => Promise<string>>(
    (tx: any, callback) => {
      // eslint-disable-next-line no-param-reassign
      delete tx.gas_price
      // eslint-disable-next-line no-param-reassign
      delete tx.nonce

      return new Promise((resolve, reject) => {
        Wallet.web3!.eth.sendTransaction({
          ...tx,
          from: Wallet.ethWallet.address,
        })
          .once('transactionHash', async hash => {
            await callback(hash)
            if (OrderMode.CrossChain === Order.orderMode) {
              const submittedOrder: SubmittedOrder = {
                key: `${hash}:0x0`,
                isBid: false,
                status: 'pending',
                pay,
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
                amount: displayPayOrReceive(pay, true),
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
      const sudt = SUDT_LIST.find(s => s.info?.symbol === secondToken)
      const submittedOrder: SubmittedOrder = {
        key: `${txHash}:0x0`,
        isBid,
        status: 'pending',
        pay,
        receive: receiveCalc(pay, price, sudt?.info?.decimals ?? DEFAULT_PAY_DECIMAL),
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
    [setStep, setTxHash, setAndCacheSubmittedOrders, pay, price, Wallet.pw, orderType, Order.pair, secondToken],
  )

  const burn = useCallback(
    async (tx: Transaction) => {
      const txHash = await Wallet.pw!.sendTransaction(tx)
      spentCells.add(tx.raw.inputs.map(input => input.previousOutput.serializeJson()) as any)
      const crossChainOrder: CrossChainOrder = {
        tokenName: firstToken.slice(2),
        amount: displayPayOrReceive(calcCrossOutFee(pay), true),
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
          await placeCrossChain(tx, async (txHash: string) => {
            relayEthTxHash.add(txHash)
            setTxHash(txHash)
            setStep(OrderStep.Result)
          })
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
          text={Order.isCrossChainOnly ? i18n.t(`trade.confirm`) : i18n.t(`trade.confirmOrder`)}
          bgColor={Order.confirmButtonColor}
        />
      </Footer>
    </TradePairConfirmBox>
  )
}
