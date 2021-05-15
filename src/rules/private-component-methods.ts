import { ESLintUtils, TSESTree } from "@typescript-eslint/experimental-utils";
import { isMethod } from "../utils/type-guards";

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
  "getSnapshotBeforeUpdate",
  "constructor",
]);

const isLifecycleMethod = (
  method: TSESTree.ClassProperty | TSESTree.MethodDefinition
) => {
  return (
    method.key.type === "Identifier" &&
    reactLifecycleMethods.has(method.key.name)
  );
};

export default ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/C-Hess/eslint-plugin-enterprise-extras/blob/main/docs/${name}.md`
)<Options, MessageIds>({
  name: "private-component-methods",
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: {
      category: "Best Practices",
      recommended: "error",
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
          .filter((classEl) => {
            return (
              isMethod(classEl) &&
              !classEl.static &&
              classEl.accessibility !== "private" &&
              !isLifecycleMethod(classEl)
            );
          })
          .forEach((b: TSESTree.ClassProperty | TSESTree.MethodDefinition) =>
            context.report({
              node: b.key,
              messageId: "privateMethods",
              fix: (fixer) => fixer.insertTextBefore(b, "private "),
            })
          );
      },
    };
  },
});
