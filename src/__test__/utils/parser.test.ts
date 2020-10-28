import { parseOrderRecord } from '../../utils/parser'
import fixtures from './fixtures.json'

describe('Test parse order record', () => {
  const fixtureTable: Array<[string, any, any]> = Object.entries(fixtures.parseOrderRecord)
    .slice(1)
    .map(([title, { params, expected }]) => [title, params, expected])

  it.each(fixtureTable)(`%s`, (_title, params: [any], expected) => {
    expect.assertions(1)
    expect(parseOrderRecord(...params)).toEqual(expected)
  })
})
