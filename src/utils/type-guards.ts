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

export const isFunctionDeclaration = (
  node: TSESTree.Node
): node is TSESTree.ArrowFunctionExpression | TSESTree.FunctionDeclaration => {
  return (
    node.type === "ArrowFunctionExpression" ||
    node.type === "FunctionDeclaration"
  );
};

export const isIdentifier = (
  node: TSESTree.Expression | TSESTree.PrivateIdentifier
): node is TSESTree.Identifier => {
  return node.type === "Identifier";
};

export const isMemberExpression = (
  node: TSESTree.Expression
): node is TSESTree.MemberExpression => {
  return node.type === "MemberExpression";
};

export const isAsExpression = (
  node: TSESTree.Expression
): node is TSESTree.TSAsExpression => {
  return node.type === "TSAsExpression";
};

const setOfUnstableAssignmentTypes = new Set([
  "NewExpression",
  "ObjectExpression",
  "ArrayExpression",
  "ArrowFunctionExpression",
  "FunctionExpression",
]);
type UnstableExpression =
  | TSESTree.NewExpression
  | TSESTree.ObjectExpression
  | TSESTree.ArrayExpression
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionExpression;
export const isUnstableExpression = (
  node: TSESTree.Node
): node is UnstableExpression => {
  return setOfUnstableAssignmentTypes.has(node.type);
};

export const isAssignmentPattern = (
  node: TSESTree.Node
): node is TSESTree.AssignmentPattern => {
  return node.type === "AssignmentPattern";
};

export const isVariableDeclarator = (
  node: TSESTree.Node
): node is TSESTree.VariableDeclarator => {
  return node.type === "VariableDeclarator";
};

export const isUnstableAssignment = (node: TSESTree.Node) => {
  let expression: null | TSESTree.Expression = null;
  if (isAssignmentPattern(node)) {
    expression = node.right;
  } else if (isVariableDeclarator(node)) {
    expression = node.init;
  }

  return expression && isUnstableExpression(expression);
};
