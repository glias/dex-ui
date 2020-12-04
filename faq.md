# FAQ

## General

### What is Gliaswap？

Gliaswap is a decentralized exchange on Nervos CKB, designed for multi-chain assets swap.

Gliaswap adopted **Glia Protocol**, which is an open protocol for decentralized exchange on the Nervos CKB blockchain. You can place a limit order to swap your cryptocurrencies, while you can also be an automated liquidity provider to earn trade fees on Gliaswap. And the most special on Gliaswap, we do not have a centralized matching contract or parties, so anyone can be a matching-maker. Simply install  a matching software, then you can start to gain risk-free profit by collecting trade fees.

There is one magic thing that **Gliaswap is able to run in Ethereum wallet** although it is a Dapp on CKB. Powered by pw-sdk, you can directly import your existing Ethereum Wallet on Gliaswap instead of installing a CKB exclusive wallet. And Gliaswap operates in a **non-custodial** manner which only works as a user-interface to help people assemble transactions. You as a user on Gliaswap will totally control your assets and trade freely.

Gliaswap also supports **one-step cross-chain swaps** between Ethereum and CKB which means you only need to sign once when trading your ETH to CKB. This works in a decentralized way with the help of **[Force Bridge cross-chain protocol](https://github.com/nervosnetwork/force-bridge-eth)**. Imagine how magic it is, just connect your Metamask on Gliaswap, and you can use your ETH to buy CKB in one trade! 

## Wallet

### What wallets are supported on Gliaswap?

Although it is a Dapp on CKB, powered by [pw-core](https://github.com/lay2dev/pw-core), Gliaswap can supports many mainstream wallets built specially for the other chain, including all kinds of Ethereum Wallets, Tron Wallets and so on. 

Currently, Gliaswap supports several Ethereum wallets below and we are actively working on more wallets.

[MetaMask](https://metamask.io/)- A desktop wallet that allows you to manage your tokens via a convenient browser extension. Learn how to install MetaMask and create a wallet [here](https://metamask.zendesk.com/hc/en-us/articles/360015489531-Getting-Started-With-MetaMask-Part-1-).

[WalletConnect](https://walletconnect.org/) - WalletConnect allows you to use Gliaswap with a growing list of mobile wallets, including imToken, Trust Wallet, and MetaMask Mobile. Go [here](https://walletconnect.org/wallets/) for the full list of WalletConnect-integrated wallets.

### Do I need to deposit my assets into Gliaswap?

Short answer: No you don't!

Gliaswap operates in a non-custodial manner which means that you trade directly from your wallet. We do not require you to deposit your assets into a third party as would happen when using a centralized exchange, such as Binance or Coinbase.

On Gliaswap, just connect the wallets and enjoy the free trade!

### How do I get Test Token so I can start trading？

You can get some Test Token from [Gliaswap Testnet](gliaswap-faucet.ckbapp.com).

## Trade

### What order types does Gliaswap support？

Gliaswap currently only supports limit orders. A **limit order** is an order to buy or sell a token at a specific price.

Since Gliaswap is a decentralized exchange, limit orders work a little differently than on a centralized exchange. When placing or cancelling a limit order, you need to pay a small amount of CKB to cover the transaction fee. But for the most part, user experience is the same with centralized exchange.

There are two different types of limit order. One is the normal limit order of sUDT/CKB. Another type is cross-chain limit order which is to sell ETH assets to buy CKB. They all require users to sign only once.

### Are there any fees to make a trade？

Gliaswap does not currently charge any platform fees. But placing an order does carry a small trade fee and transaction fee. 

* Trade fee are claimed in an order and collected by dealmakers as a reward for matching orders in the network. 

* Transaction fees are paid for CKB miners which are necessary to process the transaction on the CKB.

And if you are placing a cross-chain limit order, An additional cross-chain fee can also be charged. Now, cross-chain fees are set to free.

### Why lock my addtional CKB when I place an order？

When you try to place an order, you will see a notion in review pages about " Placing this order will addtional lock you ** CKB". 

Don't worry, these CKB are not used to pay for any fees or transfered to any third pairties. These CKB are only used to host the order you are placing and keep it open on chain, and after the order is completed or canceled, these CKB will be back to your wallet.  
