import PWCore, { Transaction } from '@lay2/pw-core'
import BigNumber from 'bignumber.js'
import { FormInstance } from 'antd/lib/form'
import { approveERC20ToBridge, CrossChainOrder, getAllowanceForTarget } from 'APIs'
import { useEffect, useState, useMemo, useCallback, createRef } from 'react'
import { createContainer, useContainer } from 'unstated-next'
import Web3 from 'web3'
import {
  ORDER_CELL_CAPACITY,
  MAX_TRANSACTION_FEE,
  COMMISSION_FEE,
  ERC20_LIST,
  CROSS_CHAIN_FEE_RATE,
  SUDT_LIST,
  DEFAULT_PAY_DECIMAL,
} from '../constants'
import { submittedOrders as submittedOrdersCache, crossChainOrders as crossChainOrdersCache } from '../utils'
import type { OrderRecord } from '../utils'
import { calcAskReceive, calcBidReceive, removeTrailingZero } from '../utils/fee'
import WalletContainer from './wallet'

// eslint-disable-next-line no-shadow
export enum OrderStep {
  Order,
  Confirm,
  Select,
  Result,
}

// eslint-disable-next-line no-shadow
export enum ShowStatus {
  Open,
  History,
  CrossChain,
}

// eslint-disable-next-line no-shadow
export enum OrderType {
  Bid = 'Bid',
  Ask = 'Ask',
}
// eslint-disable-next-line no-shadow
export enum OrderMode {
  Order = 'Order',
  CrossChain = 'CrossChain',
  CrossIn = 'CrossIn',
  CrossOut = 'CrossOut',
}

export enum ApproveStatus {
  Init = 'Init',
  Signing = 'Signing',
  Confirming = 'Confirming',
  Finish = 'Finish',
}

const defaultApproveStatus: Record<string, ApproveStatus> = ERC20_LIST.reduce((acc, erc20) => {
  return {
    ...acc,
    [erc20.tokenName]: ApproveStatus.Init,
  }
}, {})

const BID_CONFIRM_COLOR = '#72d1a4'
const ASK_CONFRIM_COLOR = '#ff9a6f'

export interface SubmittedOrder
  extends Pick<OrderRecord, 'isBid' | 'pay' | 'receive' | 'price' | 'key' | 'tokenName' | 'orderCells' | 'executed'> {
  status: 'pending'
  createdAt: string
}

