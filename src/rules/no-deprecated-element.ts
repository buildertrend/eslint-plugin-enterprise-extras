import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";

type MessageIds = "noDeprecatedElement" | "noDeprecatedElement_replacement";
type Replacement = {
  element: string;
  with?: string;
};
type Options = [
  {
    replace?: Replacement[];
  }
];

const buildReplacementMap = (
  context: Readonly<RuleContext<MessageIds, Options>>
): {
  [key: string]: Replacement;
} => {
  const replacements = context.options[0]?.replace;
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
    "<{{element}}> is deprecated, use <{{with}}> instead.",
};

export default ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/buildertrend/eslint-plugin-enterprise-extras/blob/main/docs/${name}.md`
)<Options, MessageIds>({
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
          replace: {
            type: "array",
            items: {
              allOf: [
                {
                  type: "object",
                  properties: {
                    element: { type: "string" },
                    with: { type: "string" },
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
    const replacementMap = buildReplacementMap(context);
    const keysToReplace = Object.keys(replacementMap);
    return {
      JSXElement: (jsxElement: TSESTree.JSXElement) => {
        const startingIdentifier = jsxElement.openingElement
          .name as TSESTree.JSXIdentifier;

        if (keysToReplace.includes(startingIdentifier.name)) {
          const replacement = replacementMap[startingIdentifier.name];
          const messageId = replacement.with
            ? "noDeprecatedElement_replacement"
            : "noDeprecatedElement";

          context.report({
            node: jsxElement,
            messageId,
            fix: replacement.with
              ? function (fixer) {
                  const fixes = [
                    fixer.replaceText(startingIdentifier, replacement.with!),
                  ];
                  const closingIdentifier = jsxElement.closingElement?.name as
                    | TSESTree.JSXIdentifier
                    | undefined;
                  if (closingIdentifier) {
                    fixes.push(
                      fixer.replaceText(closingIdentifier, replacement.with!)
                    );
                  }

                  return fixes;
                }
              : undefined,
            data: {
              ...replacement,
            },
          });
        }
      },
    };
  },
});
