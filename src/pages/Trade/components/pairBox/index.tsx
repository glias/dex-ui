import React from 'react'
import ckb from '../../../../assets/img/token/ckb.png'
import { PairList, PairBox } from './styled'

export const PairContent = ({ addressList }: { addressList: Array<object> }) => {
  return (
    <PairBox>
      {addressList?.map((item: any) => (
        <PairList key={item.logo}>
          <img src={item.logo} alt="logo pair" />
          {item.name}
        </PairList>
      ))}
    </PairBox>
  )
}
const mapStateToProps = (state: State.AppState) => {
  return {
    ...state,
  }
}

export const PairTraceLine = ({ addressList }: { addressList: Array<object> }) => {
  // const onClickSelectPair = (name: string) => {
  //   // props.selectPair(false, name)

  //   return name
  // }
  return (
    <PairBox>
      {addressList?.map((item: any) => (
        <li className="pairTraceList" key={item.name}>
          <PairList key={item.logo}>
            <img src={item.logo} alt="logo pair" />
            {item.name}
          </PairList>
          <div className="decollect">/</div>
          <PairList>
            <img src={ckb} alt="logo pair" />
            CKB
          </PairList>
        </li>
      ))}
    </PairBox>
  )
}

export default connect(mapStateToProps)(PairContent)
