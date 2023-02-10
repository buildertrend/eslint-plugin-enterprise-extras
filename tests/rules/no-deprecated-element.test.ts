import rule, {
  NoDeprecatedElementOptions,
} from "../../src/rules/no-deprecated-element";
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

const optionsNoReplace: NoDeprecatedElementOptions = [
  {
    deprecate: [
      {
        element: "BadElement",
      },
    ],
  },
];

const optionsReplace: NoDeprecatedElementOptions = [
  {
    deprecate: [
      {
        element: "BadElement",
        replaceWith: "GoodElement",
      },
    ],
  },
];

ruleTester.run("no-deprecated-element", rule, {
  valid: [
    {
      code: `<GoodElement />`,
      options: optionsNoReplace,
    },
    {
      code: `<GoodElement prop="Test" />`,
      options: optionsNoReplace,
    },
    {
      code: `<GoodElement>WithChildren</GoodElement>`,
      options: optionsNoReplace,
    },
    {
      code: `<GoodElement prop="test">WithChildren</GoodElement>`,
      options: optionsNoReplace,
    },
  ],

  invalid: [
    // With replacement
    {
      code: `<BadElement />`,
      output: `<GoodElement />`,
      options: optionsReplace,
      errors: [
        {
          messageId: "noDeprecatedElement_replacement",
        },
      ],
    },
    {
      code: `<BadElement prop="Test" />`,
      output: `<GoodElement prop="Test" />`,
      options: optionsReplace,
      errors: [
        {
          messageId: "noDeprecatedElement_replacement",
        },
      ],
    },
    {
      code: `<BadElement>WithChildren</BadElement>`,
      output: `<GoodElement>WithChildren</GoodElement>`,
      options: optionsReplace,
      errors: [
        {
          messageId: "noDeprecatedElement_replacement",
        },
      ],
    },
    {
      code: `<BadElement prop="test">WithChildren</BadElement>`,
      output: `<GoodElement prop="test">WithChildren</GoodElement>`,
      options: optionsReplace,
      errors: [
        {
          messageId: "noDeprecatedElement_replacement",
        },
      ],
    },

    // No replacement specified
    {
      code: `<BadElement />`,
      options: optionsNoReplace,
      errors: [
        {
          messageId: "noDeprecatedElement",
        },
      ],
    },
    {
      code: `<BadElement prop="Test" />`,
      options: optionsNoReplace,
      errors: [
        {
          messageId: "noDeprecatedElement",
        },
      ],
    },
    {
      code: `<BadElement>WithChildren</BadElement>`,
      options: optionsNoReplace,
      errors: [
        {
          messageId: "noDeprecatedElement",
        },
      ],
    },
    {
      code: `<BadElement prop="test">WithChildren</BadElement>`,
      options: optionsNoReplace,
      errors: [
        {
          messageId: "noDeprecatedElement",
        },
      ],
    },
  ],
});
