/** @type {import("prettier").Config & import('prettier-plugin-tailwindcss').PluginOptions} */
module.exports = {
  semi: true,
  singleQuote: true,
  jsxSingleQuote: false,
  trailingComma: 'all',
  printWidth: 80,
  tabWidth: 2,
  arrowParens: 'always',

  plugins: ['prettier-plugin-tailwindcss'],

  tailwindFunctions: ['cn', 'cva', 'clsx'],
};
