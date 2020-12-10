/* eslint-disable operator-linebreak */
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Form, Tooltip, Modal, Input, Divider } from 'antd'
import { FormInstance } from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import Token from 'components/Token'
import { Address, Amount, AddressType, AmountUnit } from '@lay2/pw-core'
import { useContainer } from 'unstated-next'
import ConfirmButton from 'components/ConfirmButton'
import { removeTrailingZero, toFormatWithoutTrailingZero } from 'utils/fee'
import { placeCrossChainOrder, shadowAssetCrossIn, shadowAssetCrossOut } from 'APIs'
import {
  PRICE_DECIMAL,
  SUDT_DECIMAL,
  ORDER_CELL_CAPACITY,
  MAX_TRANSACTION_FEE,
  // MINIUM_RECEIVE,
  ERC20_LIST,
  SUDT_LIST,
} from '../../../../constants'
import i18n from '../../../../utils/i18n'
import {
  OrderTableContainer,
  PayMeta,
  Header,
  PairContainer,
  PairsContainer,
  Swap,
  PriceContainer,
  PriceUnit,
} from './styled'
import OrderContainer, { OrderMode, OrderStep, OrderType } from '../../../../containers/order'
import WalletContainer from '../../../../containers/wallet'
import PlaceOrderBuilder from '../../../../pw/placeOrderBuilder'
import DEXCollector from '../../../../pw/dexCollector'
import { ReactComponent as SelectTokenSVG } from '../../../../assets/svg/select-token.svg'
import { ReactComponent as SwapTokenSVG } from '../../../../assets/svg/swap-token.svg'
import { ReactComponent as ArrowTradeSvg } from '../../../../assets/svg/arrow-trade.svg'

// eslint-disable-next-line
type ElementOnClick = (event: React.MouseEvent<any, MouseEvent>) => void

const Pair = ({ tokenName, onClick }: { tokenName: string; onClick: ElementOnClick }) => {
  return (
    <PairContainer onClick={onClick}>
      <div className="left">
        <Token tokenName={tokenName} />
      </div>
      <div className="right">
        <SelectTokenSVG />
      </div>
    </PairContainer>
  )
}
interface PairsProps {
  pairs: [string, string]
  onSwap: ElementOnClick
  onSelect: ElementOnClick
}

const Pairs = ({ onSwap, pairs, onSelect }: PairsProps) => {
  const [buyer, seller] = pairs
  const Order = useContainer(OrderContainer)
  const disabled = useMemo(() => {
    if ((buyer === 'ETH' || ERC20_LIST.some(e => e.tokenName === buyer)) && seller === 'CKB') {
      return true
    }
    return false
  }, [buyer, seller])
  return (
    <PairsContainer>
      <div className="pairs">
        <Pair
          onClick={e => {
            Order.setSelectingToken('first')
            Order.setCurrentPairToken(buyer)
            onSelect(e)
          }}
          tokenName={buyer}
        />
        <Divider style={{ margin: '14px 0' }} />
        <Pair
          onClick={e => {
            Order.setSelectingToken('second')
            Order.setCurrentPairToken(seller)
            onSelect(e)
          }}
          tokenName={seller}
        />
      </div>
      <Swap>
        <SwapTokenSVG
          onClick={e => {
            if (disabled) {
              return
            }
            onSwap(e)
          }}
          className={disabled ? 'disabled' : ''}
        />
      </Swap>
    </PairsContainer>
  )
}

