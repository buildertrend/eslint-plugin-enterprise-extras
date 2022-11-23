# Limit levels of indentation (`max-indentation`)

This rule prevents code blocks from exceeded a specified number of indents. This plugin can be useful in conjunction with plugins like Prettier, where once a certain number of indents are reached, code becomes nearly unreadable. Code blocks with multiple layers of indentation can be a code smell of large functions and cyclomatic complexity that could be broken up into smaller functions. 

## Rule Details

Examples of **incorrect** code for this rule, assuming a maximum indentation of 4 levels:

```typescript
const myFunction = () => {
  if (Math.random() > 0.5) {
    const myInnerFunction = () => {
      if (Math.random() > 0.5) {
        return [
          // These lines should fail given that there are more than 4 indentation levels
          1,
          2,
          3,
          4,
        ]
      }
    }
  }
}
```

Examples of **correct** code for this rule, again assuming a maximum indentation of 4 levels:

```typescript
const otherFunction = () => {
  return [
    // These lines should fail given that there are more than 4 indentation levels
    1,
    2,
    3,
    4,
  ];
}

const myFunction = () => {
  if (Math.random() > 0.5) {
    const myInnerFunction = () => {
      if (Math.random() > 0.5) {
        otherFunction();
      }
    }
  }
}
```

## When Not To Use It

May not be recommended without an opinionated code formatter like Prettier. Without an opinionated formatter, developers may instead be encouraged to write more one liners, which is not a recommended fix for this issue.

## Auto-fixable?

No ❌
