/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prefer-template */
const path = require('path')
const fs = require('fs')
const format = require('prettier-eslint')
const processSvg = require('./processSvg')
const { parseName } = require('./utils')
const defaultStyle = process.env.npm_package_config_style || 'stroke'
const { getAttrs, getElementCode } = require('./template')
const icons = require('../src/data.json')
const upperCamelCase = require("uppercamelcase")

const rootDir = path.join(__dirname, '..')

// where icons code in
const srcDir = path.join(rootDir, 'src')
const iconsDir = path.join(rootDir, 'src/icons')


const initialTypeDefinitions = `/// <reference types="react" />
  import { ComponentType, SVGAttributes } from 'react';

  interface Props extends SVGAttributes<SVGElement> {
    color?: string;
    size?: string | number;
  }

  type Icon = ComponentType<Props>;
  `;

// generate icons.js and icons.d.ts file
const generateIconsIndex = () => {
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir)
    fs.mkdirSync(iconsDir)
  } else if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir)
  }

  fs.writeFileSync(path.join(rootDir, 'src', 'icons.js'), 'import React, { Suspense } from "react";\r\n', 'utf-8');
  fs.writeFileSync(
    path.join(rootDir, 'src', 'icons.d.ts'),
    initialTypeDefinitions,
    'utf-8',
  );
}

// generate attributes code
const attrsToString = (attrs, style) => {
  console.log('style: ', style)
  return Object.keys(attrs).map((key) => {
    // should distinguish fill or stroke
    if (key === 'width' || key === 'height' || key === style) {
      return key + '={' + attrs[key] + '}';
    }
    if (key === 'otherProps') {
      return '{...otherProps}';
    }
    return key + '="' + attrs[key] + '"';
  }).join(' ');
};

// generate icon code separately
const generateIconCode = async ({name}) => {
  const names = parseName(name, defaultStyle)
  console.log(names)
  const location = path.join(rootDir, 'src/svg', `${names.name}.svg`)
  const destination = path.join(rootDir, 'src/icons', `${upperCamelCase(names.name)}.js`)
  const code = fs.readFileSync(location)
  const svgCode = await processSvg(code)
  const ComponentName = names.componentName
  const element = getElementCode(ComponentName, attrsToString(getAttrs(names.style), names.style), svgCode)
  const component = format({
    text: element,
    eslintConfig: {
      extends: 'airbnb',
    },
    prettierOptions: {
      bracketSpacing: true,
      singleQuote: true,
      parser: 'flow',
    },
  });

  fs.writeFileSync(destination, component, 'utf-8');

  console.log('Successfully built', ComponentName);
  return {ComponentName, name: names.name}
}

// append export code to icons.js
const appendToIconsIndex = ({ComponentName, name}) => {
  // const exportString = `export const ${ComponentName} = React.lazy(() => import( /* webpackChunkName: "prism.icons.${ComponentName}" */ './icons/${upperCamelCase(name)}'));\r\n`;
  const cacheName = `${ComponentName}_cache`
  const exportString = `
  let ${cacheName} = null;
  export const ${ComponentName} = (props) => {
    const { fallback = null, ...otherProps } = props
    let C = ${cacheName} || React.lazy(() => import( /* webpackChunkName: "prism.icons.${ComponentName}" */ './icons/${upperCamelCase(name)}'));
    ${cacheName} = C;
    return (<Suspense fallback={fallback}>
      <C {...otherProps}/>
    </Suspense>)
  };
  `;
  fs.appendFileSync(
    path.join(rootDir, 'src', 'icons.js'),
    exportString,
    'utf-8',
  );

  const exportTypeString = `export const ${ComponentName}: Icon;\n`;
  fs.appendFileSync(
    path.join(rootDir, 'src', 'icons.d.ts'),
    exportTypeString,
    'utf-8',
  );

  fs.writeFileSync(
    path.join(rootDir, `${ComponentName}.d.ts`),
    `${initialTypeDefinitions}
      declare const _default: Icon;
      export default _default;`,
    'utf-8',
  )
}

generateIconsIndex()

Object
  .keys(icons)
  .map(key => icons[key])
  .forEach(({name}) => {
    generateIconCode({name})
      .then(({ComponentName, name}) => {
        appendToIconsIndex({ComponentName, name})
      })
  })
