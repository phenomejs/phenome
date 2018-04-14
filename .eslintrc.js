module.exports = {
  "extends": "airbnb",
  "rules": {
    'max-len': ['error', 200, 2, {
      ignoreUrls: true,
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
    }],
    'no-param-reassign': ['error', {
      props: false,
    }],
    'prefer-destructuring': 'off',
    'object-curly-newline': ['error', {
      ObjectExpression: { minProperties: 8, multiline: true, consistent: true },
      ObjectPattern: { minProperties: 8, multiline: true, consistent: true }
    }],
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': 'off',
    'react/no-string-refs': 'off',
    'react/jsx-no-bind': 'off',
    'react/jsx-closing-tag-location': 'off',
  }
};
