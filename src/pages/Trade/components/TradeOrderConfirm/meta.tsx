import React from 'react'
import { MetaContainer } from './styled'
import i18n from '../../../../utils/i18n'

export const Meta = ({ amount }: { amount: string }) => {
  return (
    <MetaContainer>
      <span>
        {i18n.t('trade.result.orderMeta', { amount })}
        <a
          href="https://github.com/glias/dex-ui/blob/dev/faq.md#are-there-any-fees-to-make-a-trade"
          target="_blank"
          rel="noreferrer noopener"
        >
          {i18n.t('trade.result.learnWhy')}
        </a>
      </span>
    </MetaContainer>
  )
}
