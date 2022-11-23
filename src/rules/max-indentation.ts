import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";
import { RuleListener } from "@typescript-eslint/utils/dist/ts-eslint";
import { isLiteral } from "../utils/type-guards";

type MessageIds = "maxIndentationExceeded";
type Options = [
  number,
  { includeSpaces: boolean; includeTab: boolean; spacesPerTab: number }
];

export default ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/buildertrend/eslint-plugin-enterprise-extras/blob/main/docs/${name}.md`
)<Options, MessageIds>({
  name: "max-indentation",
  meta: {
    type: "layout",
    docs: {
      recommended: false,
      description:
        "Limits the maximum number of times a line can be indented to improve readability. Especially useful in conjunction with other code formatting tools like Prettier.",
    },
    messages: {
      maxIndentationExceeded:
        "Maximum indentation exceeded. Try breaking out the code into functions to improve readability",
    },
    schema: [
      { type: "number", default: 5, minimum: 1 },
      {
        type: "object",
        properties: {
          includeSpaces: {
            type: "boolean",
            default: true,
          },
          includeTab: {
            type: "boolean",
            default: true,
          },
          spacesPerTab: {
            type: "number",
            minimum: 1,
            default: 4,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    5,
    {
      includeSpaces: true,
      includeTab: true,
      spacesPerTab: 4,
    },
  ],
  create: function (context) {
    type ReportDescriptor = Parameters<typeof context.report>[0];
    type ErrorReport = Omit<ReportDescriptor, "loc"> & {
      loc: TSESTree.SourceLocation;
    } & { node: TSESTree.Node };

    const maxNumberOfIndentation = context.options[0];
    const { includeSpaces, includeTab, spacesPerTab } = context.options[1];

    const groupExp: string[] = [];
    if (includeSpaces) {
      groupExp.push(`( {${spacesPerTab}})`);
    }
    if (includeTab) {
      groupExp.push(`(\\t)`);
    }
    const combinedExp = groupExp.join("|");
    const maxWhitespaceRegExp = new RegExp(
      `(${combinedExp}){${maxNumberOfIndentation + 1},}`
    );

    // Module store of errors that we have found
    let errors: ErrorReport[] = [];

    const sourceCode = context.getSourceCode();
    const commentNodes = sourceCode.getAllComments();

    function removeWhitespaceError(node: TSESTree.Node) {
      const locStart = node.loc.start;
      const locEnd = node.loc.end;

      errors = errors.filter(
        ({ loc: { start: errorLocStart } }) =>
          errorLocStart.line < locStart.line ||
          (errorLocStart.line === locStart.line &&
            errorLocStart.column < locStart.column) ||
          (errorLocStart.line === locEnd.line &&
            errorLocStart.column >= locEnd.column) ||
          errorLocStart.line > locEnd.line
      );
    }

    function removeInvalidNodeErrorsInLiteral(node: TSESTree.Literal) {
      const shouldCheckStrings =
        isLiteral(node) && typeof node.value === "string";
      const shouldCheckRegExps = Boolean(
        (node as TSESTree.RegExpLiteral).regex
      );

      if (shouldCheckStrings || shouldCheckRegExps) {
        // If we have irregular characters remove them from the errors list
        if (maxWhitespaceRegExp.test(node.raw)) {
          removeWhitespaceError(node);
        }
      }
    }

    function removeInvalidNodeErrorsInTemplateLiteral(
      node: TSESTree.TemplateElement
    ) {
      if (typeof node.value.raw === "string") {
        if (maxWhitespaceRegExp.test(node.value.raw)) {
          removeWhitespaceError(node);
        }
      }
    }

    function removeInvalidNodeErrorsInComment(node) {
      if (maxWhitespaceRegExp.test(node.value)) {
        removeWhitespaceError(node);
      }
    }

    function checkForMaxIndentation(node: TSESTree.Node) {
      const sourceLines = sourceCode.lines;

      sourceLines.forEach((sourceLine, lineIndex) => {
        const lineNumber = lineIndex + 1;
        const match = maxWhitespaceRegExp.exec(sourceLine);
        if (match) {
          errors.push({
            node,
            messageId: "maxIndentationExceeded",
            loc: {
              start: {
                line: lineNumber,
                column: match.index,
              },
              end: {
                line: lineNumber,
                column: match.index + match[0].length,
              },
            },
          });
        }
      });
    }

    const nodes: RuleListener = {};

    if (
      (includeTab || includeSpaces) &&
      maxWhitespaceRegExp.test(sourceCode.getText())
    ) {
      nodes.Program = function (node) {
        /*
         * As we can easily fire warnings for all white space issues with
         * all the source its simpler to fire them here.
         * This means we can check all the application code without having
         * to worry about issues caused in the parser tokens.
         * When writing this code also evaluating per node was missing out
         * connecting tokens in some cases.
         * We can later filter the errors when they are found to be not an
         * issue in nodes we don't care about.
         */
        checkForMaxIndentation(node);
      };

      nodes.Literal = removeInvalidNodeErrorsInLiteral;
      nodes.TemplateElement = removeInvalidNodeErrorsInTemplateLiteral;
      nodes["Program:exit"] = function () {
        // First strip errors occurring in comment nodes.
        commentNodes.forEach(removeInvalidNodeErrorsInComment);

        // If we have any errors remaining report on them
        errors.forEach((error) => context.report(error));
      };
    } else {
      nodes.Program = () => {};
    }

    return nodes;
  },
});