export function useOrder() {
  const Wallet = useContainer(WalletContainer)
  const { ethWallet, sudtWallets, erc20Wallets, web3, isWalletNotConnected } = Wallet
  const [step, setStep] = useState<OrderStep>(OrderStep.Order)
  const [pay, setPay] = useState('')
  const [price, setPrice] = useState('')
  const [txHash, setTxHash] = useState('')
  const [historyOrders, setHistoryOrders] = useState<any[]>([])
  const { address } = Wallet.ckbWallet
  const [submittedOrders, setSubmittedOrders] = useState<Array<SubmittedOrder>>(submittedOrdersCache.get(address))
  const [crossChainOrders, setCrossChainOrders] = useState<Array<CrossChainOrder>>(crossChainOrdersCache.get(address))
  const formRef = createRef<FormInstance>()
  const ckbBalance = Wallet.ckbWallet.free.toString()
  const [maxPay, setMaxPay] = useState(ckbBalance)
  const [bestPrice] = useState('0.00')
  const [tx, setTx] = useState<Transaction | null>(null)
  const [firstToken, setBuyerToken] = useState(() => Wallet.ethWallet.tokenName)
  const [secondToken, setSellerToken] = useState(() => Wallet.ckbWallet.tokenName)
  const [selectingToken, setSelectingToken] = useState<'first' | 'second'>('first')
  const [currentPairToken, setCurrentPairToken] = useState(Wallet.ethWallet.tokenName)
  const [showStatus, setShowStatus] = useState(ShowStatus.Open)

  useEffect(() => {
    if (!address) {
      setSubmittedOrders([])
      setCrossChainOrders([])
    } else {
      setSubmittedOrders(submittedOrdersCache.get(address))
      setCrossChainOrders(crossChainOrdersCache.get(address))
    }
  }, [address, setSubmittedOrders])

  const concatHistoryOrders = useCallback(
    (arr: any[]) => {
      setHistoryOrders(historyOrders.concat(...arr))
    },
    [historyOrders],
  )

  const pair: [string, string] = useMemo(() => {
    return [firstToken, secondToken]
  }, [firstToken, secondToken])

  const orderMode = useMemo(() => {
    const [buyer, seller] = pair
    const sudtWallet = sudtWallets.find(sudt => sudt.tokenName === buyer && !buyer.startsWith('ck'))
    const shadowWallet = sudtWallets.find(sudt => sudt.tokenName === buyer && buyer.startsWith('ck'))
    const erc20Wallet = erc20Wallets.find(erc20 => erc20.tokenName === buyer)
    switch (buyer) {
      case 'CKB':
        return OrderMode.Order
      case 'ETH':
        if (seller.slice(2) === buyer) {
          return OrderMode.CrossIn
        }
        return OrderMode.CrossChain
      default:
        if (sudtWallet) {
          return OrderMode.Order
        }
        if (shadowWallet) {
          if (seller === 'CKB') {
            return OrderMode.Order
          }
          return OrderMode.CrossOut
        }
        if (erc20Wallet) {
          if (seller.slice(2) === buyer) {
            return OrderMode.CrossIn
          }
          return OrderMode.CrossChain
        }
        return OrderMode.Order
    }
  }, [pair, sudtWallets, erc20Wallets])

  const orderType = useMemo(() => {
    const [p1] = pair
    switch (orderMode) {
      case OrderMode.Order:
        if (p1 === 'CKB') {
          return OrderType.Bid
        }
        return OrderType.Ask
      case OrderMode.CrossChain:
        return OrderType.Ask
      case OrderMode.CrossIn:
        return OrderType.Ask
      case OrderMode.CrossOut:
        return OrderType.Bid
      default:
        return OrderType.Bid
    }
  }, [orderMode, pair])

  const ckbMax = useMemo(() => {
    return new BigNumber(Wallet.ckbWallet.free.toString())
      .minus(MAX_TRANSACTION_FEE)
      .minus(ORDER_CELL_CAPACITY)
      .toFixed(8, 1)
  }, [Wallet.ckbWallet.free])

  const togglePair = useCallback(async () => {
    setBuyerToken(secondToken)
    setSellerToken(firstToken)
    setPrice('')
    setPay('')
  }, [firstToken, secondToken])

  const actualPay = useMemo(() => {
    return new BigNumber(pay).times(1 - COMMISSION_FEE).toFixed(8, 1)
  }, [pay])

  const receive = useMemo(() => {
    const [buyToken, seller] = pair

    switch (orderMode) {
      case OrderMode.Order:
        if (!pay || !price) {
          return '0'
        }
        if (buyToken === 'CKB') {
          const sudt = SUDT_LIST.find(s => s.info?.symbol === seller)
          return calcBidReceive(pay, price, sudt?.info?.decimals ?? DEFAULT_PAY_DECIMAL)
        }
        return calcAskReceive(pay, price)
      case OrderMode.CrossChain:
        if (!pay || !price) {
          return '0'
        }
        return calcAskReceive(pay, price)
      case OrderMode.CrossIn:
        if (!pay) {
          return '0'
        }
        return pay
      case OrderMode.CrossOut:
        if (!pay) {
          return '0'
        }
        return new BigNumber(pay).times(1 - CROSS_CHAIN_FEE_RATE).toString()
      default:
        return '0.00'
    }
  }, [price, pay, orderMode, pair])

  const setLoading = useCallback(
    (key: string) => {
      const order = historyOrders.find(o => o.key === key)
      if (order) {
        order.loading = true
        setHistoryOrders(historyOrders)
      }
    },
    [historyOrders],
  )

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  type SubmittedOrdersUpdateFn<T = Array<SubmittedOrder>> = (_: T) => T
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  type crossChainOrdersUpdateFn<T = Array<CrossChainOrder>> = (_: T) => T

  const setAndCacheSubmittedOrders = useCallback(
    (updateFn: SubmittedOrdersUpdateFn) => {
      if (isWalletNotConnected) {
        return
      }
      setSubmittedOrders(orders => {
        const newOrders = updateFn(orders)
        const latestAddress = PWCore.provider?.address?.toCKBAddress?.()
        // If address is not equal to the latest address
        // it is likely that this function was called before the wallet switch.
        if (latestAddress !== address) {
          return orders
        }
        submittedOrdersCache.set(address, newOrders)
        return newOrders
      })
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [address, setSubmittedOrders, isWalletNotConnected],
  )

  const setAndCacheCrossChainOrders = useCallback(
    (updateFn: crossChainOrdersUpdateFn) => {
      if (isWalletNotConnected) {
        return
      }
      setCrossChainOrders(orders => {
        const latestAddress = PWCore.provider?.address?.toCKBAddress?.()
        // If address is not equal to the latest address
        // it is likely that this function was called before the wallet switch.
        if (latestAddress !== address) {
          return orders
        }
        const newOrders = updateFn(orders)
        crossChainOrdersCache.set(address, newOrders)
        return newOrders
      })
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [address, setCrossChainOrders, isWalletNotConnected],
  )

  // TODO: max pay
  useEffect(() => {
    const [buyer, seller] = pair
    const sudtWallet = sudtWallets.find(sudt => sudt.tokenName === buyer && !buyer.startsWith('ck'))
    const shadowWallet = sudtWallets.find(sudt => sudt.tokenName === buyer && buyer.startsWith('ck'))
    const erc20Wallet = erc20Wallets.find(erc20 => erc20.tokenName === buyer)
    switch (buyer) {
      case 'CKB':
        setMaxPay(ckbMax)
        break
      case 'ETH':
        setMaxPay(removeTrailingZero(ethWallet.balance.minus(MAX_TRANSACTION_FEE).toString()))
        break
      default:
        if (sudtWallet) {
          setMaxPay(new BigNumber(sudtWallet.balance.toString()).toString())
        } else if (shadowWallet) {
          if (seller === 'CKB') {
            setMaxPay(new BigNumber(shadowWallet.balance.toString()).toString())
          } else {
            const max = shadowWallet.balance
            setMaxPay(max.toString())
          }
        } else if (erc20Wallet) {
          setMaxPay(removeTrailingZero(erc20Wallet.balance.toString()))
        }
        break
    }
  }, [ethWallet.balance, ckbMax, pair, sudtWallets, erc20Wallets, orderMode])

  const isCrossChainOnly = useMemo(() => {
    return orderMode === OrderMode.CrossIn || orderMode === OrderMode.CrossOut
  }, [orderMode])

  const confirmButtonColor = useMemo(() => {
    if (isCrossChainOnly || isWalletNotConnected) {
      return undefined
    }
    switch (orderType) {
      case OrderType.Bid:
        return BID_CONFIRM_COLOR
      case OrderType.Ask:
        return ASK_CONFRIM_COLOR
      default:
        return BID_CONFIRM_COLOR
    }
  }, [orderType, isCrossChainOnly, isWalletNotConnected])

  const reset = useCallback(() => {
    setPay('')
    setPrice('')
  }, [])

  useEffect(() => {
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Wallet.reconnectCount])

  const currentSudtTokenName = useMemo(() => {
    return pair.find(t => t !== 'CKB')
  }, [pair])

  const currentERC20 = useMemo(() => {
    const [firstToken, secondToken] = pair
    return ERC20_LIST.find(e => e.tokenName === firstToken || e.tokenName === secondToken)
  }, [pair])

  const [shouldApprove, setShouldApprove] = useState(false)
  const [approveStatues, setApproveStatus] = useState(defaultApproveStatus)

  useEffect(() => {
    if (currentERC20) {
      if (web3 && ethWallet.address) {
        getAllowanceForTarget(ethWallet.address, currentERC20.address, web3).then(res => {
          if (res === '0') {
            setShouldApprove(true)
          } else {
            setShouldApprove(false)
          }
        })
      }
    } else {
      setShouldApprove(false)
    }
  }, [currentERC20, web3, ethWallet.address])

  const setERC20ApproveStatus = useCallback((tokenName: string, status: ApproveStatus) => {
    setApproveStatus(prev => {
      return {
        ...prev,
        [tokenName]: status,
      }
    })
  }, [])

  const currentApproveStatus: ApproveStatus = useMemo(() => {
    if (!currentERC20) {
      return ApproveStatus.Init
    }
    return approveStatues[currentERC20.tokenName]
  }, [currentERC20, approveStatues])

  const isApproving = useMemo(() => {
    return currentApproveStatus === ApproveStatus.Signing || currentApproveStatus === ApproveStatus.Confirming
  }, [currentApproveStatus])

  const approveText = useMemo(() => {
    switch (currentApproveStatus) {
      case ApproveStatus.Init:
        return `Approve ${currentERC20?.tokenName}`
      case ApproveStatus.Signing:
        return `Approving In Wallet`
      case ApproveStatus.Confirming:
        return `Approving On Chain`
      default:
        return `Approve ${currentERC20?.tokenName}`
    }
  }, [currentApproveStatus, currentERC20])

  const approveERC20 = useCallback(
    (tokenName: string, ethAddress: string, web3?: Web3) => {
      if (ethAddress && web3) {
        const erc20 = ERC20_LIST.find(e => e.tokenName === tokenName)
        if (erc20) {
          setERC20ApproveStatus(tokenName, ApproveStatus.Signing)
          approveERC20ToBridge(ethAddress, erc20.address, web3, () =>
            setERC20ApproveStatus(tokenName, ApproveStatus.Confirming),
          )
            .then(() => {
              setERC20ApproveStatus(tokenName, ApproveStatus.Finish)
              setShouldApprove(false)
            })
            .catch(() => {
              setERC20ApproveStatus(tokenName, ApproveStatus.Init)
            })
        }
      }
    },
    [setERC20ApproveStatus],
  )

  useEffect(() => {
    switch (orderMode) {
      case OrderMode.CrossIn:
      case OrderMode.CrossOut:
        setShowStatus(ShowStatus.CrossChain)
        break
      default:
        setShowStatus(ShowStatus.Open)
        break
    }
  }, [orderMode])

  return {
    currentApproveStatus,
    shouldApprove,
    currentERC20,
    approveERC20,
    approveText,
    isApproving,
    step,
    setStep,
    pay,
    setPay,
    price,
    setPrice,
    receive,
    reset,
    txHash,
    setTxHash,
    togglePair,
    orderType,
    pair,
    concatHistoryOrders,
    historyOrders,
    setHistoryOrders,
    submittedOrders,
    setAndCacheSubmittedOrders,
    setLoading,
    maxPay,
    bestPrice,
    tx,
    setTx,
    confirmButtonColor,
    setBuyerToken,
    setSellerToken,
    selectingToken,
    setSelectingToken,
    currentPairToken,
    setCurrentPairToken,
    orderMode,
    currentSudtTokenName,
    setAndCacheCrossChainOrders,
    crossChainOrders,
    isCrossChainOnly,
    actualPay,
    formRef,
    showStatus,
    setShowStatus,
  }
}

export const OrderContainer = createContainer(useOrder)

export default OrderContainer
