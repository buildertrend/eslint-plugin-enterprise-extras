import noHrefAssignment from "./rules/no-href-assignment";
import noUnhandledScheduling from "./rules/no-unhandled-scheduling";
import privateComponentMethods from "./rules/private-component-methods";
import requireStatePropertyDefinition from "./rules/require-state-property-definition";
import unregisterEvents from "./rules/unregister-events";
import requireTypography from "./rules/require-typography";
import noUnstableDependencies from "./rules/no-unstable-dependencies";

export = {
  rules: {
    "no-href-assignment": noHrefAssignment,
    "private-component-methods": privateComponentMethods,
    "no-unhandled-scheduling": noUnhandledScheduling,
    "unregister-events": unregisterEvents,
    "require-typography": requireTypography,
    "require-state-property-definition": requireStatePropertyDefinition,
    "no-unstable-dependencies": noUnstableDependencies,
  },
  configs: {
    recommended: {
      plugins: ["enterprise-extras"],
      rules: {
        "enterprise-extras/no-href-assignment": "error",
        "enterprise-extras/private-component-methods": "error",
        "enterprise-extras/no-unhandled-scheduling": "warn",
        "enterprise-extras/unregister-events": "error",
        "enterprise-extras/require-typography": "error",
        "enterprise-extras/require-state-property-definition": "warn",
        "enterprise-extras/no-unstable-dependencies": "warn",
      },
    },
    all: {
      plugins: ["enterprise-extras"],
      rules: {
        "enterprise-extras/no-href-assignment": "error",
        "enterprise-extras/private-component-methods": "error",
        "enterprise-extras/no-unhandled-scheduling": "error",
        "enterprise-extras/unregister-events": "error",
        "enterprise-extras/require-typography": "error",
        "enterprise-extras/require-state-property-definition": "error",
        "enterprise-extras/no-unstable-dependencies": "error",
      },
    },
  },
};
