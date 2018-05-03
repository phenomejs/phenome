module.exports = {
    "extends": "airbnb-base",
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
            ObjectPattern: { minProperties: 8, multiline: true, consistent: true },
        }],
    }
};
