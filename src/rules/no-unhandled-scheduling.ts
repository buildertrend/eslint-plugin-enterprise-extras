import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";
import { isAsExpression, isIdentifier } from "../utils/type-guards";

type MessageIds = "noUnhandledScheduling";
type Options = [];

const scheduleFuncRegex = /setTimeout|setInterval/;
const globalVarRegex = /window|global/;

export default ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/buildertrend/eslint-plugin-enterprise-extras/blob/main/docs/${name}.md`,
)<Options, MessageIds>({
  name: "no-unhandled-scheduling",
  meta: {
    type: "suggestion",
    docs: {
      recommended: "strict",
      description:
        "When using Javascript scheduling (`setTimeout` or `setInterval`), it is recommended to support cancelling of the task, especially within React components.",
    },
    messages: {
      noUnhandledScheduling:
        "Avoid scheduling uncancellable `{{ scheduleFunc }}` tasks. Use the returned handle to cancel the operation with `{{ scheduleClearFunc }}` when needed.",
    },
    schema: [],
  },
  defaultOptions: [],
  create: function (context) {
    const reportError = (callExpression: TSESTree.CallExpression) => {
      let expression: TSESTree.Expression | TSESTree.PrivateIdentifier =
        callExpression.callee;

      // Drill down expression if on global/window objects
      if (expression.type === "MemberExpression") {
        if (
          isIdentifier(expression.object) &&
          globalVarRegex.test(expression.object.name)
        ) {
          expression = expression.property;
        } else if (
          isAsExpression(expression.object) &&
          isIdentifier(expression.object.expression) &&
          globalVarRegex.test(expression.object.expression.name)
        ) {
          expression = expression.property;
        }
      }

      // Once we have drilled down, test that we are at an identifier and that it is a schedule function
      if (isIdentifier(expression) && scheduleFuncRegex.test(expression.name)) {
        const funcName = expression.name;
        const clearFuncName = funcName.replace("set", "clear");
        context.report({
          node: callExpression,
          messageId: "noUnhandledScheduling",
          data: {
            scheduleFunc: funcName,
            scheduleClearFunc: clearFuncName,
          },
        });
      }
    };

    return {
      "BlockStatement > ExpressionStatement > CallExpression": reportError,
      "Program > ExpressionStatement > CallExpression": reportError,
    };
  },
});
