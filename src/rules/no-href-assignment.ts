import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";
import { Declaration, Type } from "typescript";

type MessageIds = "avoidHref";
type Options = [];

/**
 * Given member expression, return the node of the parent object
 *
 * Examples:
 * - `foo.bar.fizz` returns bar
 * - `bar.fizz` returns bar
 * - `bar[5].fizz` returns undefined
 */
const getParentObjectOfMemberExpression = (
  memberExp: TSESTree.MemberExpression
):
  | TSESTree.Expression
  | TSESTree.Identifier
  | TSESTree.PrivateIdentifier
  | undefined => {
  const memberExpObj = memberExp.object;

  if (memberExpObj.type === "MemberExpression") {
    return memberExpObj.property;
  } else if (memberExpObj.type === "Identifier") {
    return memberExpObj;
  } else {
    return undefined;
  }
};

const libDomFileNameRegex = /typescript.+lib.+lib\.dom\.d\.ts/;
const isTypeDeclarationFromLibDom = (
  declaration: Declaration | undefined | null
) => {
  return libDomFileNameRegex.test(declaration?.getSourceFile().fileName);
};

const isWindowLocationType = (type: Type) => {
  const symbol = type.getSymbol();
  return (
    symbol.getEscapedName() === "Location" &&
    isTypeDeclarationFromLibDom(symbol.valueDeclaration)
  );
};

export default ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/buildertrend/eslint-plugin-enterprise-extras/blob/main/docs/${name}.md`
)<Options, MessageIds>({
  name: "no-href-assignment",
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: {
      recommended: "error",
      description: "Prefer using location.assign() to make testing easier",
    },
    messages: {
      avoidHref:
        "Prefer using location.assign() instead of href direct assignments",
    },
    schema: [],
  },
  defaultOptions: [],
  create: function (context) {
    return {
      /** Matches `*.href = *;` */
      "AssignmentExpression[operator='='][left.type='MemberExpression'][left.property.name='href']":
        (assignExp: TSESTree.AssignmentExpression) => {
          const leftExp = assignExp.left as TSESTree.MemberExpression;
          const parserServices = ESLintUtils.getParserServices(context);
          const parentObject = getParentObjectOfMemberExpression(leftExp);

          if (parentObject) {
            const tsNode =
              parserServices.esTreeNodeToTSNodeMap.get(parentObject);
            const typeChecker = parserServices.program.getTypeChecker();
            const type = typeChecker.getTypeAtLocation(tsNode);

            if (isWindowLocationType(type)) {
              context.report({
                node: assignExp,
                messageId: "avoidHref",
                fix: function (fixer) {
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
