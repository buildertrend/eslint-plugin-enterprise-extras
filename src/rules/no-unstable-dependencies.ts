import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";
import {
  isFunctionDeclaration,
  isIdentifier,
  isMemberExpression,
  isMethod,
  isUnstableAssignment,
  isUnstableExpression,
} from "../utils/type-guards";

type MessageIds = "unstableDependency";
type Options = [];

const hooksWithDependenciesRegex = "use(Callback|Memo|Effect)";

export default ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/buildertrend/eslint-plugin-enterprise-extras/blob/main/docs/${name}.md`
)<Options, MessageIds>({
  name: "no-unstable-dependencies",
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: {
      recommended: "error",
      description:
        "Unstable dependencies should be avoided in React hook dependency arrays",
    },
    messages: {
      unstableDependency:
        "Variable is created every render, but it is used in a React hook dependency array. Consider moving the value to a module constant.",
    },
    schema: [],
  },
  defaultOptions: [],
  create: function (context) {
    const reportUnstableDeps = (useHookCall: TSESTree.CallExpression) => {
      if (useHookCall.arguments[1].type === "ArrayExpression") {
        const scope = context.getScope();

        useHookCall.arguments[1].elements.forEach((dependency) => {
          if (isIdentifier(dependency)) {
            const depReference = scope.references.find(
              (ref) => ref.identifier === dependency
            );

            if (depReference) {
              const depReferenceScope = depReference.from;

              if (isFunctionDeclaration(depReferenceScope.block)) {
                const depReferenceDefinitions = depReference.resolved?.defs;
                if (
                  depReferenceDefinitions &&
                  depReferenceDefinitions.length > 0
                ) {
                  const writeReferences = depReference.resolved?.references
                    .filter((ref) => ref.isWrite() && ref.writeExpr)
                    .map((ref) => ref.writeExpr);

                  // If every known write expression is unstable, then we know that the variable is not save to use as a react hook dependency
                  if (
                    writeReferences &&
                    writeReferences.length > 0 &&
                    writeReferences.every((writeReference) =>
                      isUnstableExpression(writeReference!)
                    )
                  ) {
                    writeReferences.forEach((writeReference) => {
                      context.report({
                        node: writeReference!,
                        messageId: "unstableDependency",
                      });
                    });
                    context.report({
                      node: dependency,
                      messageId: "unstableDependency",
                    });
                  }
                }
              }
            }
          }
        });
      }
    };

    return {
      [`CallExpression[arguments.length>=2][callee.type="MemberExpression"][callee.property.type="Identifier"][callee.property.name=/${hooksWithDependenciesRegex}/]`]:
        reportUnstableDeps,
      [`CallExpression[arguments.length>=2][callee.type="Identifier"][callee.name=/${hooksWithDependenciesRegex}/]`]:
        reportUnstableDeps,
    };
  },
});
