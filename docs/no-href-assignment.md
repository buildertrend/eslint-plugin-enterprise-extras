# Disallow href direct assignment (`no-href-assignment`)
This rule prevents direct assignment to `window.location.href` (or similar) for redirection. Instead, `window.location.assign()` is preferred as is easier to mock when testing
## Rule Details

Examples of **incorrect** code for this rule:

```typescript
window.location.href = "https://google.com";

const { location: myLoc } = window;
myLoc.href = "http://example.com";
```

Examples of **correct** code for this rule:

```typescript
window.location.assign("https://google.com");

const { location: myLoc } = window;
myLoc.href.assign("http://example.com");

// Only the real location object is affected
const location: { href: string } = { href: "" };
location.href = "test";
```
## When Not To Use It
When you are not concerned with mocking out href/url changes, or are indifferent on which method is used.
## Auto-fixable?
Yes ✔️