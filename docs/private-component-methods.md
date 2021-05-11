# Enforce private methods for class components (`private-component-methods`)

This rule requires that all methods for class components (components that expect `React.Component` or similar) are private. Private
methods allow the compiler to cleanup unused references

## Rule Details

Examples of **incorrect** code for this rule:

```typescript
class BadExample1 extends React.Component {
  handleClick = () => {};

  render() {
    return <button onClick={this.handleClick}>Test Button</button>;
  }
}

class BadExample2 extends React.Component {
  handleClick() {}

  render() {
    return <button onClick={this.handleClick}>Test Button</button>;
  }
}

class BadExample3 extends React.Component {
  handleClick = function() {};

  render() {
    return <button onClick={this.handleClick}>Test Button</button>;
  }
}

class BadExample4 extends React.Component {
   get gettersAreAlsoChecked() { return "No good" }

  render() {
    return <div>{this.gettersAreAlsoChecked}</div>;
  }
}
```

Examples of **correct** code for this rule:

```typescript
class GoodExample1 extends React.Component {
  private handleClick = () => {};

  render() {
    return <button onClick={this.handleClick}>Test Button</button>;
  }
}

class GoodExample2 extends React.Component {
  private handleClick() {}

  render() {
    return <button onClick={this.handleClick}>Test Button</button>;
  }
}

class GoodExample3 extends React.Component {
  private handleClick = function() {};

  render() {
    return <button onClick={this.handleClick}>Test Button</button>;
  }
}
```
## When Not To Use It
If you are okay with public methods in your React components and find the pattern acceptable.
## Auto-fixable?
Yes ✔️
