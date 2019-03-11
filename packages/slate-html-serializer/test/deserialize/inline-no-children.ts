/* @jsx h */

import h from '../helpers/h'

export const config = {
  rules: [
    {
      deserialize(el, next) {
        switch (el.tagName.toLowerCase()) {
          case 'p': {
            return {
              object: 'block',
              type: 'paragraph',
              nodes: next(el.childNodes),
            }
          }
          case 'a': {
            return {
              object: 'inline',
              type: 'link',
              nodes: next(el.childNodes),
            }
          }
        }
      },
    },
  ],
}

export const input = `
<p><a></a></p>
`.trim()

export const output = (
  <value>
    <document>
      <paragraph>
        <link />
      </paragraph>
    </document>
  </value>
)
