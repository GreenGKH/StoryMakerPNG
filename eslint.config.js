export default [
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly"
      }
    },
    rules: {
      // Best practices
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
      
      // Code style
      "indent": ["error", 2],
      "quotes": ["error", "single"],
      "semi": ["error", "always"],
      "comma-dangle": ["error", "never"],
      
      // ES6+
      "prefer-const": "error",
      "no-var": "error",
      "arrow-spacing": "error",
      "template-curly-spacing": ["error", "never"],
      
      // Security
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-script-url": "error"
    }
  },
  {
    files: ["client/**/*.jsx"],
    languageOptions: {
      globals: {
        React: "readonly",
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        fetch: "readonly"
      }
    },
    rules: {
      // React specific
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off"
    }
  },
  {
    files: ["server/**/*.js"],
    languageOptions: {
      globals: {
        Buffer: "readonly",
        process: "readonly",
        global: "readonly"
      }
    }
  }
];