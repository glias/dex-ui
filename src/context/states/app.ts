export const initApp: State.App = {
  loading: false,
  language: navigator.language.includes('zh') ? 'zh' : 'en',
  appWidth: window.innerWidth,
  appHeight: window.innerHeight,
  isConnectWallet: false, 
  address: '0x7e8sdfsdf0s32390dfvfdusd8d90sd89sd98s7290e1'
}

export default initApp
