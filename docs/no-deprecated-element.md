# Flag and replace deprecated component usage (`no-deprecated-element`)

This rule allows you to flag a specific jsx element as deprecated, and optionally offer a replacement.

## Rule Details

A majority of how this rule works comes down to the configuration. It simply allows you to blacklist a specific element, and optionally offer a replacement element.

> For now, this simply replaces the element name, without adjusting props or imports for a given file. 

```json
"enterprise-extras/no-deprecated-element": [
    "warn",
    {
        deprecate: [
            {
                element: "BadComponent",
                replaceWith: "GoodComponent",
            },
            {
                element: "HorribleComponent",
            },
        ],
    },
],
```

Examples of **incorrect** code for this rule:
> Given the configuration above

```typescript
export const MyComponent = () => {
  return (
    <>
      <BadComponent values="1">Children</BadComponent>
      <BadComponent />
      <HorribleComponent />
    </>
  );
};
```

Examples of **correct** code for this rule:
> Given the configuration above

```typescript
export const MyComponent = () => {
  return (
    <>
      <GoodComponent values="1">Children</GoodComponent>
      <GoodComponent />
    </>
  );
};
```

## When Not To Use It

Don't use this if you don't have elements you are looking to deprecate or have cleaned up all existing usages.

## Auto-fixable?

Yes ✔️
