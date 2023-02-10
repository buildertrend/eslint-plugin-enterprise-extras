import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";

type MessageIds = "replaceDeprecatedComponents";
type Options = [];

export default ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/buildertrend/eslint-plugin-enterprise-extras/blob/main/docs/${name}.md`
)<Options, MessageIds>({
  name: "replace-deprecated-component",
  meta: {
    type: "suggestion",
    // fixable: "code",
    docs: {
      recommended: "error",
      description:
        "Deprecated components should be replaced with their new supported version whenever possible",
    },
    messages: {
      replaceDeprecatedComponents:
        "Component is marked as deprecated and should be replaced",
    },
    schema: [],
  },
  defaultOptions: [],
  create: function (context) {
    return {
      JSXElement: (jsxElement: TSESTree.JSXElement) => {
        context.report({
          node: jsxElement,
          messageId: "replaceDeprecatedComponents",
        });
      },
    };
  },
});
