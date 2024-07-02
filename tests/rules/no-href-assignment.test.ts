import rule from "../../src/rules/no-href-assignment";
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

ruleTester.run("no-href-assignment", rule, {
  valid: [
    "window.location.href;",
    'window.location.href === "test";',
    `
        () => {
            type Location = {
                href: string;
            }
            
            (tst: Location) => {
                tst.href = "test";
            }
        }
    `,
  ],
  invalid: [
    {
      code: `
        window.location.href = "http://google.com";
      `,
      output: `
        window.location.assign("http://google.com");
      `,
      errors: [
        {
          messageId: "avoidHref",
        },
      ],
    },
    {
      code: `
        window.top.location.href = "http://google.com";
      `,
      output: `
        window.top.location.assign("http://google.com");
      `,
      errors: [
        {
          messageId: "avoidHref",
        },
      ],
    },
    {
      code: `
        const { location: test } = window;
        test.href = "test123";
      `,
      output: `
        const { location: test } = window;
        test.assign("test123");
      `,
      errors: [
        {
          messageId: "avoidHref",
        },
      ],
    },
  ],
});
