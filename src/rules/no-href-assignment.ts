import { ESLintUtils, TSESTree } from "@typescript-eslint/experimental-utils";
import { TSESTreeToTSNode } from "@typescript-eslint/typescript-estree";

type MessageIds = "avoidHref";
type Options = [];

export default ESLintUtils.RuleCreator((name) => `https://github.com/C-Hess/eslint-plugin-cameron/blob/main/docs/${name}.md`)<
  Options,
  MessageIds
>({
  name: "no-href-assignment",
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: {
      category: "Best Practices",
      recommended: false,
      description: "Prefer using location.assigned to make testing easier",
    },
    messages: {
      avoidHref:
        "Prefer using location.assigned instead of href direct assignments",
    },
    schema: [],
  },
  defaultOptions: [],
  create: function(context) {
    return {
      "AssignmentExpression[operator='='][left.type='MemberExpression'][left.property.name='href']": (
        assignExp: TSESTree.AssignmentExpression
      ) => {
        const leftExp = assignExp.left as TSESTree.MemberExpression;
        const parserServices = ESLintUtils.getParserServices(context);
        let tsNode:
          | TSESTreeToTSNode<TSESTree.Identifier>
          | TSESTreeToTSNode<TSESTree.Expression>
          | undefined;
        if (leftExp.object.type === "MemberExpression") {
          tsNode = parserServices.esTreeNodeToTSNodeMap.get(
            (leftExp.object as TSESTree.MemberExpression).property
          );
        } else if (leftExp.object.type === "Identifier") {
          tsNode = parserServices.esTreeNodeToTSNodeMap.get(leftExp.object);
        }

        if (tsNode) {
          const typeChecker = parserServices.program.getTypeChecker();
          const type = typeChecker.getTypeAtLocation(tsNode);
          if (type.getSymbol().getEscapedName() === "Location") {
            context.report({
              node: assignExp,
              messageId: "avoidHref",
              fix: function(fixer) {
                return [
                  fixer.replaceTextRange(
                    [leftExp.property.range[0], assignExp.right.range[0]],
                    "assign("
                  ),
                  fixer.insertTextAfter(assignExp.right, ")"),
                ];
              },
            });
          }
        }
      },
    };
  },
});
