import rule from "../../src/rules/no-deprecated-element";
import { ESLintUtils } from "@typescript-eslint/utils";
import { resolve, join } from "path";

const ruleTester = new ESLintUtils.RuleTester({
  parser: resolve("./node_modules/@typescript-eslint/parser") as any,
  parserOptions: {
    ecmaVersion: 2018,
    ecmaFeatures: {
      jsx: true,
    },
    tsconfigRootDir: join(__dirname, "../fixtures"),
    project: "./tsconfig.json",
  },
});

ruleTester.run("no-deprecated-element", rule, {
  valid: [
    {
      code: `
      const MyComponent: React.FC = () => {
        return <BTCheckbox>MyCheckbox</BTCheckbox>;
      }
    `,
      options: [
        {
          replace: [
            {
              element: "Checkbox",
              with: "BTCheckbox",
            },
          ],
        },
      ],
    },
  ],

  invalid: [
    {
      code: `
        const MyComponent: React.FC = () => {
          return <Checkbox>MyCheckbox</Checkbox>;
        }
      `,
      options: [
        {
          replace: [
            {
              element: "Checkbox",
              with: "BTCheckbox",
            },
          ],
        },
      ],
      output: `
        const MyComponent: React.FC = () => {
          return <BTCheckbox>MyCheckbox</BTCheckbox>;
        }
      `,
      errors: [
        {
          messageId: "noDeprecatedElement_replacement",
        },
      ],
    },
    {
      code: `
        const MyComponent: React.FC = () => {
          return <Checkbox>MyCheckbox</Checkbox>;
        }
      `,
      options: [
        {
          replace: [
            {
              element: "Checkbox",
            },
          ],
        },
      ],
      errors: [
        {
          messageId: "noDeprecatedElement",
        },
      ],
    },
  ],
});
