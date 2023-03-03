# Flag and replace deprecated component usage (`no-deprecated-element`)

This rule allows you to flag a specific jsx element as deprecated, and optionally offer a replacement. Advanced configuration can be used with this rule to enable additional metaprogramming that can add/translate/remove props from the deprecated component to the new component

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
                replace: {
                  element: "GoodComponent"
                },
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

## Advanced usage
In the case that the new component just adds/removes or translates a few props from the deprecated component, you can use some more advanced configuration options to auto-fix prop changes for the new component as well.

Here is an example configuration demonstrating this:
```javascript
"enterprise-extras/no-deprecated-element": [
    "warn",
    {
        deprecate: [
            {
                element: "Checkbox",
                replace: {
                  element: "MyCheckbox"
                  // A list of props to add to the deprecated component when autofixing
                  addProps: [
                    {
                      // REQUIRED: the key/name of the prop you want to add when
                      key: "id",

                      // REQUIRED: the default value.
                      defaultValue: '"checkbox"',

                      // An array containing a list of props you wish to pull the value
                      // off of from the deprecated component, if exists. Otherwise,
                      // the defaultValue for the prop is used instead
                      keysToPullValueFrom: ["name"],

                      // Tells the autofixer to NOT override the
                      // prop if a prop with the same name already exists
                      // on the deprecated component 
                      override: false
                    },
                    {
                      key: "data-testid",
                      defaultValue: '"checkbox"',
                      // Can pull values from multiple keys if desired in order of
                      // priority
                      keysToPullValueFrom: ["id", "name"],
                      override: true
                    },
                  ],
                  // Remove any props in this array AFTER any props are added
                  removeProps: ["name"],
                },
            },
        ],
    },
],
```
Example using the advanced configuration above to translate an old component to a new one:
> Given the configuration above
```typescript
() => {
  return (
    <Checkbox name="selectAll" onChange={handleSelectAll}>
      Select All
    </Checkbox>
  )
}


// Autofixes to (IGNORING FORMATTING):
() => {
  return (
    <Checkbox
      id="selectAll"
      data-testid="selectAll"
      onChange={handleSelectAll}
    >
      Select All
    </Checkbox>
  )
}
```

**NOTE:** Autofixing is experimental. In addition, it does not handle formatting automatically. Using an opinionated formatter, like Prettier, is highly recommended to resolve non-symantic issues (extra spaces) with the fixer.

## When Not To Use It

Don't use this if you don't have elements you are looking to deprecate or have cleaned up all existing usages.

Don't use this for complicated metaprogramming while replacing a component beyond adding props, removing props, or translating/renaming props. For these even more complex deprecations, consider creating a separate linting plugin that can handle these more advanced, or programatic use cases.
## Auto-fixable?

Yes ✔️
