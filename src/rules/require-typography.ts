import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";

type MessageIds = "requireTypography";
type ConversionType = "html" | "unicode" | "ascii";

type Options = [
  {
    preferAscii: boolean;
  }
];
const optionDefaults: Options = [
  {
    preferAscii: false,
  },
];

interface ITypographicConversionBase {
  name: string;
  characterRegex: RegExp;
  report: (
    context: Readonly<RuleContext<"requireTypography", Options>>,
    conversionType: ConversionType,
    sourceText: string,
    sourceStartIndex: number
  ) => void;
}

interface IStandardConversion extends ITypographicConversionBase {
  unicode: string;
  ascii: string;
  html: string;
  sourceErrorSize: number;
}

interface ISmartQuoteConversion extends ITypographicConversionBase {
  leftUnicodeQuote: string;
  leftAsciiQuote: string;
  leftHtmlQuote: string;
  rightUnicodeQuote: string;
  rightAsciiQuote: string;
  rightHtmlQuote: string;
}

interface ISmartQuoteReportContext {
  context: Readonly<RuleContext<"requireTypography", Options>>;
  conversion: ISmartQuoteConversion;
  conversionType: ConversionType;
  sourceText: string;
  sourceStartIndex: number;
}

const whiteSpaceRegex = /\s/g;
const reportSmartQuote = ({
  conversion,
  context,
  conversionType,
  sourceText,
  sourceStartIndex,
}: ISmartQuoteReportContext) => {
  const matches = [...sourceText.matchAll(conversion.characterRegex)];

  matches.forEach((match) => {
    const matchTextIndex = match.index ?? 0;
    let unicodeQuote = conversion.rightUnicodeQuote;
    let asciiQuote = conversion.rightAsciiQuote;
    let htmlQuote = conversion.rightHtmlQuote;
    let isFixable = true;

    let useLeftQuote = false;
    if (matchTextIndex === 0) {
      isFixable = false;
    } else if (whiteSpaceRegex.test(sourceText[matchTextIndex - 1])) {
      useLeftQuote = true;
    }

    if (useLeftQuote) {
      unicodeQuote = conversion.leftUnicodeQuote;
      asciiQuote = conversion.leftAsciiQuote;
      htmlQuote = conversion.leftHtmlQuote;
    }

    let toText;
    switch (conversionType) {
      case "ascii":
        toText = asciiQuote;
        break;
      case "html":
        toText = htmlQuote;
        break;
      default:
        toText = unicodeQuote;
        break;
    }

    const reportStart = sourceStartIndex + matchTextIndex;
    const reportEnd = reportStart + 1;

    context.report({
      messageId: "requireTypography",
      data: {
        toUnicode: isFixable
          ? unicodeQuote
          : `${conversion.leftUnicodeQuote} OR ${conversion.rightUnicodeQuote}`,
        toAsciiAlternate: unicodeQuote === toText ? "" : ` [${toText}]`,
      },
      loc: {
        start: context.getSourceCode().getLocFromIndex(reportStart),
        end: context.getSourceCode().getLocFromIndex(reportEnd),
      },
      fix: isFixable
        ? function (fixer) {
            return fixer.replaceTextRange([reportStart, reportEnd], toText);
          }
        : undefined,
    });
  });
};

interface IStandardReportContext {
  context: Readonly<RuleContext<"requireTypography", Options>>;
  conversion: IStandardConversion;
  conversionType: ConversionType;
  sourceText: string;
  sourceStartIndex: number;
}
const reportStandard = ({
  conversion,
  context,
  conversionType,
  sourceText,
  sourceStartIndex,
}: IStandardReportContext) => {
  const matches = [...sourceText.matchAll(conversion.characterRegex)];

  matches.forEach((match) => {
    const matchIndex = match.index ?? 0;

    let toText: string;
    switch (conversionType) {
      case "ascii":
        toText = conversion.ascii;
        break;
      case "html":
        toText = conversion.html;
        break;
      default:
        toText = conversion.unicode;
        break;
    }

    const reportStart = sourceStartIndex + matchIndex;
    const reportEnd = reportStart + conversion.sourceErrorSize;

    context.report({
      messageId: "requireTypography",
      data: {
        toUnicode: conversion.unicode,
        toAsciiAlternate: conversion.unicode === toText ? "" : ` [${toText}]`,
      },
      loc: {
        start: context.getSourceCode().getLocFromIndex(reportStart),
        end: context.getSourceCode().getLocFromIndex(reportEnd),
      },
      fix(fixer) {
        return fixer.replaceTextRange([reportStart, reportEnd], toText);
      },
    });
  });
};

