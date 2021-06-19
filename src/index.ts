import noHrefAssignment from "./rules/no-href-assignment";
import noUnhandledScheduling from "./rules/no-unhandled-scheduling";
import privateComponentMethods from "./rules/private-component-methods";

export = {
  rules: {
    "no-href-assignment": noHrefAssignment,
    "private-component-methods": privateComponentMethods,
    "no-unhandled-scheduling": noUnhandledScheduling,
  },
  configs: {
    recommended: {
      plugins: ["enterprise-extras"],
      rules: {
        "enterprise-extras/no-href-assignment": "error",
        "enterprise-extras/private-component-methods": "error",
        "enterprise-extras/no-unhandled-scheduling": "warn",
      },
    },
    all: {
      plugins: ["enterprise-extras"],
      rules: {
        "enterprise-extras/no-href-assignment": "error",
        "enterprise-extras/private-component-methods": "error",
        "enterprise-extras/no-unhandled-scheduling": "error",
      },
    },
  },
};
