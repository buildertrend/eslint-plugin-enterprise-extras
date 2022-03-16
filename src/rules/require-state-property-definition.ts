import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";

import {
  isAssignmentExpression,
  isPropertyDefinition,
  isExpressionStatement,
  isIdentifier,
  isMemberExpression,
  isMethodDefinition,
  isThisExpression,
} from "../utils/type-guards";

type MessageIds =
  | "requireStatePropertyDefinition"
  | "unexpectedStatePropertyDefinition";
type Options = [];

export default ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/buildertrend/eslint-plugin-enterprise-extras/blob/main/docs/${name}.md`
)<Options, MessageIds>({
  name: "require-state-property-definition",
  meta: {
    type: "problem",
    docs: {
      recommended: "warn",
      description:
        "For class components that use state, a state property should be defined before mount. Also ensures that state properties are NOT defined if no state type was provided as a type argument to React.Component or React.PureComponent.",
    },
    messages: {
      requireStatePropertyDefinition:
        "A state property definition should be included in classes that have a state type defined",
      unexpectedStatePropertyDefinition:
        "An unexpected state definition was found when a state type was not provided as a type argument to React.Component",
    },
    schema: [],
  },
  defaultOptions: [],
  create: function (context) {
    const isStatePropertyDefinition = (node: TSESTree.ClassElement) => {
      if (isPropertyDefinition(node)) {
        if (isIdentifier(node.key)) {
          const id = node.key;
          return id.name === "state";
        }
      }
      return false;
    };

    const isConstructorDefinition = (node: TSESTree.ClassElement) => {
      if (isMethodDefinition(node)) {
        return node.kind === "constructor";
      }
      return false;
    };

    const isStateAssignmentDefinition = (node: TSESTree.Node) => {
      // Is member assignment
      if (isExpressionStatement(node)) {
        if (isAssignmentExpression(node.expression)) {
          if (isMemberExpression(node.expression.left)) {
            // Member expression is this.state
            if (isThisExpression(node.expression.left.object)) {
              if (isIdentifier(node.expression.left.property)) {
                return node.expression.left.property.name === "state";
              }
            }
          }
        }
      }
    };

    const getStatePropertyDefinition = (
      classDeclaration: TSESTree.ClassDeclaration
    ) => {
      return classDeclaration.body.body.find(isStatePropertyDefinition);
    };

    const getStateConstructorDefinition = (
      classDeclaration: TSESTree.ClassDeclaration
    ) => {
      const constructor = classDeclaration.body.body.find(
        isConstructorDefinition
      ) as
        | TSESTree.MethodDefinitionComputedName
        | TSESTree.MethodDefinitionNonComputedName
        | undefined;

      if (constructor) {
        return constructor.value.body?.body?.find(isStateAssignmentDefinition);
      }
    };

    const getStateDefinition = (
      classDeclaration: TSESTree.ClassDeclaration
    ) => {
      return (
        getStatePropertyDefinition(classDeclaration) ||
        getStateConstructorDefinition(classDeclaration)
      );
    };

    return {
      // Add event listener registrations made in class components to the stack
      "ClassDeclaration[superClass.property.name=/Component|PureComponent/]": (
        classDeclaration: TSESTree.ClassDeclaration
      ) => {
        const stateDefinition = getStateDefinition(classDeclaration);
        const hasStateTypeDefinition =
          classDeclaration.superTypeParameters &&
          classDeclaration.superTypeParameters.params.length >= 2;

        if (stateDefinition && !hasStateTypeDefinition) {
          context.report({
            node: stateDefinition,
            messageId: "unexpectedStatePropertyDefinition",
          });
        } else if (!stateDefinition && hasStateTypeDefinition) {
          context.report({
            node: classDeclaration,
            messageId: "requireStatePropertyDefinition",
          });
        }
      },
    };
  },
});
