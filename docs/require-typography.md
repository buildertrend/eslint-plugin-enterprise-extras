# Require usage of smart quotes and other typographic unicode characters (`require-typography`)

This rule requires that all string literals or JSX text elements use typographic alternatives. For example, "smart quotes" -> “smart quotes” get converted. Ellipsis (... -> …) and the plus or minus symbol conversions (+- -> ±) are also required under this rule.

## Rule Details

Examples of **incorrect** code for this rule:

```typescript
"Testing testing... '123' +-100";
'The quick brown "fox"';
```

Examples of **correct** code for this rule:

```typescript
"Testing testing… ‘123’ ±100";
'The quick brown “fox”';
```

## When Not To Use It

If you have many strings that are not human readable, and therefore should use the typographic alternatives.

## Auto-fixable?

Some 🟨
