import React, { useCallback, useEffect, useRef } from 'react'
import { useContainer } from 'unstated-next'
import SelectToken from 'components/SelectToken'
import { SUDT_LIST, ERC20_LIST } from 'constants/sudt'
import { Wallet } from 'containers/wallet'
import { useDidMount } from 'hooks'
import { setForceBridgeServer } from 'constants/erc20'
import TradeOrderTable from './components/TradeOrderTable'
import History from './components/History'
import TradeOrderConfirm from './components/TradeOrderConfirm'
import TradeOrderResult from './components/TradeOrderResult'
import TradePriceTable from './components/TradePriceTable'
import { TradePage, TradeMain, TradeFrame, TradeContainer, OrderBookFrame } from './styled'
import OrderContainer, { OrderStep } from '../../containers/order'
import { checkSubmittedTxs, getForceBridgeSettings } from '../../APIs'

const Trade = () => {
  const Order = useContainer(OrderContainer)
  const submittedOrderTimer = useRef<ReturnType<typeof setInterval> | undefined>()

  const { submittedOrders, setAndCacheSubmittedOrders } = Order
  useEffect(() => {
    const INTERVAL_TIME = 3000
    submittedOrderTimer.current = setInterval(() => {
      const hashes = submittedOrders.map(o => o.key.split(':')[0])
      if (!hashes.length) {
        return
      }
      checkSubmittedTxs(hashes).then(resList => {
        const unconfirmedHashes = hashes.filter((_, i) => !resList[i])
        setAndCacheSubmittedOrders(orders =>
          orders.filter(order => unconfirmedHashes.includes(order.key.split(':')[0])),
        )
      })
    }, INTERVAL_TIME)

    return () => {
      if (submittedOrderTimer.current) {
        clearInterval(submittedOrderTimer.current)
      }
    }
  }, [submittedOrderTimer, submittedOrders, setAndCacheSubmittedOrders])

  const { selectingToken, setBuyerToken, setSellerToken, setStep, togglePair } = Order
  const [buyerToken, sellerToken] = Order.pair

  const onFirstTokenSelect = useCallback(
    (selectedToken: string) => {
      const isSelectingSUDT = SUDT_LIST.some(
        sudt => sudt.info?.symbol === selectedToken && !selectedToken.startsWith('ck'),
      )
      const isSelecttingERC20 = selectedToken.startsWith('ck')

      switch (selectedToken) {
        case sellerToken:
          if (selectedToken === 'CKB' && (buyerToken === 'ETH' || ERC20_LIST.includes(buyerToken))) {
            setBuyerToken('CKB')
            setSellerToken(`ck${buyerToken}`)
          } else {
            togglePair()
          }
          break
        case 'CKB':
          if (sellerToken === 'ETH' || ERC20_LIST.includes(sellerToken)) {
            setBuyerToken(sellerToken)
            setSellerToken('CKB')
          } else {
            setBuyerToken(selectedToken)
          }
          break
        case 'ETH':
          if (sellerToken === 'ckETH' || sellerToken === 'CKB') {
            setBuyerToken(selectedToken)
          } else {
            setBuyerToken(selectedToken)
            setSellerToken('CKB')
          }
          break
        default: {
          if (isSelectingSUDT) {
            if (sellerToken === 'CKB') {
              setBuyerToken(selectedToken)
            } else {
              setBuyerToken(selectedToken)
              setSellerToken('CKB')
            }
          } else if (isSelecttingERC20) {
            if (sellerToken === 'CKB' || sellerToken.slice(2) === selectedToken) {
              setBuyerToken(selectedToken)
            } else {
              setBuyerToken(selectedToken)
              setSellerToken('CKB')
            }
          } else if (selectedToken.startsWith('ck')) {
            if (sellerToken === 'CKB' || sellerToken === selectedToken.slice(2)) {
              setBuyerToken(selectedToken)
            } else {
              setBuyerToken(selectedToken)
              setSellerToken('CKB')
            }
          }
          break
        }
      }
    },
    [togglePair, sellerToken, setBuyerToken, setSellerToken, buyerToken],
  )

  const onSecondTokenSelect = useCallback(
    (selectedToken: string) => {
      const isBuyerETH = buyerToken === 'ETH'
      const isBuyerERC20 = ERC20_LIST.includes(buyerToken)
      if (selectedToken === buyerToken) {
        togglePair()
      } else if (selectedToken === 'CKB' && (isBuyerETH || isBuyerERC20)) {
        setBuyerToken(sellerToken)
        setSellerToken('CKB')
      } else if ((selectedToken === 'ETH' || ERC20_LIST.includes(selectedToken)) && buyerToken === 'CKB') {
        setBuyerToken(selectedToken)
        setSellerToken('CKB')
      } else {
        setSellerToken(selectedToken)
      }
    },
    [sellerToken, buyerToken, setBuyerToken, setSellerToken, togglePair],
  )

  const onTokenSelect = useCallback(
    (wallet: Wallet) => {
      if (selectingToken === 'first') {
        onFirstTokenSelect(wallet.tokenName)
      } else {
        onSecondTokenSelect(wallet.tokenName)
      }
      setStep(OrderStep.Order)
    },
    [onFirstTokenSelect, onSecondTokenSelect, setStep, selectingToken],
  )

  const selectTokenFilter = useCallback(
    (wallet: Wallet) => {
      // for first token, all token can be selected
      if (selectingToken === 'first') {
        return true
      }

      const isBuyerSUDT = SUDT_LIST.some(
        sudt => sudt.info?.symbol === buyerToken && !sudt.info?.symbol.startsWith('ck'),
      )
      const isBuyerShadowAssert = SUDT_LIST.some(sudt => sudt.info?.symbol.startsWith('ck'))
      const isCurrentCKB = wallet.tokenName === 'CKB'
      const isSwapable = buyerToken === wallet.tokenName
      switch (buyerToken) {
        case 'CKB':
          return true
        case 'ETH':
          return wallet.tokenName === 'ckETH' || isCurrentCKB
        default:
          if (isBuyerSUDT) {
            return isCurrentCKB || isSwapable
          }
          if (isBuyerShadowAssert) {
            return wallet.tokenName === buyerToken.slice(2) || isCurrentCKB || isSwapable
          }
          if (ERC20_LIST.includes(buyerToken)) {
            return wallet.tokenName.slice(2) === buyerToken || isCurrentCKB
          }
          break
      }

      return true
    },
    [selectingToken, buyerToken],
  )

  const traceNavigation = () => {
    switch (Order.step) {
      case OrderStep.Order:
        return <TradeOrderTable />
      case OrderStep.Confirm:
        return <TradeOrderConfirm />
      case OrderStep.Select:
        return (
          <SelectToken
            onBack={() => Order.setStep(OrderStep.Order)}
            onSelect={onTokenSelect}
            currentToken={Order.currentPairToken}
            filter={selectTokenFilter}
          />
        )
      default:
        return <TradeOrderResult />
    }
  }

  useDidMount(() => {
    getForceBridgeSettings().then(res => {
      // eslint-disable-next-line no-console
      setForceBridgeServer(res.data)
    })
  })

  return (
    <TradePage className="trade-page">
      <TradeContainer>
        <TradeMain>
          <TradeFrame width="400px">{traceNavigation()}</TradeFrame>
          <OrderBookFrame width="auto">
            <TradePriceTable />
          </OrderBookFrame>
        </TradeMain>
        <History />
      </TradeContainer>
    </TradePage>
  )
}

export default Trade
