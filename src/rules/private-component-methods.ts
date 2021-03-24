import { ESLintUtils, TSESTree } from "@typescript-eslint/experimental-utils";

type MessageIds = "privateMethods";
type Options = [];

const reactLifecycleMethods = new Set([
  "componentWillMount",
  "render",
  "componentDidMount",
  "componentWillReceiveProps",
  "shouldComponentUpdate",
  "componentWillUpdate",
  "componentDidUpdate",
  "componentWillUnmount",
  "getDerivedStateFromProps",
]);

const isLifecycleMethod = (identifier: TSESTree.Identifier) => {
  return reactLifecycleMethods.has(identifier.name);
};

export default ESLintUtils.RuleCreator((name) => `https://github.com/C-Hess/eslint-plugin-cameron/blob/main/docs/${name}.md`)<
  Options,
  MessageIds
>({
  name: "private-component-methods",
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: {
      category: "Best Practices",
      recommended: false,
      description:
        "Non-lifecycle methods for React class components should be private to help find unused handlers",
    },
    messages: {
      privateMethods:
        "Non-lifecycle methods for React class components should be private",
    },
    schema: [],
  },
  defaultOptions: [],
  create: function(context) {
    return {
      "ClassDeclaration[superClass.property.name=/PureComponent|Component/]": (
        classDecl: TSESTree.ClassDeclaration
      ) => {
        classDecl.body.body
          .filter((b) => {
            if (b.type === "ClassProperty") {
              const classProp = b as TSESTree.ClassProperty;
              return (
                /^(Arrow)?FunctionExpression$/.test(classProp.value.type) &&
                !classProp.static &&
                classProp.accessibility !== "private"
              );
            } else if (b.type === "MethodDefinition") {
              const methodDef = b as TSESTree.MethodDefinition;
              return !methodDef.static && methodDef.accessibility !== "private";
            } else {
              return false;
            }
          })
          .filter(
            (b: TSESTree.ClassProperty | TSESTree.MethodDefinition) =>
              b.key.type === "Identifier" && !isLifecycleMethod(b.key)
          )
          .map((b: TSESTree.ClassProperty | TSESTree.MethodDefinition) => b.key)
          .forEach((b) =>
            context.report({
              node: b,
              messageId: "privateMethods",
              fix: (fixer) => fixer.insertTextBefore(b, "private "),
            })
          );
      },
    };
  },
});
