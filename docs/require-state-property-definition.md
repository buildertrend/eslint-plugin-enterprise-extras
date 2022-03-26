# Check for expected/unexpected state definitions in class components (`require-state-property-definition`)

This rule will ensure that if a state type definition is found as a type
argument to `React.Component` or `React.PureComponent`, then a state definition must be provided either in the class constructor, or as a class property.

If a state property definition is found, but a type is not provided as a type argument, then an error will also be thrown.

## Rule Details

Examples of **incorrect** code for this rule:

```typescript
class BadClassComponent1 extends React.Component<IProps, IState> {
  render() {
    return <>I don't have a state defined :(</>;
  }
}

class BadClassComponent2 extends React.Component<IProps> {
  state: {
    test: 123
  };

  render() {
    return <>I have a state property defined, but shouldn't :O</>;
  }
}
```

Examples of **correct** code for this rule:

```typescript
class GoodClassComponent1 extends React.Component<IProps, IState> {
  state: {
    test: 123
  };

  render() {
    return <>I have a state property defined</>;
  }
}

class GoodClassComponent2 extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      test: 123
    };
  }

  render() {
    return <>I also have a state property defined</>;
  }
}
```

## When Not To Use It

If you find too many false-positives to make this rule worth it, or if you aren't using Typescript/React.

## Auto-fixable?

No ❌
