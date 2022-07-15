import rule from "../../src/rules/no-unstable-dependencies";
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

ruleTester.run("no-unstable-dependencies", rule, {
  valid: [
    `
      class MyHandler {}
      interface MyProps {
        handler?: MyHandler;
      }
      const defaultHandler = new MyHandler();
      const MyComponent: React.FC<MyProps> = ({handler = defaultHandler}) => {
        React.useEffect(() => {}, [handler]);
      }
    `,
    `
      interface MyProps {
        handler: object;
      }
      const MyComponent: React.FC<MyProps> = ({handler}) => {
        React.useEffect(() => {}, [handler]);
      }
    `,
    `      
      interface MyProps {
        myNum?: number;
      }
      const MyComponent: React.FC<MyProps> = ({myNum = 432}) => {
        React.useEffect(() => {}, [handler]);
      }
    `,
    `
      interface MyProps {
        myString?: string;
      }
      const MyComponent: React.FC<MyProps> = ({myString = "123"}) => {
        React.useEffect(() => {}, [myString]);
      }
    `,
    `
      class MyHandler {}
      interface MyProps {
        handler?: MyHandler | string;
      }
      const MyComponent: React.FC = ({handler = new MyHandler()}) => {
        handler = "";
        React.useEffect(() => {}, [handler]);
      }
    `,
  ],

  invalid: [
    {
      code: `
        class MyHandler {}
        interface MyProps {
          handler?: MyHandler;
        }
        const MyComponent: React.FC<MyProps> = ({handler = new MyHandler()}) => {
          React.useEffect(() => {}, [handler]);
        }
      `,
      errors: [
        {
          messageId: "unstableDependency",
        },
        {
          messageId: "unstableDependency",
        },
      ],
    },
    {
      code: `
        interface MyProps {
          myComponent?: React.Element;
        }
        const MyComponent: React.FC<MyProps> = ({myComponent = <></>}) => {
          React.useEffect(() => {}, [myComponent]);
        }
      `,
      errors: [
        {
          messageId: "unstableDependency",
        },
        {
          messageId: "unstableDependency",
        },
      ],
    },
    {
      code: `
        interface MyProps {
          myComponent?: React.Element;
        }
        const MyComponent: React.FC<MyProps> = ({myComponent = <div></div>}) => {
          React.useEffect(() => {}, [myComponent]);
        }
      `,
      errors: [
        {
          messageId: "unstableDependency",
        },
        {
          messageId: "unstableDependency",
        },
      ],
    },
    {
      code: `
        interface MyProps {
          myHandler?: () => void;
        }
        const MyComponent: React.FC<MyProps> = ({myHandler = () => {}}) => {
          React.useEffect(() => {}, [myHandler]);
        }
      `,
      errors: [
        {
          messageId: "unstableDependency",
        },
        {
          messageId: "unstableDependency",
        },
      ],
    },
    {
      code: `
        const MyComponent: React.FC<any> = () => {
          const myFunction = () => {};
          React.useEffect(() => {}, [myFunction]);
        }
      `,
      errors: [
        {
          messageId: "unstableDependency",
        },
        {
          messageId: "unstableDependency",
        },
      ],
    },
    {
      code: `
        interface MyProps {
          myObj?: {};
        }
        const MyComponent: React.FC<MyProps> = ({myObj = {}}) => {
          React.useEffect(() => {}, [myObj]);
        }
      `,
      errors: [
        {
          messageId: "unstableDependency",
        },
        {
          messageId: "unstableDependency",
        },
      ],
    },
    {
      code: `
        interface MyProps {
          myArray?: number[];
        }
        const MyComponent: React.FC<MyProps> = ({myArray = []}) => {
          React.useEffect(() => {}, [myArray]);
        }
      `,
      errors: [
        {
          messageId: "unstableDependency",
        },
        {
          messageId: "unstableDependency",
        },
      ],
    },
    {
      code: `
        interface MyProps {
          myArray?: number[];
        }
        const MyComponent: React.FC<MyProps> = ({myArray = []}) => {
          myArray = [123];
          React.useEffect(() => {}, [myArray]);
        }
      `,
      errors: [
        {
          messageId: "unstableDependency",
        },
        {
          messageId: "unstableDependency",
        },
        {
          messageId: "unstableDependency",
        },
      ],
    },
    {
      code: `
        interface MyProps {
          myArray?: number[];
        }
        const MyComponent: React.FC<MyProps> = ({myArray = []}) => {
          React.useEffect(() => {}, [myArray]);
          React.useEffect(() => {}, [myArray]);
        }
      `,
      errors: [
        {
          messageId: "unstableDependency",
        },
        {
          messageId: "unstableDependency",
        },
        {
          messageId: "unstableDependency",
        },
      ],
    },
    {
      code: `
        interface MyProps {
          myArray?: number[];
        }
        const MyComponent: React.FC<MyProps> = ({myArray = []}) => {
          myArray = [123];
          React.useEffect(() => {}, [myArray]);
          React.useEffect(() => {}, [myArray]);
        }
      `,
      errors: [
        {
          messageId: "unstableDependency",
        },
        {
          messageId: "unstableDependency",
        },
        {
          messageId: "unstableDependency",
        },
        {
          messageId: "unstableDependency",
        },
      ],
    },
  ],
});
