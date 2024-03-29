# eslint-plugin-enterprise-extras

This plugin adds extra ESLint rules that may be more suitable for an enterprise environment. The rules were created for use within Buildertrend, but feel free to request or propose any ESLint rules that may fall under this umbrella.

------------

## Installation

Install this ESLint plugin as a dev dependency:

```bash
npm install --save-dev eslint-plugin-enterprise-extras
```

## Usage

Edit your project's `.eslintrc.js` configuration to load the plugin:

```js
module.exports = {
    plugins: ["enterprise-extras"],
    rules: {
        // "enterprise-extras/no-href-assignment": "error"
        // ...
        // "enterprise-extras/...": "..."
    }
}
```

Alternatively, you could use the `recommended` or `all` preset rule configurations:

```js
module.exports = {
    extends: ["plugin:enterprise-extras/recommended"],
    // extends: ["plugin:enterprise-extras/all"],
    rules: {
        // You can override the recommended rules here
    }
}
```

## Supported Rules

✅ = Recommended
🔧 = Auto-fixable
| Name                                               | ✅ | 🔧 | Description |
| -------------------------------------------------- | - | - | ----------- |
| [no-href-assignment](/docs/no-href-assignment.md)  | ✅ | 🔧 | Prefers `location.assign` instead of `location.href =` |
| [private-component-methods](/docs/private-component-methods.md)  | ✅ | 🔧 | Requires that all methods of react components are private (except reserved lifecycle methods) |
| [no-unhandled-scheduling](/docs/no-unhandled-scheduling.md)  | ✅ |  | `setTimeout` and `setInterval` calls should be cleared |
| [unregister-events](/docs/unregister-events.md)  | ✅ |  | Ensures all events registered in React components are unregistered when component unmounts |
| [no-unstable-dependencies](/docs/no-unstable-dependencies.md)  | ✅ |  | Helps find dependencies that are used in React hook dependency arrays that will change values every time the component render is called |
| [require-state-property-definition](/docs/require-state-property-definition.md)  | ✅ |  | Check for expected/unexpected state definitions in class components |
| [max-indentation](/docs/max-indentation.md)  |  |  | prevents code blocks from exceeded a specified number of indents |
|[no-deprecated-element](/docs/no-deprecated-element.md) | ✅ | 🔧 | Prevents deprecated elements from being used |

## Contributing

https://btwiki.atlassian.net/wiki/spaces/dv/pages/2319942076/eslint-plugin-enterprise-extras

## LICENSE

MIT
