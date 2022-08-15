
const { default: traverse } = require("@babel/traverse");
const { parse: babelParser } = require("@babel/parser");
const t = require("@babel/types");
const { default: generate } = require("@babel/generator");

function generateComponent(name, svgCode) {
  const basicSvgCode = `
  import React from "react";
  const ${name} = (props) => {
    const { fills = [], size = 32, color, ...restProps } = props
    const getColor = (i) => fills[i] || color || "currentColor"
    return ${svgCode}
  }
  export default ${name}
`;
  const babelTree = babelParser(basicSvgCode, {
    sourceType: "module",
    plugins: ["jsx"],
  });

  const colorMap = new Map();

  // collect all color to map
  let index = 0;
  traverse(babelTree, {
    JSXAttribute: {
      enter(path) {
        if (path.node.name.name === "fill") {
          const color = path.node?.value?.value;
          if (color && color !== "none") {
            if (colorMap.get(color) === undefined) {
              colorMap.set(color, index++);
            }
          }
        }
      },
    },
  });
  // modify code
  traverse(babelTree, {
    JSXOpeningElement: {
      exit(path) {
        if (path.node.name.name === "svg") {
          const { attributes } = path.node;
          attributes.push(t.jsxSpreadAttribute(t.identifier("restProps")));
          const width = attributes.find((i) => i?.name?.name === "width");
          if (width) {
            width.value = t.jsxExpressionContainer(t.identifier("size"));
          }
          const height = attributes.find((i) => i?.name?.name === "height");
          if (height) {
            height.value = t.jsxExpressionContainer(t.identifier("size"));
          }
        }
      },
    },
    JSXAttribute: {
      // fills
      // color
      exit(path) {
        if (
          path.node.name.name === "fill" &&
          t.isStringLiteral(path.node.value)
        ) {
          const color = path.node.value.value;
          const index = colorMap.get(color);
          if (index != null) {
            path.replaceWith(
              t.jSXAttribute(
                t.jsxIdentifier("fill"),
                t.jSXExpressionContainer(
                  t.callExpression(t.identifier("getColor"), [
                    t.numericLiteral(index),
                  ])
                )
              )
            );
          }
        }
      },
    },
  });

  const { code } = generate(babelTree);
  return code;
}

module.exports.generateComponent = generateComponent
