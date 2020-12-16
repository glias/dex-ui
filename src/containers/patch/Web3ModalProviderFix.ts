import { Address, AddressType, Provider, verifyEthAddress, Web3ModalProvider } from '@lay2/pw-core'

function noop() {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type OnAddressChangedCallback = (newAddress: Address | undefined) => void

export class Web3ModalProviderFix extends Web3ModalProvider {
  onAddressChanged: OnAddressChangedCallback

  constructor(readonly web3: any, onAddressChanged?: OnAddressChangedCallback) {
    super(web3)
    this.onAddressChanged = onAddressChanged || noop
  }

  async init(): Promise<Provider> {
    const accounts = await this.web3.eth.getAccounts()
    if (!verifyEthAddress(accounts[0])) {
      throw new Error('get ethereum address failed')
    }

    this.address = new Address(accounts[0], AddressType.eth)
    if (this.web3.currentProvider.on) {
      this.web3.currentProvider.on('accountsChanged', async (newAccounts: string[]) => {
        if (!newAccounts || newAccounts.length === 0) {
          if (this.onAddressChanged) this.onAddressChanged(undefined)
          return
        }
        this.address = new Address(newAccounts[0], AddressType.eth)
        if (this.onAddressChanged) {
          this.onAddressChanged(this.address)
        }
      })
    }

    return this
  }
}
