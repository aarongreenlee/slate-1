/* @jsx h */

import h from '../hyperscript'

export default (
  <value>
    <document>
      <ul_list>
        <list_item>
          <paragraph>Item 1</paragraph>
          <ul_list>
            <list_item>
              <paragraph>
                It
                <cursor />
                em 1.1
              </paragraph>
            </list_item>
            <list_item>
              <paragraph>Item 1.2</paragraph>
            </list_item>
          </ul_list>
        </list_item>
      </ul_list>
    </document>
  </value>
)
