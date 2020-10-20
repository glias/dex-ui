export enum AppActions {
  ResizeWindow = 'resizeWindow'
}

export enum PageActions {
  UpdateAddress = 'updateAddress'
}

export type StateActions = AppActions | PageActions

export default StateActions
