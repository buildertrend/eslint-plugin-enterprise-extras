import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";
import { isJsxIdentifier, isJsxMemberExpression } from "../utils/type-guards";

type MessageIds = "noDeprecatedElement" | "noDeprecatedElement_replacement";
type Deprecated = {
  element: string;
  replaceWith?: string;
};
export type NoDeprecatedElementOptions = [
  {
    deprecate?: Deprecated[];
  }
];

const buildDeprecationMap = (
  context: Readonly<RuleContext<MessageIds, NoDeprecatedElementOptions>>
): {
  [key: string]: Deprecated;
} => {
  const replacements = context.options[0]?.deprecate;
  const replacementMap =
    replacements?.reduce((acc, curr) => {
      return {
        ...acc,
        [curr.element]: {
          ...curr,
        },
      };
    }, {}) ?? {};
  return replacementMap;
};

const getJsxIdentifier = (node?: TSESTree.JSXTagNameExpression) => {
  if (node === undefined) {
    return undefined;
  }
  let returnNode = node;
  if (isJsxMemberExpression(returnNode)) {
    returnNode = returnNode.property;
  }

  if (isJsxIdentifier(returnNode)) {
    return returnNode;
  }
  return undefined;
};

const messages = {
  noDeprecatedElement: "<{{element}}> is deprecated",
  noDeprecatedElement_replacement:
    "<{{element}}> is deprecated, use <{{replaceWith}}> instead.",
};

export default ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/buildertrend/eslint-plugin-enterprise-extras/blob/main/docs/${name}.md`
)<NoDeprecatedElementOptions, MessageIds>({
  name: "no-deprecated-element",
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: {
      recommended: "error",
      description: "Deprecated elements should not be used",
    },
    messages,
    schema: [
      {
        type: "object",
        properties: {
          deprecate: {
            type: "array",
            items: {
              allOf: [
                {
                  type: "object",
                  properties: {
                    element: { type: "string" },
                    replaceWith: { type: "string" },
                  },
                  required: ["element"],
                  additionalProperties: false,
                },
              ],
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create: function (context) {
    const deprecationMap = buildDeprecationMap(context);
    return {
      JSXElement: (jsxElement: TSESTree.JSXElement) => {
        const startingIdentifier = getJsxIdentifier(
          jsxElement.openingElement.name
        );
        const closingIdentifier = getJsxIdentifier(
          jsxElement.closingElement?.name
        );
        // If the start wasn't able to be parsed, stop processing
        if (startingIdentifier === undefined) {
          return;
        }

        // if the identifier isn't on the deprecation list, stop processing
        if (!(startingIdentifier.name in deprecationMap)) {
          return;
        }

        const deprecation = deprecationMap[startingIdentifier.name];
        const replacement = deprecation.replaceWith;
        if (replacement === undefined) {
          context.report({
            node: startingIdentifier,
            messageId: "noDeprecatedElement",
            data: deprecation,
          });

          if (closingIdentifier !== undefined) {
            context.report({
              node: closingIdentifier,
              messageId: "noDeprecatedElement",
              data: deprecation,
            });
          }
          return;
        }

        context.report({
          node: startingIdentifier,
          messageId: "noDeprecatedElement_replacement",
          fix: function (fixer) {
            return [fixer.replaceText(startingIdentifier, replacement)];
          },
          data: deprecation,
        });

        if (closingIdentifier !== undefined) {
          context.report({
            node: closingIdentifier,
            messageId: "noDeprecatedElement_replacement",
            fix: function (fixer) {
              return [fixer.replaceText(closingIdentifier, replacement)];
            },
            data: deprecation,
          });
        }
      },
    };
  },
});
