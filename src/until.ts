import {processPart} from './html'
import {directive} from './directive'
import type {TemplatePart} from '@github/template-parts'

const untils: WeakMap<TemplatePart, {i: number}> = new WeakMap()
export const until = directive<Array<Promise<unknown>>>(
  (...promises: Array<Promise<unknown>>) => (part: TemplatePart) => {
    if (!untils.has(part)) untils.set(part, {i: promises.length})
    const state = untils.get(part)!
    for (let i = 0; i < promises.length; i += 1) {
      if (promises[i] instanceof Promise) {
        // eslint-disable-next-line github/no-then
        Promise.resolve(promises[i]).then(value => {
          if (i < state.i) {
            state.i = i
            processPart(part, {[part.expression]: value})
          }
        })
      } else if (i <= state.i) {
        state.i = i
        processPart(part, {[part.expression]: promises[i]})
      }
    }
  }
)