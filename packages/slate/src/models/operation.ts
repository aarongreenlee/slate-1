import * as debug from '@gitbook/slate-debug';
import { List, Record } from 'immutable';
import isPlainObject from 'is-plain-object';

import MODEL_TYPES from '../constants/model-types';
import OPERATION_ATTRIBUTES from '../constants/operation-attributes';
import Mark from './mark';
import Node from './node';
import Range from './range';
import Value from './value';

/*
 * Default properties.
 *
 * @type {Object}
 */

const DEFAULTS = {
    length: undefined,
    mark: undefined,
    marks: undefined,
    newPath: undefined,
    node: undefined,
    offset: undefined,
    path: undefined,
    position: undefined,
    properties: undefined,
    selection: undefined,
    target: undefined,
    text: undefined,
    type: undefined,
    value: undefined
};

/*
 * Operation.
 *
 * @type {Operation}
 */

class Operation extends Record(DEFAULTS) {
    /*
     * Create a new `Operation` with `attrs`.
     *
     * @param {Object|Array|List|String|Operation} attrs
     * @return {Operation}
     */

    public static create(attrs = {}) {
        if (Operation.isOperation(attrs)) {
            return attrs;
        }

        if (isPlainObject(attrs)) {
            return Operation.fromJS(attrs);
        }

        throw new Error(
            `\`Operation.create\` only accepts objects or operations, but you passed it: ${attrs}`
        );
    }

    /*
     * Create a list of `Operations` from `elements`.
     *
     * @param {Array<Operation|Object>|List<Operation|Object>} elements
     * @return {List<Operation>}
     */

    public static createList(elements = []) {
        if (List.isList(elements) || Array.isArray(elements)) {
            const list = new List(elements.map(Operation.create));
            return list;
        }

        throw new Error(
            `\`Operation.createList\` only accepts arrays or lists, but you passed it: ${elements}`
        );
    }

    /*
     * Create a `Operation` from a JSON `object`.
     *
     * @param {Object|Operation} object
     * @return {Operation}
     */

    public static fromJS(object) {
        if (Operation.isOperation(object)) {
            return object;
        }

        const { type, value } = object;
        const ATTRIBUTES = OPERATION_ATTRIBUTES[type];
        const attrs = { type };

        if (!ATTRIBUTES) {
            throw new Error(
                `\`Operation.fromJS\` was passed an unrecognized operation type: "${type}"`
            );
        }

        for (const key of ATTRIBUTES) {
            let v = object[key];

            if (v === undefined) {
                // Skip keys for objects that should not be serialized, and are only used
                // for providing the local-only invert behavior for the history stack.
                if (key === 'document') {
                    continue;
                }
                if (key === 'selection') {
                    continue;
                }
                if (key === 'value') {
                    continue;
                }
                if (key === 'node' && type !== 'insert_node') {
                    continue;
                }

                throw new Error(
                    `\`Operation.fromJS\` was passed a "${type}" operation without the required "${key}" attribute.`
                );
            }

            if (key === 'mark') {
                v = Mark.create(v);
            }

            if (key === 'marks' && v != null) {
                v = Mark.createSet(v);
            }

            if (key === 'node') {
                v = Node.create(v);
            }

            if (key === 'selection') {
                v = Range.create(v);
            }

            if (key === 'value') {
                v = Value.create(v);
            }

            if (key === 'properties' && type === 'merge_node') {
                v = Node.createProperties(v);
            }

            if (key === 'properties' && type === 'set_mark') {
                v = Mark.createProperties(v);
            }

            if (key === 'properties' && type === 'set_node') {
                v = Node.createProperties(v);
            }

            if (key === 'properties' && type === 'set_selection') {
                const { anchorKey, focusKey, ...rest } = v;
                v = Range.createProperties(rest);

                if (anchorKey !== undefined) {
                    v.anchorPath =
                        anchorKey == null
                            ? null
                            : value.document.getPath(anchorKey);
                }

                if (focusKey !== undefined) {
                    v.focusPath =
                        focusKey == null
                            ? null
                            : value.document.getPath(focusKey);
                }
            }

            if (key === 'properties' && type === 'set_value') {
                v = Value.createProperties(v);
            }

            if (key === 'properties' && type === 'split_node') {
                v = Node.createProperties(v);
            }

            attrs[key] = v;
        }

        const node = new Operation(attrs);
        return node;
    }

