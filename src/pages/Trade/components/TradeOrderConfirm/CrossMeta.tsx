import React from 'react'
import { README_URL } from 'constants/url'
import { MetaContainer } from './styled'
import i18n from '../../../../utils/i18n'
// import { ReactComponent as GiftSVG } from '../../../../assets/svg/gift.svg'
import Gift from '../../../../assets/img/gift.png'

export const CrossMeta = () => {
  return (
    <MetaContainer>
      <div className="meta">
        <div className="image">
          <img src={Gift} alt="" />
        </div>
        <div>
          {i18n.t('trade.result.crossMeta')}
          <a
            href={`${README_URL}#why-lock-my-addtional-ckb-when-i-place-an-order`}
            target="_blank"
            rel="noreferrer noopener"
          >
            {i18n.t('trade.result.learnWhy')}
          </a>
        </div>
      </div>
    </MetaContainer>
  )
}
