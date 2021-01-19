import React, { useCallback } from 'react'
import { useContainer } from 'unstated-next'
import SelectToken from 'components/SelectToken'
import { SUDT_LIST } from 'constants/sudt'
import { Wallet } from 'containers/wallet'
import { useDidMount } from 'hooks'
import { setForceBridgeServer, ERC20_LIST } from 'constants/erc20'
import TradeOrderTable from './components/TradeOrderTable'
import History from './components/History'
import TradeOrderConfirm from './components/TradeOrderConfirm'
import TradeOrderResult from './components/TradeOrderResult'
import TradePriceTable from './components/TradePriceTable'
import { TradePage, TradeMain, TradeFrame, TradeContainer, OrderBookFrame } from './styled'
import OrderContainer, { OrderStep } from '../../containers/order'
import { getForceBridgeSettings, relayEthToCKBForerver } from '../../APIs'

const Trade = () => {
  const Order = useContainer(OrderContainer)

  const { selectingToken, setBuyerToken, setSellerToken, setStep, togglePair } = Order
  const [buyerToken, sellerToken] = Order.pair

  const onFirstTokenSelect = useCallback(
    (selectedToken: string) => {
      const isSelectingSUDT = SUDT_LIST.some(
        sudt => sudt.info?.symbol === selectedToken && !selectedToken.startsWith('ck'),
      )
      const isSelectingShadowERC20 = selectedToken.startsWith('ck')
      const isBuyerERC20 = ERC20_LIST.some(e => e.tokenName === buyerToken)
      const isSellerERC20 = ERC20_LIST.some(e => e.tokenName === sellerToken)
      const isSelectingERC20 = ERC20_LIST.some(e => e.tokenName === selectedToken)

      switch (selectedToken) {
        case sellerToken:
          if (selectedToken === 'CKB' && (buyerToken === 'ETH' || isBuyerERC20)) {
            setBuyerToken('CKB')
            setSellerToken(`ck${buyerToken}`)
          } else {
            togglePair()
          }
          break
        case 'CKB':
          if (sellerToken === 'ETH' || isSellerERC20) {
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
          } else if (isSelectingShadowERC20) {
            if (sellerToken === 'CKB' || sellerToken.slice(2) === selectedToken) {
              setBuyerToken(selectedToken)
            } else {
              setBuyerToken(selectedToken)
              setSellerToken('CKB')
            }
          } else if (isSelectingERC20) {
            if (sellerToken === `ck${selectedToken}` || sellerToken === 'CKB') {
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
      const isBuyerERC20 = ERC20_LIST.some(e => e.tokenName === buyerToken)
      const isSelectingERC20 = ERC20_LIST.some(e => e.tokenName === selectedToken)
      if (selectedToken === buyerToken) {
        togglePair()
      } else if (selectedToken === 'CKB' && (isBuyerETH || isBuyerERC20)) {
        setBuyerToken(sellerToken)
        setSellerToken('CKB')
      } else if ((selectedToken === 'ETH' || isSelectingERC20) && buyerToken === 'CKB') {
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
      const isBuyerShadowAssert = SUDT_LIST.some(
        sudt => sudt.info?.symbol.startsWith('ck') && sudt.info?.symbol === buyerToken,
      )
      const isCurrentCKB = wallet.tokenName === 'CKB'
      const isSwapable = buyerToken === wallet.tokenName
      const isBuyerERC20 = ERC20_LIST.some(e => e.tokenName === buyerToken)

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
          if (isBuyerERC20) {
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
            groupedByChain
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

    relayEthToCKBForerver()
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
