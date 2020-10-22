export enum AppActions {
  ResizeWindow = 'resizeWindow',
  ConnectWallet = 'connectWallet'
}

export enum PageActions {
  UpdateAddress = 'updateAddress',
  UpdateTradePair = 'updateTradePair'
}

export type StateActions = AppActions | PageActions

export default StateActions
