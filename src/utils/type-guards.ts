import { TSESTree } from "@typescript-eslint/utils";

export const isPropertyDefinition = (
  node: TSESTree.Node
): node is TSESTree.PropertyDefinition => {
  return node.type === "PropertyDefinition";
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
