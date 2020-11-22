import React from 'react'
import OrderContainer, { OrderStep } from 'containers/order'
import { useContainer } from 'unstated-next'
import { ConfirmHeader } from './styled'
import { ReactComponent as BackSVG } from '../../../../assets/svg/back.svg'
import i18n from '../../../../utils/i18n'

export const Header = () => {
  const Order = useContainer(OrderContainer)
  return (
    <ConfirmHeader>
      <button
        type="button"
        onClick={() => {
          Order.setStep(OrderStep.Order)
        }}
      >
        <BackSVG />
      </button>
      <span>{i18n.t(`trade.reviewOrder`)}</span>
    </ConfirmHeader>
  )
}
