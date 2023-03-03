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
        replace: {
          element: "GoodElement",
        },
      },
    ],
  },
];

ruleTester.run("no-deprecated-element", rule, {
  valid: [
    {
      code: `<></>`,
      options: optionsNoReplace,
    },
    {
      code: `<GoodElement />`,
      options: optionsNoReplace,
    },
    {
      code: `<GoodElement prop="Test" />`,
      options: optionsNoReplace,
    },
    {
      code: `<Parent.GoodElement prop="Test" />`,
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
      code: `<Parent.BadElement prop="Test" />`,
      output: `<Parent.GoodElement prop="Test" />`,
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
        {
          messageId: "noDeprecatedElement_replacement",
        },
      ],
    },
    {
      code: `<Parent.BadElement prop="test">WithChildren</Parent.BadElement>`,
      output: `<Parent.GoodElement prop="test">WithChildren</Parent.GoodElement>`,
      options: optionsReplace,
      errors: [
        {
          messageId: "noDeprecatedElement_replacement",
        },
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
      code: `<Parent.BadElement prop="Test" />`,
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
        {
          messageId: "noDeprecatedElement",
        },
      ],
    },
    {
      code: `<Parent.BadElement prop="test">WithChildren</Parent.BadElement>`,
      options: optionsNoReplace,
      errors: [
        {
          messageId: "noDeprecatedElement",
        },
        {
          messageId: "noDeprecatedElement",
        },
      ],
    },
    // Prop translation/metaprogramming
    {
      code: `<BadElement deleteMe1="Test" deleteMe2 />`,
      output: `<GoodElement   />`,
      options: [
        {
          deprecate: [
            {
              element: "BadElement",
              replace: {
                element: "GoodElement",
                removeProps: ["deleteMe1", "deleteMe2"],
              },
            },
          ],
        },
      ],
      errors: [
        {
          messageId: "noDeprecatedElement_replacement",
        },
      ],
    },
    {
      code: `<BadElement doNothingToMe="1234" />`,
      output: `<GoodElement propToAdd="I should be added" doNothingToMe="1234" />`,
      options: [
        {
          deprecate: [
            {
              element: "BadElement",
              replace: {
                element: "GoodElement",
                addProps: [
                  {
                    key: "propToAdd",
                    defaultValue: '"I should be added"',
                  },
                ],
              },
            },
          ],
        },
      ],
      errors: [
        {
          messageId: "noDeprecatedElement_replacement",
        },
      ],
    },
    {
      code: `<BadElement />`,
      output: `<GoodElement numberProp={123} stringProp="hello" functionProp={() => {}} falseProp={false} trueProp />`,
      options: [
        {
          deprecate: [
            {
              element: "BadElement",
              replace: {
                element: "GoodElement",
                addProps: [
                  {
                    key: "numberProp",
                    defaultValue: "{123}",
                  },
                  {
                    key: "stringProp",
                    defaultValue: '"hello"',
                  },
                  {
                    key: "functionProp",
                    defaultValue: "{() => {}}",
                  },
                  {
                    key: "falseProp",
                    defaultValue: "{false}",
                  },
                  {
                    key: "trueProp",
                    defaultValue: "{true}",
                  },
                ],
              },
            },
          ],
        },
      ],
      errors: [
        {
          messageId: "noDeprecatedElement_replacement",
        },
      ],
    },
    {
      code: `<BadElement replaceMe1={1} replaceMe2="two" replaceMe3={() => 3} replaceMe4={false} replaceMe5 />`,
      output: `<GoodElement replaced1a={1} replaced1b={1} replaced2="two" replaced3={() => 3} replaced4={false} replaced5      />`,
      options: [
        {
          deprecate: [
            {
              element: "BadElement",
              replace: {
                element: "GoodElement",
                addProps: [
                  {
                    key: "replaced1a",
                    defaultValue: "{4321}",
                    keysToPullValueFrom: ["replaceMe1"],
                  },
                  {
                    key: "replaced1b",
                    defaultValue: "{4321}",
                    keysToPullValueFrom: ["replaceMe1"],
                  },
                  {
                    key: "replaced2",
                    defaultValue: '"SHOULD NOT USE THIS"',
                    keysToPullValueFrom: ["replaceMe2"],
                  },
                  {
                    key: "replaced3",
                    defaultValue: "{() => { /* should not use this */ }}",
                    keysToPullValueFrom: ["replaceMe3"],
                  },
                  {
                    key: "replaced4",
                    defaultValue: "{true}",
                    keysToPullValueFrom: ["replaceMe4"],
                  },
                  {
                    key: "replaced5",
                    defaultValue: "{false}",
                    keysToPullValueFrom: ["replaceMe5"],
                  },
                ],
                removeProps: [
                  "replaceMe1",
                  "replaceMe2",
                  "replaceMe3",
                  "replaceMe4",
                  "replaceMe5",
                ],
              },
            },
          ],
        },
      ],
      errors: [
        {
          messageId: "noDeprecatedElement_replacement",
        },
      ],
    },
    {
      code: `<BadElement iShouldBeOverwritten />`,
      output: `<GoodElement iShouldBeOverwritten={2} />`,
      options: [
        {
          deprecate: [
            {
              element: "BadElement",
              replace: {
                element: "GoodElement",
                addProps: [
                  {
                    key: "iShouldBeOverwritten",
                    defaultValue: "{2}",
                  },
                ],
                removeProps: ["iShouldBeOverwritten"],
              },
            },
          ],
        },
      ],
      errors: [
        {
          messageId: "noDeprecatedElement_replacement",
        },
      ],
    },
    {
      code: `<BadElement iShouldntBeOverwritten />`,
      output: `<GoodElement iShouldntBeOverwritten />`,
      options: [
        {
          deprecate: [
            {
              element: "BadElement",
              replace: {
                element: "GoodElement",
                addProps: [
                  {
                    key: "iShouldntBeOverwritten",
                    defaultValue: "{false}",
                  },
                ],
              },
            },
          ],
        },
      ],
      errors: [
        {
          messageId: "noDeprecatedElement_replacement",
        },
      ],
    },
  ],
});