export default function OrderTable() {
  const [form] = Form.useForm()
  const Wallet = useContainer(WalletContainer)
  const Order = useContainer(OrderContainer)
  const { price, pay, setPrice, setPay, receive: originalReceive, setStep } = Order
  const formRef = React.createRef<FormInstance>()
  const [buyer, seller] = Order.pair
  const [collectingCells, setCollectingCells] = useState(false)
  const [isPayInvalid, setIsPayInvalid] = useState(true)
  const [isPriceInvalid, setIsPriceInvalid] = useState(true)
  const { web3, ethWallet } = Wallet

  const isCrossInOrOut = useMemo(() => {
    return Order.orderMode === OrderMode.CrossIn || Order.orderMode === OrderMode.CrossOut
  }, [Order.orderMode])

  const disabled = useMemo(() => {
    if (isCrossInOrOut) {
      return isPayInvalid
    }
    return isPayInvalid || isPriceInvalid
  }, [isPayInvalid, isPriceInvalid, isCrossInOrOut])

  const formatedReceive = useMemo(() => {
    if (isCrossInOrOut) {
      return toFormatWithoutTrailingZero(Order.pay)
    }
    return originalReceive === '0' ? '' : toFormatWithoutTrailingZero(originalReceive)
  }, [originalReceive, isCrossInOrOut, Order.pay])

  const changePair = useCallback(() => {
    Order.togglePair()
    form.resetFields()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formRef, form, Order.togglePair])

  const isBid = useMemo(() => {
    return Order.orderType === OrderType.Bid
  }, [Order.orderType])

  const MIN_VAL = isBid ? SUDT_DECIMAL : PRICE_DECIMAL

  const walletNotConnected = useMemo(() => {
    return !Wallet.ckbWallet.address
  }, [Wallet.ckbWallet.address])

  const ckbBalance = useMemo(() => {
    return Wallet.ckbWallet.balance.toString()
  }, [Wallet.ckbWallet.balance])

  const insufficientCKB = useMemo(() => {
    return (
      new BigNumber(ckbBalance).minus(ORDER_CELL_CAPACITY).minus(MAX_TRANSACTION_FEE).isLessThanOrEqualTo(0) &&
      Order.orderMode === OrderMode.Order
    )
  }, [ckbBalance, Order.orderMode])

  const maxPay = useMemo(() => {
    const p = new BigNumber(Order.maxPay)
    if (p.isLessThan(0)) {
      return '0'
    }

    return removeTrailingZero(p.toFixed(8, 1))
  }, [Order.maxPay])

  useEffect(() => {
    if (insufficientCKB) {
      return
    }
    // eslint-disable-next-line no-unused-expressions
    formRef.current?.setFieldsValue({
      receive: formatedReceive,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatedReceive, insufficientCKB])

  useEffect(() => {
    if (insufficientCKB) {
      return
    }
    // eslint-disable-next-line no-unused-expressions
    formRef.current?.setFieldsValue({
      price,
    })
    if (price) {
      setIsPriceInvalid(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, insufficientCKB])

  const setMaxPay = useCallback(() => {
    if (insufficientCKB) {
      return
    }
    const max = removeTrailingZero(new BigNumber(maxPay).toFixed(8, 1))
    setPay(max)
    // eslint-disable-next-line no-unused-expressions
    formRef.current?.setFieldsValue({
      pay: max,
    })
    setIsPayInvalid(false)
  }, [maxPay, formRef, setPay, insufficientCKB])

  const checkPay = useCallback(
    (_: any, value: string): Promise<void> => {
      const val = new BigNumber(value)
      const decimal = 8

      if (val.isLessThan(0)) {
        setIsPayInvalid(true)
        return Promise.reject(i18n.t(`trade.greaterThanZero`))
      }

      if (Number.isNaN(parseFloat(value))) {
        setIsPayInvalid(true)
        return Promise.reject(i18n.t(`trade.unEffectiveNumber`))
      }

      if (!new BigNumber(val).decimalPlaces(decimal).isEqualTo(val)) {
        setIsPayInvalid(true)
        return Promise.reject(i18n.t(`trade.maximumDecimal`, { decimal }))
      }

      if (new BigNumber(value).gt(maxPay)) {
        setIsPayInvalid(true)
        return Promise.reject(i18n.t('trade.lessThanMax'))
      }

      setIsPayInvalid(false)

      return Promise.resolve()
    },
    [maxPay],
  )

  const checkPrice = useCallback(
    (_: any, value: string) => {
      const val = new BigNumber(value)
      const decimal = 8

      if (Number.isNaN(parseFloat(value))) {
        setIsPriceInvalid(true)
        return Promise.reject(i18n.t(`trade.unEffectiveNumber`))
      }

      if (val.isLessThan(0)) {
        setIsPriceInvalid(true)
        return Promise.reject(i18n.t(`trade.greaterThanZero`))
      }

      if (!val.multipliedBy(`${MIN_VAL}`).isGreaterThan(0.1)) {
        setIsPriceInvalid(true)
        return Promise.reject(i18n.t(`trade.tooSmallNumber`))
      }

      if (!new BigNumber(val).decimalPlaces(decimal).isEqualTo(val)) {
        setIsPriceInvalid(true)
        return Promise.reject(i18n.t(`trade.maximumDecimal`, { decimal }))
      }

      setIsPriceInvalid(false)

      return Promise.resolve()
    },
    [MIN_VAL],
  )

  const checkReceive = useCallback(() => {
    // if (new BigNumber(Order.receive).isLessThan(MINIUM_RECEIVE)) {
    //   return Promise.reject(i18n.t('trade.miniumReceive'))
    // }

    return Promise.resolve()
  }, [])

  const submitStatus = useMemo(() => {
    if (Wallet.connecting) {
      return i18n.t('header.connecting')
    }

    return i18n.t('trade.placeOrder')
  }, [Wallet.connecting])

  useEffect(() => {
    Order.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Order.step])

  const isNormalOrder = useMemo(() => OrderMode.Order === Order.orderMode, [Order.orderMode])

  const { shouldApprove, approveERC20, approveText, isApproving, currentERC20 } = Order

  const approve = useCallback(() => {
    if (currentERC20 && web3 && ethWallet.address) {
      approveERC20(currentERC20.tokenName, ethWallet.address, web3)
    }
  }, [currentERC20, web3, ethWallet.address, approveERC20])

  const onSubmit = useCallback(async () => {
    if (walletNotConnected) {
      Wallet.connectWallet()
    } else {
      try {
        setCollectingCells(true)
        switch (Order.orderMode) {
          case OrderMode.Order: {
            const sudtTokenName = Order.pair.find(p => p !== 'CKB')!
            const sudt = SUDT_LIST.find(s => s.info?.symbol === sudtTokenName)
            const builder = new PlaceOrderBuilder(
              new Address(Wallet.ckbWallet.address, AddressType.ckb),
              new Amount(Order.pay, OrderType.Ask === Order.orderType ? sudt?.info?.decimals : AmountUnit.ckb),
              Order.orderType,
              Order.price,
              sudt!,
              new DEXCollector() as any,
            )
            const tx = await builder.build()
            Order.setTx(tx)
            break
          }
          case OrderMode.CrossChain: {
            const sudtTokenName = Order.pair.find(p => p !== 'CKB')!
            const sudt = SUDT_LIST.find(s => s.info?.symbol === `ck${sudtTokenName}`)
            const erc20 = ERC20_LIST.find(e => e.tokenName === sudtTokenName)
            const res = await placeCrossChainOrder(
              pay,
              price,
              Order.receive,
              Wallet.ckbWallet.address,
              Wallet.ethWallet.address,
              Wallet.web3!,
              sudt!,
              erc20?.address,
            )
            Order.setTx(res.data)
            break
          }
          case OrderMode.CrossIn: {
            const [erc20TokenName, sudtTokenName] = Order.pair
            const sudt = SUDT_LIST.find(s => s.info?.symbol === sudtTokenName)
            const erc20 = ERC20_LIST.find(e => e.tokenName === erc20TokenName)
            const res = await shadowAssetCrossIn(
              pay,
              Wallet.ckbWallet.address,
              Wallet.ethWallet.address,
              Wallet.web3!,
              erc20?.address,
              sudt?.info?.decimals,
            )
            Order.setTx(res.data)
            break
          }
          case OrderMode.CrossOut: {
            const [sudtTokenName, erc20TokenName] = Order.pair
            const sudt = SUDT_LIST.find(s => s.info?.symbol === sudtTokenName)
            const erc20 = ERC20_LIST.find(e => e.tokenName === erc20TokenName)
            const res = await shadowAssetCrossOut(
              pay,
              Wallet.ckbWallet.address,
              Wallet.ethWallet.address,
              erc20?.address,
              sudt?.info?.decimals,
            )
            Order.setTx(res.data.raw_tx)
            break
          }
          default:
            break
        }
        setStep(OrderStep.Confirm)
      } catch (error) {
        Modal.error({ title: 'Build transaction:\n', content: error.message })
      } finally {
        setCollectingCells(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    setStep,
    walletNotConnected,
    Wallet.connectWallet,
    Order.setTx,
    Order.price,
    Order.pay,
    Order.orderType,
    isNormalOrder,
    Wallet.ckbWallet.address,
    Wallet.ethWallet.address,
    Wallet.web3,
    Order.receive,
  ])

  const onPairSelect = useCallback(() => {
    if (!Wallet.connecting) {
      setStep(OrderStep.Select)
    }
  }, [Wallet.connecting, setStep])

  const { createBridgeCell, getBridgeCell, lockHash } = Wallet

  const [reactor, setReactor] = useState(0)

  const ethAddress = '0x0000000000000000000000000000000000000000'

  const isRelaying = useMemo(() => {
    if (Order.orderMode !== OrderMode.CrossChain && Order.orderMode !== OrderMode.CrossIn) {
      return false
    }
    const [firstToken, secondToken] = Order.pair
    const isFirstTokenERC20 = ERC20_LIST.some(e => e.tokenName === firstToken)
    const tokenAddress = ERC20_LIST.find(e => e.tokenName === firstToken)?.address ?? ethAddress
    const isERC20CrossIn =
      isFirstTokenERC20 && secondToken === `ck${ERC20_LIST.find(e => e.tokenName === firstToken)?.tokenName}`
    if ((firstToken === 'ETH' || isFirstTokenERC20) && secondToken === 'CKB') {
      const bridgeCell = getBridgeCell(tokenAddress, 'cross-order')
      return !bridgeCell
    }
    if ((firstToken === 'ETH' && secondToken === 'ckETH') || isERC20CrossIn) {
      const bridgeCell = getBridgeCell(tokenAddress, 'cross-in')
      return !bridgeCell
    }
    return false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Order.orderMode, Order.pair, reactor, getBridgeCell])

  useEffect(() => {
    const [firstToken, secondToken] = Order.pair
    const isFirstTokenERC20 = ERC20_LIST.some(e => e.tokenName === firstToken)
    const tokenAddress = ERC20_LIST.find(e => e.tokenName === firstToken)?.address ?? ethAddress
    const isERC20CrossIn =
      isFirstTokenERC20 && secondToken === `ck${ERC20_LIST.find(e => e.tokenName === firstToken)?.tokenName}`
    if ((firstToken === 'ETH' || isFirstTokenERC20) && secondToken === 'CKB') {
      createBridgeCell(tokenAddress, 'cross-order', () => setReactor(Math.random()))
    }
    if ((firstToken === 'ETH' && secondToken === 'ckETH') || isERC20CrossIn) {
      createBridgeCell(tokenAddress, 'cross-in', () => setReactor(Math.random()))
    }
  }, [Order.pair, createBridgeCell])

  const [firstToken, secondToken] = Order.pair

  return (
    <OrderTableContainer id="order-box" isBid={isBid}>
      <Form form={form} ref={formRef} autoComplete="off" name="traceForm" layout="vertical" onFinish={onSubmit}>
        <Header>
          <h3>{i18n.t('trade.trade')}</h3>
        </Header>
        {isRelaying && lockHash && disabled ? (
          <span className="alert">{i18n.t('trade.relaying', { t1: firstToken, t2: secondToken })}</span>
        ) : null}
        {insufficientCKB && Wallet.ckbWallet.address && disabled ? (
          <span className="alert">{i18n.t('trade.insufficientAmount')}</span>
        ) : null}
        <Pairs onSelect={onPairSelect} pairs={Order.pair} onSwap={changePair} />
        <Form.Item label={i18n.t('trade.pay')}>
          <PayMeta>
            <button type="button" onClick={setMaxPay}>
              {`${i18n.t('trade.max')}: ${maxPay}`}
            </button>
            <Tooltip title={i18n.t('trade.maxPay')}>
              <i className="ai-question-circle-o" />
            </Tooltip>
          </PayMeta>
          <Form.Item
            name="pay"
            noStyle
            rules={[
              {
                validator: checkPay,
                validateTrigger: ['onChange', 'onBlur'],
              },
            ]}
          >
            <Input
              placeholder="0"
              suffix={buyer}
              type="number"
              required
              size="large"
              disabled={insufficientCKB || isRelaying}
              step="any"
              value={pay}
              onChange={e => setPay(e.target.value)}
              max={Order.maxPay}
            />
          </Form.Item>
        </Form.Item>
        {isCrossInOrOut ? null : (
          <Form.Item
            label={i18n.t('trade.price')}
            name="price"
            rules={[
              {
                validator: checkPrice,
              },
            ]}
          >
            <PriceContainer>
              <PriceUnit>
                <div className="one">1</div>
                <div className="unit">{Order.currentSudtTokenName}</div>
                <ArrowTradeSvg />
              </PriceUnit>
              <div className="input">
                <Input
                  placeholder="0"
                  suffix="CKB"
                  size="large"
                  disabled={insufficientCKB || isRelaying}
                  required
                  width="211px"
                  type="number"
                  step="any"
                  onChange={e => setPrice(e.target.value)}
                  value={price}
                />
              </div>
            </PriceContainer>
          </Form.Item>
        )}
        <Divider />
        <Form.Item label={i18n.t('trade.receive')} name="receive" rules={[{ validator: checkReceive }]}>
          <Input
            className="receive"
            placeholder="0.00"
            suffix={seller}
            size="large"
            required
            type="text"
            step="any"
            disabled
            readOnly
          />
        </Form.Item>
        <Form.Item className="submit">
          {shouldApprove ? (
            <ConfirmButton
              htmlType="button"
              text={approveText}
              loading={isApproving}
              disabled={isApproving}
              onClick={() => approve()}
            />
          ) : (
            <ConfirmButton
              text={submitStatus}
              bgColor={Order.confirmButtonColor}
              loading={collectingCells || Wallet.connecting}
              disabled={disabled || insufficientCKB}
            />
          )}
        </Form.Item>
      </Form>
    </OrderTableContainer>
  )
}
