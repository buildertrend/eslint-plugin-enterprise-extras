import rule from '../../src/rules/no-href-assignment';
import { TSESLint } from "@typescript-eslint/experimental-utils"
import { resolve, join } from 'path';

const ruleTester = new TSESLint.RuleTester({
  parser: resolve("./node_modules/@typescript-eslint/parser"),
  parserOptions: {
    sourceType: "module",
    tsconfigRootDir: join(__dirname, "../fixtures"),
    project: "./tsconfig.json",
  }
});

ruleTester.run("no-href-assignment", rule, {
    valid: [
        {
            code: `
window.location.href
            `
        }
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
                    messageId: "avoidHref"
                }
            ]
        }
    ]
})