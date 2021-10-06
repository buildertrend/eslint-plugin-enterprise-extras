import rule from "../../src/rules/unregister-events";
import { ESLintUtils } from "@typescript-eslint/experimental-utils";
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

ruleTester.run("unregister-events", rule, {
  valid: [
    `
      window.addEventListener("scroll", () => {});
    `,
    `
      addEventListener("scroll", () => {});
    `,
    `
      class MyComponent extends React.Component {
        private handler = () => {

        };

        componentDidMount() {
          window.addEventListener("scroll", handler);
        }

        componentWillUnmount() {
          window.removeEventListener("scroll", handler);
        }

        render() {
          return null;
        }
      }
    `,
    `
      class MyComponent extends React.Component {
        private handler = () => {

        };

        componentDidMount() {
          window.addEventListener("scroll", handler);
        }

        componentWillUnmount() {
          removeEventListener("scroll", handler);
        }

        render() {
          return null;
        }
      }
    `,
    `
      class MyComponent extends React.Component {
        private handler = () => {

        };

        componentDidMount = () => {
          window.addEventListener("scroll", handler);
        }

        componentWillUnmount = () => {
          window.removeEventListener("scroll", handler);
        }

        render() {
          return null;
        }
      }
    `,
    `
      class MyComponent extends React.PureComponent {
        private handler = () => {

        };

        componentDidMount() {
          window.addEventListener("scroll", handler);
        }

        componentWillUnmount() {
          window.removeEventListener("scroll", handler);
        }

        render() {
          return null;
        }
      }
    `,
    `
      class MyComponent extends React.Component {
        private handler = () => {

        };

        componentDidMount() {
          addEventListener("scroll", handler);
        }

        componentWillUnmount() {
          removeEventListener("scroll", handler);
        }

        render() {
          return null;
        }
      }
    `,
    `
      const MyComponent: React.FC = () => {
        useEffect(() => {
          const handler = () => {};

          window.addEventListener("scroll", handler);

          return () => {
            window.removeEventListener("scroll", handler);
          }
        })

        return null;
      }
    `,
    `
      const MyComponent: React.FC = () => {
        useEffect(() => {
          const handler = () => {};

          addEventListener("scroll", handler);

          return () => {
            removeEventListener("scroll", handler);
          }
        })

        return null;
      }
    `,
    `
      const MyComponent: React.FC = () => {
        useEffect(() => {
          const handler = () => {};

          document.addEventListener("scroll", handler);

          return () => {
            document.removeEventListener("scroll", handler);
          }
        })

        return null;
      }
    `,
    `
      function MyComponent() {
        useEffect(() => {
          const handler = () => {};

          addEventListener("scroll", handler);

          return () => {
            removeEventListener("scroll", handler);
          }
        })

        return null;
      }
    `,
    `
      const MyComponent: React.FC = () => {
        React.useEffect(() => {
          const handler = () => {};

          addEventListener("scroll", handler);

          return () => {
            removeEventListener("scroll", handler);
          }
        })

        return null;
      }
    `,
    `
      const MyComponent: React.FC = () => {
        React.useEffect(() => {
          const handler = () => {};

          if (Math.random() > 0.5) {
            addEventListener("scroll", handler);

            return () => {
              removeEventListener("scroll", handler);
            }
          }

          return () => {};
        })

        return null;
      }
    `,
    `
      const MyComponent: React.FC = () => {
        useEffect(() => {
          return () => {
            removeEventListener("scroll", handler);
          }
        })

        return <div onClick={() => addEventListener("scroll", handler)} />;
      }
    `,
    `
      class MyComponent extends React.Component {
        private handler = () => {

        };

        componentWillUnmount() {
          window.removeEventListener("scroll", handler);
        }

        render() {
          return <div onClick={() => addEventListener("scroll", handler)} />;
        }
      }
    `,
  ],
  invalid: [
    {
      code: `
        class MyComponent extends React.Component {
          private handler = () => {

          };

          componentDidMount() {
            window.addEventListener("scroll", handler);
          }

          render() {
            return null;
          }
        }
      `,
      errors: [
        {
          messageId: "unregisterEventsInClass",
        },
      ],
    },
    {
      code: `
        class MyComponent extends React.Component {
          private handler = () => {

          };

          componentDidMount = () => {
            window.addEventListener("scroll", handler);
          }

          render() {
            return null;
          }
        }
      `,
      errors: [
        {
          messageId: "unregisterEventsInClass",
        },
      ],
    },
    {
      code: `
        class MyComponent extends React.PureComponent {
          private handler = () => {

          };

          componentDidMount() {
            window.addEventListener("scroll", handler);
          }

          componentWillUnmount() {
            // window.removeEventListener("scroll", handler);
          }

          render() {
            return null;
          }
        }
      `,
      errors: [
        {
          messageId: "unregisterEventsInClass",
        },
      ],
    },
    {
      code: `
        const MyComponent: React.FC = () => {
          useEffect(() => {
            const handler = () => {};

            window.addEventListener("scroll", handler);
          })

          return null;
        }
      `,
      errors: [
        {
          messageId: "unregisterEventsInHook",
        },
      ],
    },
    {
      code: `
        const MyComponent: React.FC = () => {
          useEffect(() => {
            const handler = () => {};

            addEventListener("scroll", handler);
          })

          return null;
        }
      `,
      errors: [
        {
          messageId: "unregisterEventsInHook",
        },
      ],
    },
    {
      code: `
        function MyComponent() {
          useEffect(() => {
            const handler = () => {};

            addEventListener("scroll", handler);
          })

          return null;
        }
      `,
      errors: [
        {
          messageId: "unregisterEventsInHook",
        },
      ],
    },
    {
      code: `
        const MyComponent: React.FC = () => {
          React.useEffect(() => {
            const handler = () => {};

            addEventListener("scroll", handler);
          })

          return null;
        }
      `,
      errors: [
        {
          messageId: "unregisterEventsInHook",
        },
      ],
    },
    {
      code: `
        const MyComponent: React.FC = () => {
          React.useEffect(() => {
            const handler = () => {};

            if (Math.random() > 0.5) {
              addEventListener("scroll", handler);
            }

            return () => {};
          })

          return null;
        }
      `,
      errors: [
        {
          messageId: "unregisterEventsInHook",
        },
      ],
    },
    {
      code: `
        const MyComponent: React.FC = () => {
          useEffect(() => {
            const handler = () => {};

            addEventListener("scroll", handler);

            () => {
              removeEventListener("scroll", handler);
            };
          })

          return null;
        }
      `,
      errors: [
        {
          messageId: "unregisterEventsInHook",
        },
      ],
    },
    {
      code: `
        const MyComponent: React.FC = () => {
          useEffect(() => {
            const handler = () => {};

            addEventListener("scroll", handler);

            () => {
              removeEventListener("notScroll", handler);
            };
          })

          return null;
        }
      `,
      errors: [
        {
          messageId: "unregisterEventsInHook",
        },
      ],
    },
    {
      code: `
        const MyComponent: React.FC = () => {
          useEffect(() => {
            const handler = () => {};

            addEventListener("scroll1", handler);
            addEventListener("scroll2", handler);
          })

          return null;
        }
      `,
      errors: [
        {
          messageId: "unregisterEventsInHook",
        },
        {
          messageId: "unregisterEventsInHook",
        },
      ],
    },
    {
      code: `
        const MyComponent: React.FC = () => {
          useEffect(() => {
            const handler = () => {};

            document.addEventListener("scroll", handler);
          })

          return null;
        }
      `,
      errors: [
        {
          messageId: "unregisterEventsInHook",
        },
      ],
    },
  ],
});
