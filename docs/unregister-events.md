# Ensure that all events are unregistered when components are unmounted (`unregister-events`)

This rule will check to make sure that all events that are unregistered have a corresponding unregister
call within `componentWillUnmount` or `useEffect` cleanup functions.

Note: This component tries to make sure that the events are unregistered, but it is limited in it's detection and may require
the rule to be ignored during false-positives.

## Rule Details

Examples of **incorrect** code for this rule:

```typescript
class BadClassComponent extends React.Component {
  private onScroll = (e: any) => {}

  handleClick = () => {
    window.addEventListener("scroll", this.onScroll)
  };

  render() {
    return <button onClick={this.handleClick}>Test Button</button>;
  }
}

const BadHookComponent: React.FC = () => {
  const onScroll = (e: any) => {}

  handleClick = () => {
    window.addEventListener("scroll", onScroll)
  };

  render() {
    return <button onClick={this.handleClick}>Test Button</button>;
  }
}
```

Examples of **correct** code for this rule:

```typescript
class GoodClassComponent extends React.Component {
  private onScroll = (e: any) => {}

  componentWillUnmount() {
    window.removeEventListener("scroll", this.onScroll)
  }

  handleClick = () => {
    window.addEventListener("scroll", this.onScroll)
  };

  render() {
    return <button onClick={this.handleClick}>Test Button</button>;
  }
}

const GoodHookComponent: React.FC = () => {
  const onScroll = (e: any) => {}

  handleClick = () => {
    window.addEventListener("scroll", onScroll)
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("scroll", onScroll);
    }
  })

  render() {
    return <button onClick={this.handleClick}>Test Button</button>;
  }
}
```

## When Not To Use It

If you find too many false-positives to make this rule worth it.

## Auto-fixable?

No ❌
