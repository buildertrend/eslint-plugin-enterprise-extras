import { ESLintUtils, TSESTree } from "@typescript-eslint/experimental-utils";

type MessageIds = "unregisterEventsInClass" | "unregisterEventsInHook";
type Options = [];

interface ISubscription {
  callExpression: TSESTree.Node;
  eventHandler: TSESTree.Node;
  eventName: string;
}

export default ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/buildertrend/eslint-plugin-enterprise-extras/blob/main/docs/${name}.md`
)<Options, MessageIds>({
  name: "unregister-events",
  meta: {
    type: "problem",
    docs: {
      category: "Possible Errors",
      recommended: "error",
      description:
        "After registering event listeners in React components, event handlers should be unregistered when the component is unmounted.",
    },
    messages: {
      unregisterEventsInClass:
        "`addEventListener` calls must have a corresponding unregister event call in `componentWillUnmount`",
      unregisterEventsInHook:
        "`addEventListener` calls must have a corresponding unregister event call in a `useEffect` cleanup function",
    },
    schema: [],
  },
  defaultOptions: [],
  create: function (context) {
    let addedSubscriptions: ISubscription[] = [];
    let removedSubscriptions: ISubscription[] = [];

    const isSameSubscription = (sub1: ISubscription, sub2: ISubscription) => {
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

    const clearSubscriptionTracking = () => {
      addedSubscriptions = [];
      removedSubscriptions = [];
    };

    const reportSubscriptionsMissingRemoveCalls = (
      componentType: "hook" | "classComponent"
    ) => {
      addedSubscriptions
        .filter((addedSubscription) => {
          return !removedSubscriptions.some((removedSubscription) =>
            isSameSubscription(addedSubscription, removedSubscription)
          );
        })
        .forEach((error) => {
          context.report({
            node: error.callExpression,
            messageId:
              componentType === "classComponent"
                ? "unregisterEventsInClass"
                : "unregisterEventsInHook",
          });
        });

      clearSubscriptionTracking();
    };

    const pushAddSubscription = (callExpression: TSESTree.CallExpression) => {
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
            callExpression: callExpression,
          };
          addedSubscriptions.push(subscription);
        }
      }
    };

    const pushRemoveSubscription = (
      callExpression: TSESTree.CallExpression
    ) => {
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
          const subscription: ISubscription = {
            callExpression: callExpression,
            eventName: eventName,
            eventHandler: handler,
          };

          removedSubscriptions.push(subscription);
        }
      }
    };

    return {
      // Clear the subscription tracking lists between files to avoid memory leaks
      Program: clearSubscriptionTracking,
      "Program:exit": clearSubscriptionTracking,

      // Track event listener registrations made in class components
      "ClassDeclaration[superClass.property.name=/Component|PureComponent/] CallExpression[callee.name='addEventListener']":
        pushAddSubscription,
      "ClassDeclaration[superClass.property.name=/Component|PureComponent/] CallExpression[callee.object.name=/window|document/][callee.property.name='addEventListener']":
        pushAddSubscription,

      // Track remove event listener calls in class component componentWillUnmount methods
      "ClassDeclaration[superClass.property.name=/Component|PureComponent/] MethodDefinition[key.name='componentWillUnmount'] CallExpression[callee.object.name=/window|document/][callee.property.name='removeEventListener']":
        pushRemoveSubscription,
      "ClassDeclaration[superClass.property.name=/Component|PureComponent/] MethodDefinition[key.name='componentWillUnmount'] CallExpression[callee.name='removeEventListener']":
        pushRemoveSubscription,
      "ClassDeclaration[superClass.property.name=/Component|PureComponent/] ClassProperty[key.name='componentWillUnmount'] CallExpression[callee.object.name=/window|document/][callee.property.name='removeEventListener']":
        pushRemoveSubscription,
      "ClassDeclaration[superClass.property.name=/Component|PureComponent/] ClassProperty[key.name='componentWillUnmount'] CallExpression[callee.name='removeEventListener']":
        pushRemoveSubscription,

      // Track event listener registrations made in hook components
      "VariableDeclarator[id.name=/^[A-Z].+/] CallExpression[callee.name='addEventListener']":
        pushAddSubscription,
      "VariableDeclarator[id.name=/^[A-Z].+/] CallExpression[callee.object.name=/window|document/][callee.property.name='addEventListener']":
        pushAddSubscription,
      "FunctionDeclaration[id.name=/^[A-Z].+/] CallExpression[callee.name='addEventListener']":
        pushAddSubscription,
      "FunctionDeclaration[id.name=/^[A-Z].+/] CallExpression[callee.object.name=/window|document/][callee.property.name='addEventListener']":
        pushAddSubscription,

      // Track remove event listener calls in hook component useEffect cleanups
      "VariableDeclarator[id.name=/^[A-Z].+/] CallExpression[callee.name='useEffect'] > ArrowFunctionExpression ReturnStatement CallExpression[callee.name='removeEventListener']":
        pushRemoveSubscription,
      "VariableDeclarator[id.name=/^[A-Z].+/] CallExpression[callee.name='useEffect'] > ArrowFunctionExpression ReturnStatement CallExpression[callee.object.name=/window|document/][callee.property.name='removeEventListener']":
        pushRemoveSubscription,
      "VariableDeclarator[id.name=/^[A-Z].+/] CallExpression[callee.object.name='React'][callee.property.name='useEffect'] > ArrowFunctionExpression ReturnStatement CallExpression[callee.name='removeEventListener']":
        pushRemoveSubscription,
      "VariableDeclarator[id.name=/^[A-Z].+/] CallExpression[callee.object.name='React'][callee.property.name='useEffect'] > ArrowFunctionExpression ReturnStatement CallExpression[callee.object.name=/window|document/][callee.property.name='removeEventListener']":
        pushRemoveSubscription,
      "FunctionDeclaration[id.name=/^[A-Z].+/] CallExpression[callee.name='useEffect'] > ArrowFunctionExpression ReturnStatement CallExpression[callee.name='removeEventListener']":
        pushRemoveSubscription,
      "FunctionDeclaration[id.name=/^[A-Z].+/] CallExpression[callee.name='useEffect'] > ArrowFunctionExpression ReturnStatement CallExpression[callee.object.name=/window|document/][callee.property.name='removeEventListener']":
        pushRemoveSubscription,
      "FunctionDeclaration[id.name=/^[A-Z].+/] CallExpression[callee.object.name='React'][callee.property.name='useEffect'] > ArrowFunctionExpression ReturnStatement CallExpression[callee.name='removeEventListener']":
        pushRemoveSubscription,
      "FunctionDeclaration[id.name=/^[A-Z].+/] CallExpression[callee.object.name='React'][callee.property.name='useEffect'] > ArrowFunctionExpression ReturnStatement CallExpression[callee.object.name=/window|document/][callee.property.name='removeEventListener']":
        pushRemoveSubscription,

      // Report any event listeners not unregistered and still in the stack when leaving a class component/hook
      "VariableDeclarator[id.name=/^[A-Z].+/]:exit": () =>
        reportSubscriptionsMissingRemoveCalls("hook"),
      "FunctionDeclaration[id.name=/^[A-Z].+/]:exit": () =>
        reportSubscriptionsMissingRemoveCalls("hook"),
      "ClassDeclaration:exit": () =>
        reportSubscriptionsMissingRemoveCalls("classComponent"),
    };
  },
});
