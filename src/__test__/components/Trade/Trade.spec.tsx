import React, { ReactElement } from 'react'
import renderer from 'react-test-renderer'
import Trade from '../../../pages/Trade'

describe('Header Component render', () => {
  let component: ReactElement

  beforeAll(() => {
    component = <Trade />
  })

  it('shallow renders', () => {
    const wrapper = renderer.create(component).toJSON()
    expect(wrapper).toMatchSnapshot()
  })
})
