import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";

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
    const keysToDeprecate = Object.keys(deprecationMap);
    return {
      JSXElement: (jsxElement: TSESTree.JSXElement) => {
        const startingIdentifier = jsxElement.openingElement
          .name as TSESTree.JSXIdentifier;

        if (!keysToDeprecate.includes(startingIdentifier.name)) {
          return;
        }

        const deprecation = deprecationMap[startingIdentifier.name];
        const replacement = deprecation.replaceWith;
        if (replacement === undefined) {
          context.report({
            node: startingIdentifier,
            messageId: "noDeprecatedElement",
            data: {
              ...deprecation,
            },
          });
          return;
        }

        context.report({
          node: startingIdentifier,
          messageId: "noDeprecatedElement_replacement",
          fix: function (fixer) {
            const fixes = [fixer.replaceText(startingIdentifier, replacement)];
            const closingIdentifier = jsxElement.closingElement?.name as
              | TSESTree.JSXIdentifier
              | undefined;
            if (closingIdentifier) {
              fixes.push(fixer.replaceText(closingIdentifier, replacement));
            }

            return fixes;
          },
          data: {
            ...deprecation,
          },
        });
      },
    };
  },
});
