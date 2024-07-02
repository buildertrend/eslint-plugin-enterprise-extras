import rule from "../../src/rules/private-component-methods";
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
    `
        class TestComponent extends React.Component {
          private prop;
        }
    `,
  ],

  invalid: [
    {
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
    },
    {
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
    },
    {
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
    },
    {
      code: `
        class TestComponent extends React.Component {
            get nonPrivateMethod() {}
            render() { return null; }
        }
    `,
      output: `
        class TestComponent extends React.Component {
            private get nonPrivateMethod() {}
            render() { return null; }
        }
    `,
      errors: [
        {
          messageId: "privateMethods",
        },
      ],
    },
  ],
});
