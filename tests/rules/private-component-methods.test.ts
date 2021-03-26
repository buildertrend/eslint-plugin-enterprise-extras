import rule from "../../src/rules/private-component-methods";
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

ruleTester.run("private-component-methods", rule, {
  valid: [
    `
        class Test {
            nonPrivateMethod() {}
        }
    `,
    `
        class Test {
            nonPrivateMethod = () => {};
        }
    `,
    `
        class Test {
            nonPrivateMethod = function() {};
        }
    `,
    `
        class TestComponent extends React.Component {
            static nonPrivateButStaticMethod = function() {};
        }
    `,
    `
        class TestComponent extends React.Component {
            state = { };
            static defaultProps = { }
            constructor(props) {}
            static getDerivedStateFromProps(props, state) {}
            componentDidMount() {}
            componentWillUnmount() {}
            shouldComponentUpdate() {}
            getSnapshotBeforeUpdate() {}
            componentDidUpdate() {}
            render() {}
        }
    `,
    `
        class TestComponent extends React.Component {
            render() {
                class InnerClass {
                    nonPrivateMethod() {}
                }
                return null;
            }
        }
    `,
  ],

  invalid: [{
    code: `
        class TestComponent extends React.Component {
            nonPrivateMethod() {}
            render() { return null; }
        }
    `,
    output: `
        class TestComponent extends React.Component {
            private nonPrivateMethod() {}
            render() { return null; }
        }
    `,
    errors: [
      {
        messageId: "privateMethods",
      },
    ],
  }, {
    code: `
        class TestComponent extends React.Component {
            nonPrivateMethod = () => {}
            render() { return null; }
        }
    `,
    output: `
        class TestComponent extends React.Component {
            private nonPrivateMethod = () => {}
            render() { return null; }
        }
    `,
    errors: [
      {
        messageId: "privateMethods",
      },
    ],
  }, {
    code: `
        class TestComponent extends React.Component {
            nonPrivateMethod = function() {}
            render() { return null; }
        }
    `,
    output: `
        class TestComponent extends React.Component {
            private nonPrivateMethod = function() {}
            render() { return null; }
        }
    `,
    errors: [
      {
        messageId: "privateMethods",
      },
    ],
  }],
});
