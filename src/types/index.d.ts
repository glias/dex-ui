declare namespace CustomRouter {
  interface Route {
    name: string
    path: string
    exact?: boolean
    params?: string
    showHeader: boolean
    component: React.FunctionComponent<any>
  }
}

declare namespace State {
  export interface App {
    loading: boolean
    language: 'en' | 'zh'
    appWidth: number
    appHeight: number
    address: string
  }

  interface FetchStatusValue {
    OK: string
    Error: string
    InProgress: string
    None: string
  }

  export type FetchStatus = keyof FetchStatusValue

  export interface PageState extends App {
    counterState: CounterState
    traceState: TraceState
    walletState: WalletState
  }

  export interface actionType {
    type: string
    payload: any
  }

  interface WalletState {
    walletConnectStatus: 'un_start' | 'success' | 'failed' // 钱包连接状态
    addressList: String[] // 所有钱包地址
    currentSelectedAddress: string // 当前选中的地址
  }

  interface TraceState {
    currentPair: string
    ordersList: Array<object>
    tableHeaderColumn: Array<object>
    orderStep: number
    isOrderSuccess: boolean
    maximumPayable: number
  }

  interface CounterState {
    walletList: string[]
  }

  export interface AppState extends PageState {
    app: App
  }
}
