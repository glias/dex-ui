import styled from 'styled-components'

export const HeaderWalletBox = styled.div`
  width: 250px;
  overflow: hidden;
  .walletTitle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: rgba(0, 0, 0, 1);
    padding: 10px 15px;
    font-size: 17px;
    img {
      width: 15px;
      height: 15px;
    }
  }
`
export const WalletList = styled.li`
  .wallet {
    padding: 5px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: rgba(136, 136, 136, 1);
    .address {
      font-size: 14px;
    }
    img {
      width: 14px;
      margin-left: 10px;
    }
    .questionMark {
      width: 14px;
    }
  }
`
export const HeaderWallet = styled.div`
  box-sizing: border-box;
  padding: 0 10px;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  background: rgba(0, 106, 151, 1);
  color: #fff;
  text-align: center;
  span {
    float: right;
    height: 100%;
    color: #fff;
    line-height: 40px;
    display: inline-block;
  }
`
export const WalletTrade = styled.div``
