import rule from "../../src/rules/require-state-property-definition";
import { ESLintUtils } from "@typescript-eslint/utils";
import { resolve, join } from "path";

const ruleTester = new ESLintUtils.RuleTester({
  parser: resolve("./node_modules/@typescript-eslint/parser") as any,
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: join(__dirname, "../fixtures"),
    project: "./tsconfig.json",
  },
});

ruleTester.run("require-state-property-definition", rule, {
  valid: [
    `
        class NotAReactComponent extends Def.Not.A.Component {
            render() {
                return 123123123;
            }
        }
    `,
    `
        class MyComponent extends React.Component<IProps> {
            render() {
                return null;
            }
        }
    `,
    `
        class MyComponent extends React.Component<IProps, IMyState> {
            state: {}
            
            render() {
                return null;
            }
        }
    `,
    `
        class MyComponent extends React.PureComponent<IProps, IMyState> {
            state: {}
            
            render() {
                return null;
            }
        }
    `,
    `
        class MyComponent extends React.Component<IProps, IMyState> {
            constructor(props: IProps) {
                super(props);
                this.state = {};
            }
            
            render() {
                return null;
            }
        }
    `,
    `
        class MyComponent extends React.PureComponent<IProps, IMyState> {
            constructor(props: IProps) {
                super(props);
                this.state = {};
            }

            render() {
                return null;
            }
        }
    `,
  ],
  invalid: [
    {
      code: `
        class MyComponent extends React.PureComponent<IProps, IMyState> {          
            render() {
                return null;
            }
        }
      `,
      errors: [
        {
          messageId: "requireStatePropertyDefinition",
        },
      ],
    },
    {
      code: `
        class MyComponent extends React.Component<IProps, IMyState> {          
            render() {
                return null;
            }
        }
      `,
      errors: [
        {
          messageId: "requireStatePropertyDefinition",
        },
      ],
    },
    {
      code: `
        class MyComponent extends React.Component<IProps> {         
            state: {} 
            render() {
                return null;
            }
        }
      `,
      errors: [
        {
          messageId: "unexpectedStatePropertyDefinition",
        },
      ],
    },
    {
      code: `
        class MyComponent extends React.PureComponent<IProps> {         
            state: {} 
            render() {
                return null;
            }
        }
      `,
      errors: [
        {
          messageId: "unexpectedStatePropertyDefinition",
        },
      ],
    },
    {
      code: `
        class MyComponent extends React.Component<IProps> {         
            constructor(props: IProps) {
                super(props);
                this.state = {};
            }

            render() {
                return null;
            }
        }
      `,
      errors: [
        {
          messageId: "unexpectedStatePropertyDefinition",
        },
      ],
    },
    {
      code: `
        class MyComponent extends React.PureComponent<IProps> {         
            constructor(props: IProps) {
                super(props);
                this.state = {};
            }

            render() {
                return null;
            }
        }
      `,
      errors: [
        {
          messageId: "unexpectedStatePropertyDefinition",
        },
      ],
    },
  ],
});
