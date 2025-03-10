

The build creates an index.js & web.js

### web.js (CDN/Browser Bundle)
This is the browser-specific bundle used for direct <script> imports via CDN
Creates a global Agent object with methods like initStandard()
Used in the script tag with jsdelivr
Optimized for direct browser usage

### index.js (NPM Package Bundle)
This is the module bundle used when installing via npm/yarn
Used when importing in React or NextJs