import fs from "fs"
import babel from '@rollup/plugin-babel';
import path from 'path';
import copy from 'rollup-plugin-copy';
import upperCamelCase from 'uppercamelcase'

const resolveFile = function(filePath) {
  return path.join(__dirname, '..', filePath)
}

const rootDir = path.join(__dirname, '..')
const iconList = fs.readdirSync(path.join(rootDir, 'src/icons')).filter(item => item.endsWith('.js')).map(v => {
  return upperCamelCase(v.replace('.js', '')) + ".js"
})

export default {
  input: [
    'src/icons.js',
    ...iconList.map(icon => `src/icons/${icon}`)
  ],
  output: {
    dir: ".",
    format: 'esm',
    entryFileNames: '[name].js',
  },
  plugins: [
    copy({
      targets: [
        { src: resolveFile('src/icons.d.ts'), dest: resolveFile('.') }
      ]
    }),
    babel({
      exclude: 'node_modules/**',
      // babelHelpers: "runtime",
    })
  ],
  external: ['react', 'prop-types'],
};
