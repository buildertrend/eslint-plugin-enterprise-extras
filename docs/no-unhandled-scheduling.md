# Avoid unhandled scheduled tasks (`no-unhandled-scheduling`)

This rule suggests that all scheduled task calls (`setTimeout` or `setInterval`) should be handled in some way. In many cases, these scheduled tasks need to be cancelled to avoid leaking resources. React components, in particular, should take great care to ensure that these calls are cleared/released when the component gets unmounted.

Note that the rule **does not** ensure that the schedule handles are cleared at some point, but it does try to be sure that some explicit operation is at least performed on the handle, like an assignment to a variable to be cleared at a later point.

## Rule Details

Examples of **incorrect** code for this rule:

```typescript
setTimeout(() => {});

setInterval(() => {});

window.setInterval(() => {});

global.setTimeout(() => {});

class BadComponent extends React.Component {
  componentDidMount() {
    setTimeout(() => {
      // Run operations like setState
    })
  }

  render() {
    return <></>;
  }
}
```

Examples of **correct** code for this rule:

```typescript
const handle = setTimeout(() => {});
clearTimeout(handle);

// You can use the VOID keyword to bypass the check
void setInterval(() => {});

class GoodComponent extends React.Component {
  timeoutHandle: null | NodeJS.Timeout = null;
  componentDidMount() {
    this.timeoutHandle = setTimeout(() => {
      // Run operations like setState
    })
  }

  componentWillUnmount() {
    if(this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
    }
  }

  render() {
    return <></>;
  }
}
```

## When Not To Use It

If you do not care about cancelling scheduled tasks, or find your project uses scheduled tasks very infrequently.

## Auto-fixable?

No ❌
