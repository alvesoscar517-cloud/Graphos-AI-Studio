module.exports = {
  locales: ['en'],
  output: 'src/i18n/locales/$LOCALE.json',
  input: ['src/**/*.{js,jsx}'],
  keySeparator: '.',
  namespaceSeparator: false,
  defaultValue: (locale, namespace, key) => `__MISSING__${key}`,
  sort: true,
  createOldCatalogs: false,
  keepRemoved: true,
  lexers: {
    js: ['JsxLexer'],
    jsx: ['JsxLexer'],
  },
}
