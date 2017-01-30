# Generating APIs

Put Swagger JSON into online editor and generate the `Typescript Fetch` library.

Replace the top import statements:

```

// with
var isomorphicFetch = require("isomorphic-fetch");
var assign = require("core-js/library/fn/object/assign");
```

Replace the PUT headers.

```
// replace
fetchOptions.headers = contentTypeHeader;
// with
fetchOptions.headers = Object.assign({}, contentTypeHeader, options.headers);
```