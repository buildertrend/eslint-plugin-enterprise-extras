import { ESLintUtils, TSESTree } from "@typescript-eslint/experimental-utils";

type MessageIds = "unregisterEventsInClass" | "unregisterEventsInHook";
type Options = [];

interface ISubscriptionStack {
  callExpression: TSESTree.Node;
  eventHandler: TSESTree.Node;
  eventName: string;
}

export default ESLintUtils.RuleCreator(
  name =>
    `https://github.com/buildertrend/eslint-plugin-enterprise-extras/blob/main/docs/${name}.md`
)<Options, MessageIds>({
  name: "unregister-events",
  meta: {
    type: "suggestion",
    docs: {
      category: "Best Practices",
      recommended: "warn",
      description:
        "When using Javascript scheduling (`setTimeout` or `setInterval`), it is recommended to support cancelling of the task, especially within React components."
    },
    messages: {
      unregisterEventsInClass:
        "All add event listener calls must have a corresponding unregister event call in componentWillUnmount",
      unregisterEventsInHook:
        "All add event listener calls must have a corresponding unregister event call in a useEffect cleanup function"
    },
    schema: []
  },
  defaultOptions: [],
  create: function(context) {
    let stack: ISubscriptionStack[] = [];

    const isSameSubscription = (
      sub1: ISubscriptionStack,
      sub2: ISubscriptionStack
    ) => {
      if (sub1.eventName === sub2.eventName) {
        const handler1Tokens = context
          .getSourceCode()
          .getTokens(sub1.eventHandler);
        const handler2Tokens = context
          .getSourceCode()
          .getTokens(sub2.eventHandler);
        return (
          handler1Tokens.length === handler2Tokens.length &&
          handler1Tokens.every((t1, ind) => {
            return t1.value === handler2Tokens[ind].value;
          })
        );
      }

      return false;
    };

    const clearStack = () => {
      stack = [];
    };

    const reportStack = (componentType: "hook" | "classComponent") => {
      stack.forEach(error => {
        context.report({
          node: error.callExpression,
          messageId:
            componentType === "classComponent"
              ? "unregisterEventsInClass"
              : "unregisterEventsInHook"
        });
      });

      clearStack();
    };

    const pushStack = (callExpression: TSESTree.CallExpression) => {
      // If the callExpression fails these checks, chances are you have compiler errors anyways, so we can ignore adding to the stack
      if (
        callExpression.arguments.length >= 2 &&
        callExpression.arguments.length <= 3
      ) {
        let eventType = callExpression.arguments[0];
        let handler = callExpression.arguments[1];

        if (
          eventType.type === "Literal" &&
          typeof eventType.value === "string"
        ) {
          const subscription = {
            eventName: eventType.value,
            eventHandler: handler,
            callExpression: callExpression
          };
          stack.push(subscription);
        }
      }
    };

    const popStack = (callExpression: TSESTree.CallExpression) => {
      // If the callExpression fails these checks, chances are you have compiler errors anyways, so we can ignore adding to the stack
      if (
        callExpression.arguments.length >= 2 &&
        callExpression.arguments.length <= 3
      ) {
        let eventType = callExpression.arguments[0];
        let handler = callExpression.arguments[1];

        if (
          eventType.type === "Literal" &&
          typeof eventType.value === "string"
        ) {
          const eventName = eventType.value;
          const subscription: ISubscriptionStack = {
            callExpression: callExpression,
            eventName: eventName,
            eventHandler: handler
          };

          stack = stack.filter(existingSubscription => {
            return !isSameSubscription(subscription, existingSubscription);
          });
        }
      }
    };

    return {
      Program: clearStack,
      "Program:exit": clearStack,
      "ClassDeclaration[superClass.property.name=/Component|PureComponent/] CallExpression[callee.name='addEventListener']": pushStack,
      "ClassDeclaration[superClass.property.name=/Component|PureComponent/] CallExpression[callee.object.name='window'][callee.property.name='addEventListener']": pushStack,
      "ClassDeclaration[superClass.property.name=/Component|PureComponent/] MethodDefinition[key.name='componentWillUnmount'] CallExpression[callee.object.name='window'][callee.property.name='removeEventListener']": popStack,
      "ClassDeclaration[superClass.property.name=/Component|PureComponent/] MethodDefinition[key.name='componentWillUnmount'] CallExpression[callee.name='removeEventListener']": popStack,
      "ClassDeclaration[superClass.property.name=/Component|PureComponent/] ClassProperty[key.name='componentWillUnmount'] CallExpression[callee.object.name='window'][callee.property.name='removeEventListener']": popStack,
      "ClassDeclaration[superClass.property.name=/Component|PureComponent/] ClassProperty[key.name='componentWillUnmount'] CallExpression[callee.name='removeEventListener']": popStack,
      "VariableDeclarator[id.name=/^[A-Z].+/] CallExpression[callee.name='addEventListener']": pushStack,
      "VariableDeclarator[id.name=/^[A-Z].+/] CallExpression[callee.object.name='window'][callee.property.name='addEventListener']": pushStack,
      "VariableDeclarator[id.name=/^[A-Z].+/] CallExpression[callee.name='useEffect'] > ArrowFunctionExpression ReturnStatement CallExpression[callee.name='removeEventListener']": popStack,
      "VariableDeclarator[id.name=/^[A-Z].+/] CallExpression[callee.name='useEffect'] > ArrowFunctionExpression ReturnStatement CallExpression[callee.object.name='window'][callee.property.name='removeEventListener']": popStack,
      "VariableDeclarator[id.name=/^[A-Z].+/] CallExpression[callee.object.name='React'][callee.property.name='useEffect'] > ArrowFunctionExpression ReturnStatement CallExpression[callee.name='removeEventListener']": popStack,
      "VariableDeclarator[id.name=/^[A-Z].+/] CallExpression[callee.object.name='React'][callee.property.name='useEffect'] > ArrowFunctionExpression ReturnStatement CallExpression[callee.object.name='window'][callee.property.name='removeEventListener']": popStack,
      "VariableDeclarator[id.name=/^[A-Z].+/]:exit": () => reportStack("hook"),
      "ClassDeclaration:exit": () => reportStack("classComponent")
    };
  }
});
