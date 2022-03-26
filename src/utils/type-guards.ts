import { TSESTree } from "@typescript-eslint/utils";

export const isPropertyDefinition = (
  node: TSESTree.Node
): node is TSESTree.PropertyDefinition => {
  return (
    // Will need to switch "any" when the typescript-eslint is updated
    // This conditional is needed to work with v4 and v5 versions of typescript-eslint
    (node.type as any) === "ClassProperty" || node.type === "PropertyDefinition"
  );
};

export const isMethodDefinition = (
  node: TSESTree.Node
): node is TSESTree.MethodDefinition => {
  return node.type === "MethodDefinition";
};

const funcExpRegex = /^(Arrow)?FunctionExpression$/;
export const isMethod = (
  node: TSESTree.ClassElement
): node is TSESTree.PropertyDefinition | TSESTree.MethodDefinition => {
  return (
    (isPropertyDefinition(node) &&
      node.value &&
      funcExpRegex.test(node.value.type)) ||
    isMethodDefinition(node)
  );
};

export const isExpressionStatement = (
  node: TSESTree.Node
): node is TSESTree.ExpressionStatement => {
  return node.type === "ExpressionStatement";
};

export const isMemberExpression = (
  node: TSESTree.Node
): node is TSESTree.MemberExpression => {
  return node.type === "MemberExpression";
};

export const isThisExpression = (
  node: TSESTree.Node
): node is TSESTree.ThisExpression => {
  return node.type === "ThisExpression";
};

export const isAssignmentExpression = (
  node: TSESTree.Node
): node is TSESTree.AssignmentExpression => {
  return node.type === "AssignmentExpression";
};

export const isIdentifier = (
  node: TSESTree.Expression | TSESTree.PrivateIdentifier
): node is TSESTree.Identifier => {
  return node.type === "Identifier";
};

export const isAsExpression = (
  node: TSESTree.Expression
): node is TSESTree.TSAsExpression => {
  return node.type === "TSAsExpression";
};
