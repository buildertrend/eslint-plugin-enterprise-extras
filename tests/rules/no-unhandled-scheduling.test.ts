import rule from "../../src/rules/no-unhandled-scheduling";
import { ESLintUtils } from "@typescript-eslint/experimental-utils";
import { resolve, join } from "path";

const ruleTester = new ESLintUtils.RuleTester({
  parser: resolve("./node_modules/@typescript-eslint/parser") as any,
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: join(__dirname, "../fixtures"),
    project: "./tsconfig.json",
  },
});

ruleTester.run("no-unhandled-scheduling", rule, {
  valid: [
    `
      const handle = setTimeout(() => {});
    `,
    `
      handler(setTimeout(() => {}));
    `,
    `
      () => {
        let handle = setTimeout(() => {})
      }
    `,
    `
      const handle = setInterval(() => {});
    `,
    `
      handler(setInterval(() => {}));
    `,
    `
      () => {
        let handle = setInterval(() => {});
      }
    `,
    `
      const handle = window.setInterval(() => {});
    `,
    ,
    `
      const handle = global.setTimeout(() => {});
    `,
    `
      const handle = (window as any).setTimeout(() => {});
    `,
    `
      void setTimeout(() => {});
    `,
    `
      void window.setTimeout(() => {});
    `,
  ],
  invalid: [
    {
      code: `
        setTimeout(() => {});
      `,
      errors: [
        {
          messageId: "noUnhandledScheduling",
          data: {
            scheduleFunc: "setTimeout",
            scheduleClearFunc: "clearTimeout",
          },
        },
      ],
    },
    {
      code: `
        setInterval(() => {});
      `,
      errors: [
        {
          messageId: "noUnhandledScheduling",
          data: {
            scheduleFunc: "setInterval",
            scheduleClearFunc: "clearInterval",
          },
        },
      ],
    },
    {
      code: `
        () => {
          setTimeout(() => {});
        }
      `,
      errors: [
        {
          messageId: "noUnhandledScheduling",
          data: {
            scheduleFunc: "setTimeout",
            scheduleClearFunc: "clearTimeout",
          },
        },
      ],
    },
    {
      code: `
        () => {
          global.setInterval(() => {});
        }
      `,
      errors: [
        {
          messageId: "noUnhandledScheduling",
          data: {
            scheduleFunc: "setInterval",
            scheduleClearFunc: "clearInterval",
          },
        },
      ],
    },
    {
      code: `
        window.setTimeout(() => {});
      `,
      errors: [
        {
          messageId: "noUnhandledScheduling",
          data: {
            scheduleFunc: "setTimeout",
            scheduleClearFunc: "clearTimeout",
          },
        },
      ],
    },
    {
      code: `
        (window as any).setInterval(() => {});
      `,
      errors: [
        {
          messageId: "noUnhandledScheduling",
          data: {
            scheduleFunc: "setInterval",
            scheduleClearFunc: "clearInterval",
          },
        },
      ],
    },
  ],
});
