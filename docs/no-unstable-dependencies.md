# Prevents the use of variables with unstable values in React hook dependencies (`no-unstable-dependencies`)

Unstable dependencies should be avoided in React hook dependency arrays. This rule helps find dependencies that are used in React hook dependency arrays
that will change values every time the component render is called, such as when they are set to a new instance of an object, array, or function.

## Rule Details

Examples of **incorrect** code for this rule:

```typescript
class MyClass {}
const MyBadComponent: React.FC<any> = ({myInstance = new MyClass()}) => {
  React.useEffect(() => {}, [myInstance]);
}

const MyBadComponent2: React.FC<any> = ({myObject = {}}) => {
  React.useEffect(() => {}, [myObject]);
}

const MyBadComponent3: React.FC<any> = ({myArray = []}) => {
  React.useEffect(() => {}, [myArray]);
}

const MyBadComponent4: React.FC<any> = () => {
  const myFunction = () => {
    alert("Hello");
  };
  React.useEffect(() => {}, [myFunction]);
}
```

Examples of **correct** code for this rule:

```typescript
class MyClass {}
const defaultInstance = new MyClass();
const MyGoodComponent: React.FC<any> = ({myInstance = defaultInstance}) => {
  React.useEffect(() => {}, [myInstance]);
}

const defaultObject = {};
const MyGoodComponent2: React.FC<any> = ({myObject = defaultObject}) => {
  React.useEffect(() => {}, [myObject]);
}

const defaultArray = [];
const MyGoodComponent3: React.FC<any> = ({myArray = defaultArray}) => {
  React.useEffect(() => {}, [myArray]);
}

const MyGoodComponent4: React.FC<any> = () => {
  const myFunction = React.useMemo(() => {

  });
  React.useEffect(() => {}, [myFunction]);
}
```

## When Not To Use It

False positives, or when constant/stable values in things like parameter defaults are not desired.

## Auto-fixable?

No ❌
