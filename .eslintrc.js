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
    }]
  }
};
