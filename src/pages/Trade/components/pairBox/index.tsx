import React from 'react'
import ckb from '../../../../assets/img/token/ckb.png'
import { PairList, PairBox } from './styled'

const onClickSelectPair = (name: string, props: any): void => {
  props.selectPair(false, name)
}

export const PairContent = (props: any) => {
  return (
    <PairBox>
      {props.content.map((list: any) => (
        <PairList key={list.logo}>
          <img src={list.logo} alt="logo pair" />
          {list.name}
        </PairList>
      ))}
    </PairBox>
  )
}

export const PairTraceLine = (props: any) => {
  return (
    <PairBox>
      {props.content.map((list: any) => (
        <li className="pairTraceList" key={list.name} onClick={() => onClickSelectPair(list.name, props)}>
          <PairList key={list.logo}>
            <img src={list.logo} alt="logo pair" />
            {list.name}
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

export default PairContent
