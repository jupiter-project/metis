module.exports = { 
    "env": {
        "browser":true,
        "node": true,
        "es6": true,
        "jest": true,
    },
    "extends": "airbnb",
    "rules": {
        "no-console" : "off",
        "global-require" : "off",
        "import/no-dynamic-require" : "off",
        "class-methods-use-this" : "off",
        "react/jsx-uses-vars" : 1,
        "prefer-promise-reject-errors" : "off",
        "no-nested-ternary" : "off",
        "no-alert" : "off",
        "import/extensions" : "off",
        "react/jsx-filename-extension" : "off",
        "react/no-multi-comp":"off"
    },
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true,
        }
    },
    "plugins": [
        "eslint-plugin-react"
    ]
};