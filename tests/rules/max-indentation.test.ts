import rule from "../../src/rules/max-indentation";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { resolve, join } from "path";

const ruleTester = new RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: join(__dirname, "../fixtures"),
    project: "./tsconfig.json",
  },
});

ruleTester.run("max-indentation", rule, {
  valid: [
    {
      code: `const myString = "        ";`,
      options: [3, { includeSpaces: true, includeTab: true, spacesPerTab: 2 }],
    },
    {
      code: `const myString = "\t\t\t\t";`,
      options: [3, { includeSpaces: true, includeTab: true, spacesPerTab: 2 }],
    },
    {
      code: "const myString = `        `;",
      options: [3, { includeSpaces: true, includeTab: true, spacesPerTab: 2 }],
    },
    {
      code: "// My comment with         too many spaces",
      options: [3, { includeSpaces: true, includeTab: true, spacesPerTab: 2 }],
    },
    {
      code: "// My comment with \t\t\t\t too many tabs",
      options: [3, { includeSpaces: true, includeTab: true, spacesPerTab: 2 }],
    },
    {
      code: "        ",
      options: [3, { includeSpaces: true, includeTab: true, spacesPerTab: 4 }],
    },
    {
      code: "        ",
      options: [3, { includeSpaces: false, includeTab: true, spacesPerTab: 2 }],
    },
    {
      code: "\t\t\t\t",
      options: [3, { includeSpaces: true, includeTab: false, spacesPerTab: 2 }],
    },
    {
      code: "\t  \t",
      options: [3, { includeSpaces: true, includeTab: true, spacesPerTab: 2 }],
    },
    {
      code: `
function mainStressTest() {
    //                 I really should not cause an issue with too many indentations
    const myString = "                I also should not cause an issue with too many indentations";
    const myTemplate = \`                I also should not cause an issue with too many indentations\`;
    const innerFunc = () => {
        const iAmCurrentlyAt2Indents = 0;
        if (true) {
            const iAmCurrentlyAt3Indents = 5;
        }
    };
}
      `,
      options: [3, { includeSpaces: true, includeTab: true, spacesPerTab: 4 }],
    },
  ],
  invalid: [
    {
      code: "        ",
      options: [3, { includeSpaces: true, includeTab: true, spacesPerTab: 2 }],
      errors: [
        {
          messageId: "maxIndentationExceeded",
        },
      ],
    },
    {
      code: "\t\t\t\t",
      options: [3, { includeSpaces: true, includeTab: true, spacesPerTab: 2 }],
      errors: [
        {
          messageId: "maxIndentationExceeded",
        },
      ],
    },
    {
      code: "\t  \t  ",
      options: [3, { includeSpaces: true, includeTab: true, spacesPerTab: 2 }],
      errors: [
        {
          messageId: "maxIndentationExceeded",
        },
      ],
    },
    {
      code: `
function mainStressTest() {
    //                 I really should not cause an issue with too many indentations
    const myString = "                I also should not cause an issue with too many indentations";
    const myTemplate = \`                I also should not cause an issue with too many indentations\`;
    const innerFunc = () => {
        const iAmCurrentlyAt2Indents = 0;
        if (true) {
            const iAmCurrentlyAt3Indents = 5;
            while (Math.random() > 0.5) {
                const iAmAboveTheMaxAndShouldFail = 6;
            }
        }
    };
}
      `,
      options: [3, { includeSpaces: true, includeTab: true, spacesPerTab: 4 }],
      errors: [
        {
          messageId: "maxIndentationExceeded",
        },
      ],
    },
  ],
});
