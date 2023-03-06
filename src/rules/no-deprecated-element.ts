import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";
import {
  isJsxAttribute,
  isJsxIdentifier,
  isJsxMemberExpression,
} from "../utils/type-guards";

type MessageIds = "noDeprecatedElement" | "noDeprecatedElement_replacement";
type Deprecated = {
  element: string;
  replace?: {
    element: string;
    addProps?: {
      key: string;
      defaultValue: string;
      keysToPullValueFrom?: string | string[];
      overwrite?: boolean;
    }[];
    removeProps?: string[];
  };
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
    "<{{element}}> is deprecated, use <{{replaceElement}}> instead.",
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
                    replace: {
                      type: "object",
                      properties: {
                        element: { type: "string", minLength: 1 },
                        addProps: {
                          type: "array",
                          items: {
                            allOf: [
                              {
                                type: "object",
                                properties: {
                                  key: {
                                    type: "string",
                                    minLength: 1,
                                  },
                                  defaultValue: {
                                    type: "string",
                                  },
                                  keysToPullValueFrom: {
                                    type: ["array", "string"],
                                    anyOf: [
                                      { type: "string" },
                                      {
                                        type: "array",
                                        items: { type: "string" },
                                        minLength: 1,
                                      },
                                    ],
                                  },
                                  overwrite: {
                                    type: ["boolean"],
                                  },
                                },
                                required: ["defaultValue", "key"],
                              },
                            ],
                          },
                        },
                        removeProps: {
                          type: "array",
                          items: {
                            allOf: [{ type: "string", minLength: 1 }],
                          },
                        },
                      },
                      required: ["element"],
                    },
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
        const replacement = deprecation.replace;
        if (replacement === undefined) {
          context.report({
            node: startingIdentifier,
            messageId: "noDeprecatedElement",
            data: deprecation,
          });
          return;
        }

        const replacementFixer: Parameters<typeof context["report"]>[0]["fix"] =
          (fixer) => {
            let fixes = [
              fixer.replaceText(startingIdentifier, replacement.element),
            ];

            if (replacement.removeProps || replacement.addProps) {
              const existingProps =
                jsxElement.openingElement.attributes.filter(isJsxAttribute);

              const propsToRemove = new Set(
                existingProps.filter(
                  (existingProp) =>
                    isJsxIdentifier(existingProp.name) &&
                    replacement.removeProps?.includes(existingProp.name.name)
                )
              );

              (replacement.addProps ?? []).forEach((propToAdd) => {
                let defaultTextToAdd = `${propToAdd.key}=${propToAdd.defaultValue}`;

                let pulledValue: string | undefined;
                const keysToPullValueFromArr =
                  typeof propToAdd.keysToPullValueFrom === "string"
                    ? [propToAdd.keysToPullValueFrom]
                    : propToAdd.keysToPullValueFrom;
                for (let keyToPullFrom of keysToPullValueFromArr ?? []) {
                  const existingPropToPullFrom = existingProps.find(
                    (existingProp) =>
                      isJsxIdentifier(existingProp.name) &&
                      existingProp.name.name === keyToPullFrom
                  );
                  if (existingPropToPullFrom) {
                    pulledValue = existingPropToPullFrom.value
                      ? `${propToAdd.key}=${context
                          .getSourceCode()
                          .getText(existingPropToPullFrom.value)}`
                      : `${propToAdd.key}={true}`;
                    break;
                  }
                }

                const propWithSameName = existingProps.find(
                  (existingProp) =>
                    isJsxIdentifier(existingProp.name) &&
                    existingProp.name.name === propToAdd.key
                );

                let propValue = pulledValue ?? defaultTextToAdd;

                // Shorthand booleans
                if (propValue === `${propToAdd.key}={true}`) {
                  propValue = propToAdd.key;
                }

                if (propWithSameName && propToAdd.overwrite) {
                  fixes.push(
                    fixer.replaceTextRange(propWithSameName.range, propValue)
                  );
                } else if (!propWithSameName) {
                  fixes.push(
                    fixer.insertTextAfter(startingIdentifier, " " + propValue)
                  );
                }
              });

              fixes = fixes.concat(
                Array.from(propsToRemove).map((propToRemove) =>
                  fixer.remove(propToRemove)
                )
              );
            }

            if (closingIdentifier !== undefined) {
              fixes.push(
                fixer.replaceText(closingIdentifier, replacement.element)
              );
            }

            return fixes;
          };

        context.report({
          node: startingIdentifier,
          messageId: "noDeprecatedElement_replacement",
          fix: replacementFixer,
          data: {
            element: deprecation.element,
            replaceElement: replacement.element,
          },
        });
      },
    };
  },
});
