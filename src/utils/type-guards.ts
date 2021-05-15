import { TSESTree } from "@typescript-eslint/experimental-utils";

export const isClassProperty = (
  node: TSESTree.Node
): node is TSESTree.ClassProperty => {
  return node.type === "ClassProperty";
};

export const isMethodDefinition = (
  node: TSESTree.Node
): node is TSESTree.MethodDefinition => {
  return node.type === "MethodDefinition";
};

const funcExpRegex = /^(Arrow)?FunctionExpression$/;
export const isMethod = (
  node: TSESTree.ClassElement
): node is TSESTree.ClassProperty | TSESTree.MethodDefinition => {
  return (
    (isClassProperty(node) &&
      node.value &&
      funcExpRegex.test(node.value.type)) ||
    isMethodDefinition(node)
  );
};

export const isIdentifier = (node: TSESTree.Expression): node is TSESTree.Identifier => {
  return node.type === "Identifier";
}

export const isAsExpression = (node: TSESTree.Expression): node is TSESTree.TSAsExpression => {
  return node.type === "TSAsExpression";
}

