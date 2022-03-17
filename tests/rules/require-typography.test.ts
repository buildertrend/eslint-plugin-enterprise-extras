import rule from "../../src/rules/require-typography";
import { ESLintUtils } from "@typescript-eslint/utils";
import { resolve, join } from "path";

const ruleTester = new ESLintUtils.RuleTester({
  parser: resolve("./node_modules/@typescript-eslint/parser") as any,
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: join(__dirname, "../fixtures"),
    project: "./tsconfig.json",
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run("require-typography", rule, {
  valid: [
    `
      "’";
    `,
    `
      <>’</>;
    `,
    `
      \`’\`;
    `,
    `
      "‘";
    `,
    `
      "”";
    `,
    `
      "“";
    `,
    `
      "…";
    `,
    `
      "±";
    `,
  ],

  invalid: [
    {
      code: `
        "there's"
      `,
      output: `
        "there’s"
      `,
      errors: [
        {
          messageId: "requireTypography",
        },
      ],
    },
    {
      code: `
        "'hello'"
      `,
      output: `
        "'hello’"
      `,
      errors: [
        {
          messageId: "requireTypography",
        },
        {
          messageId: "requireTypography",
        },
      ],
    },
    {
      code: `
        <>fdfas 'hello'</>
      `,
      output: `
        <>fdfas ‘hello’</>
      `,
      errors: [
        {
          messageId: "requireTypography",
        },
        {
          messageId: "requireTypography",
        },
      ],
    },
    {
      code: `
        const test = \`'\${123}'\`;
      `,
      output: `
        const test = \`'\${123}'\`;
      `,
      errors: [
        {
          messageId: "requireTypography",
        },
        {
          messageId: "requireTypography",
        },
      ],
    },
    {
      code: `
        ' "hello"';
      `,
      output: `
        ' “hello”';
      `,
      errors: [
        {
          messageId: "requireTypography",
        },
        {
          messageId: "requireTypography",
        },
      ],
    },
    {
      code: `
        "Loading...";
      `,
      output: `
        "Loading…";
      `,
      errors: [
        {
          messageId: "requireTypography",
        },
      ],
    },
    {
      code: `
      import React from "react";

      interface IState {
        isLoaded: boolean;
      }

      class MyComponent extends React.Component<{}, IState> {
        state: Readonly<IState> = {
          isLoaded: false,
        };

        componentDidMount() {
          void setTimeout(() => {
            this.setState({ isLoaded: true });
          }, 1000);
        }

        render() {
          const loadingText = "You're currently waiting for your service to load...";

          if (!this.state.isLoaded) {
            return loadingText;
          }

          return (
            <>
              Hello, and welcome to "MyComponent"! There are around +- 300 people
              visiting this page at the moment.
            </>
          );
        }
      }
      `,
      output: `
      import React from "react";

      interface IState {
        isLoaded: boolean;
      }

      class MyComponent extends React.Component<{}, IState> {
        state: Readonly<IState> = {
          isLoaded: false,
        };

        componentDidMount() {
          void setTimeout(() => {
            this.setState({ isLoaded: true });
          }, 1000);
        }

        render() {
          const loadingText = "You’re currently waiting for your service to load…";

          if (!this.state.isLoaded) {
            return loadingText;
          }

          return (
            <>
              Hello, and welcome to “MyComponent”! There are around ± 300 people
              visiting this page at the moment.
            </>
          );
        }
      }
      `,
      errors: [
        {
          messageId: "requireTypography",
        },
        {
          messageId: "requireTypography",
        },
        {
          messageId: "requireTypography",
        },
        {
          messageId: "requireTypography",
        },
        {
          messageId: "requireTypography",
        },
      ],
    },
  ],
});
