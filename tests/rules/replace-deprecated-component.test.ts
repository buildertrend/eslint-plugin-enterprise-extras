import rule from "../../src/rules/replace-deprecated-component";
import { ESLintUtils } from "@typescript-eslint/utils";
import { resolve, join } from "path";

const ruleTester = new ESLintUtils.RuleTester({
  parser: resolve("./node_modules/@typescript-eslint/parser") as any,
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: join(__dirname, "../fixtures"),
    project: "./tsconfig.json",
  },
});

ruleTester.run("replace-deprecated-component", rule, {
  valid: [
    `
      const MyComponent: React.FC = () => {
        return <BTCheckbox>MyCheckbox</BTCheckbox>;
      }
    `,
  ],

  invalid: [
    {
      code: `
      const MyComponent: React.FC = () => {
        return <Checkbox>MyCheckbox</Checkbox>;
      }
    `,
      output: `
      const MyComponent: React.FC = () => {
        return <BTCheckbox>MyCheckbox</BTCheckbox>;
      }
    `,
      errors: [
        {
          messageId: "replaceDeprecatedComponents",
        },
      ],
    },
  ],
});