    /*
     * Alias `fromJS`.
     */

    public static fromJSON(object) {
        debug.deprecate(
            'slate@0.35.0',
            'fromJSON methods are deprecated, use fromJS instead'
        );
        return Operation.fromJS(object);
    }

    /*
     * Check if `any` is a `Operation`.
     */
    public static isOperation(input: any): boolean {
        return !!(input && input[MODEL_TYPES.OPERATION]);
    }

    /*
     * Check if `any` is a list of operations.
     */
    public static isOperationList(input: any): boolean {
        return (
            List.isList(input) &&
            input.every(item => Operation.isOperation(item))
        );
    }

    /*
     * Object.
     */

    get object(): 'operation' {
        return 'operation';
    }

    get kind(): 'operation' {
        debug.deprecate(
            'slate@0.32.0',
            'The `kind` property of Slate objects has been renamed to `object`.'
        );
        return this.object;
    }

    /*
     * Return a JSON representation of the operation.
     *
     * @param {Object} options
     * @return {Object}
     */

    public toJS(options = {}) {
        const { object, type } = this;
        const json = { object, type };
        const ATTRIBUTES = OPERATION_ATTRIBUTES[type];

        for (const key of ATTRIBUTES) {
            let value = this[key];

            // Skip keys for objects that should not be serialized, and are only used
            // for providing the local-only invert behavior for the history stack.
            if (key === 'document') {
                continue;
            }
            if (key === 'selection') {
                continue;
            }
            if (key === 'value') {
                continue;
            }
            if (key === 'node' && type !== 'insert_node') {
                continue;
            }

            if (key === 'mark' || key === 'marks' || key === 'node') {
                value = value.toJS();
            }

            if (key === 'properties' && type === 'merge_node') {
                const v = {};
                if ('data' in value) {
                    v.data = value.data.toJS();
                }
                if ('type' in value) {
                    v.type = value.type;
                }
                value = v;
            }

            if (key === 'properties' && type === 'set_mark') {
                const v = {};
                if ('data' in value) {
                    v.data = value.data.toJS();
                }
                if ('type' in value) {
                    v.type = value.type;
                }
                value = v;
            }

            if (key === 'properties' && type === 'set_node') {
                const v = {};
                if ('data' in value) {
                    v.data = value.data.toJS();
                }
                if ('isVoid' in value) {
                    v.isVoid = value.isVoid;
                }
                if ('type' in value) {
                    v.type = value.type;
                }
                value = v;
            }

            if (key === 'properties' && type === 'set_selection') {
                const v = {};
                if ('anchorOffset' in value) {
                    v.anchorOffset = value.anchorOffset;
                }
                if ('anchorPath' in value) {
                    v.anchorPath = value.anchorPath;
                }
                if ('focusOffset' in value) {
                    v.focusOffset = value.focusOffset;
                }
                if ('focusPath' in value) {
                    v.focusPath = value.focusPath;
                }
                if ('isBackward' in value) {
                    v.isBackward = value.isBackward;
                }
                if ('isFocused' in value) {
                    v.isFocused = value.isFocused;
                }
                if ('marks' in value) {
                    v.marks = value.marks == null ? null : value.marks.toJS();
                }
                value = v;
            }

            if (key === 'properties' && type === 'set_value') {
                const v = {};
                if ('data' in value) {
                    v.data = value.data.toJS();
                }
                if ('decorations' in value) {
                    v.decorations = value.decorations.toJS();
                }
                if ('schema' in value) {
                    v.schema = value.schema.toJS();
                }
                value = v;
            }

            if (key === 'properties' && type === 'split_node') {
                const v = {};
                if ('data' in value) {
                    v.data = value.data.toJS();
                }
                if ('type' in value) {
                    v.type = value.type;
                }
                value = v;
            }

            json[key] = value;
        }

        return json;
    }

    /*
     * Alias `toJSON`.
     */

    public toJSON(options) {
        debug.deprecate(
            'slate@0.35.0',
            'toJSON methods are deprecated, use toJS instead'
        );
        return this.toJS(options);
    }
}

/*
 * Attach a pseudo-symbol for type checking.
 */

Operation.prototype[MODEL_TYPES.OPERATION] = true;

export default Operation;