const conversions: ITypographicConversionBase[] = [
  {
    name: "singleQuote",
    characterRegex: /'/g,
    leftUnicodeQuote: "‘",
    leftAsciiQuote: "\\u2018",
    leftHtmlQuote: "&lsquo;",
    rightUnicodeQuote: "’",
    rightAsciiQuote: "\\u2019",
    rightHtmlQuote: "&rsquo;",
    report(context, conversionType, sourceText, sourceStartIndex) {
      reportSmartQuote({
        conversion: this,
        context,
        conversionType,
        sourceText,
        sourceStartIndex,
      });
    },
  } as ISmartQuoteConversion,
  {
    name: "doubleQuote",
    characterRegex: /"/g,
    leftUnicodeQuote: "“",
    leftAsciiQuote: "\\u201C",
    leftHtmlQuote: "&ldquo;",
    rightUnicodeQuote: "”",
    rightAsciiQuote: "\\u201D",
    rightHtmlQuote: "&rdquo;",
    report(context, conversionType, sourceText, sourceStartIndex) {
      reportSmartQuote({
        conversion: this,
        context,
        conversionType,
        sourceText,
        sourceStartIndex,
      });
    },
  } as ISmartQuoteConversion,
  {
    name: "ellipsis",
    characterRegex: /\.\.\./g,
    sourceErrorSize: 3,
    unicode: "…",
    ascii: "\\u2026",
    html: "&hellip;",
    report(context, conversionType, sourceText, sourceStartIndex) {
      reportStandard({
        conversion: this,
        context,
        conversionType,
        sourceText,
        sourceStartIndex,
      });
    },
  } as IStandardConversion,
  {
    name: "plusOrMinus",
    characterRegex: /\+\-/g,
    unicode: "±",
    ascii: "\\u{B1}",
    html: "&plusmn;",
    sourceErrorSize: 2,
    report(context, conversionType, sourceText, sourceStartIndex) {
      reportStandard({
        conversion: this,
        context,
        conversionType,
        sourceText,
        sourceStartIndex,
      });
    },
  } as IStandardConversion,
];

export default ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/buildertrend/eslint-plugin-enterprise-extras/blob/main/docs/${name}.md`
)<Options, MessageIds>({
  name: "require-typography",
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: {
      recommended: "error",
      description:
        "Prefer using the alternative typographic characters for human readable text",
    },
    messages: {
      requireTypography:
        "Prefer using the alternative typographic character {{ toUnicode }}{{ toAsciiAlternate }}",
    },
    schema: [
      {
        type: "object",
        properties: {
          preferAscii: {
            default: optionDefaults[0].preferAscii,
            type: "boolean",
          },
        },
      },
    ],
  },
  defaultOptions: optionDefaults,
  create: function (context) {
    const preferAscii = { ...optionDefaults, ...context.options[0] }
      .preferAscii;

    const combinedRegexSource = conversions
      .map(
        (conversion, index) =>
          `(?<c${index}>${conversion.characterRegex.source})`
      )
      .join("|");
    const combinedRegex = new RegExp(combinedRegexSource, "g");

    const processTypography = (
      sourceText: string,
      sourceStartIndex: number,
      conversionType: ConversionType
    ) => {
      if (combinedRegex.test(sourceText)) {
        combinedRegex.lastIndex = 0;
        let match: RegExpExecArray | null;
        const setOfConversionIndicesToRun = new Set<number>();
        while ((match = combinedRegex.exec(sourceText)) !== null) {
          Object.keys(match.groups)
            .filter(
              (groupKey) => groupKey.startsWith("c") && !!match.groups[groupKey]
            )
            .map((groupKey) => parseInt(groupKey.substring(1)))
            .forEach((val) => setOfConversionIndicesToRun.add(val));
        }

        if (setOfConversionIndicesToRun.size > 0) {
          Array.from(setOfConversionIndicesToRun).forEach((conversionIndex) => {
            conversions[conversionIndex].report(
              context,
              conversionType,
              sourceText,
              sourceStartIndex
            );
          });
        }
      }
    };

    return {
      Literal: (literal: TSESTree.Literal) => {
        if (typeof literal.value === "string") {
          processTypography(
            literal.raw.substring(1, literal.raw.length - 1),
            literal.range[0] + 1,
            preferAscii ? "ascii" : "unicode"
          );
        }
      },
      TemplateElement: (templateText: TSESTree.TemplateElement) => {
        processTypography(
          templateText.value.raw,
          templateText.range[0] + 1,
          preferAscii ? "html" : "unicode"
        );
      },
      JSXText: (jsxText: TSESTree.JSXText) => {
        processTypography(
          jsxText.raw,
          jsxText.range[0],
          preferAscii ? "html" : "unicode"
        );
      },
    };
  },
});
