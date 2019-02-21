/** @jsx h */

import h from '../hyperscript'

export default (
  <value>
    <document>
      <ul_list>
        <list_item key="previous_item">
          <paragraph>First item</paragraph>
        </list_item>
        <list_item>
          <paragraph>
            <anchor />
            Second item
            <focus />
          </paragraph>
        </list_item>
      </ul_list>
    </document>
  </value>
)
