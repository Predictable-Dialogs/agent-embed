## Steps to setup development environment for @agent-embed/nextjs

### Clone the Repository

Clone the repository:
```sh
git clone https://github.com/Predictable-Dialogs/agent-embed.git

```

### Option 1: Use `npm link` 

#### Go to agent-embed/nextjs, link the local package:
Create a symlink in the global node_modules directory, which can be referenced in your project.
```
cd agent-embed/nextjs
npm link
```

#### Link the local package in your Next.js project:
Now, navigate to your project's root directory and link the previously created symlink to your project's node_modules.
```
cd /path/to/your/project
npm link @agent-embed/nextjs
```

### Option 2: Include in package.json using `file`
In your project update it to use the cloned @agent-embed/js.
 "@agent-embed/nextjs": "file:../path/to/agent-embed/nextjs",


### Update your next.config.js or next.config.mjs to use the same react instance.
Update next.config.mjs: Open your next.config.mjs file and modify it to include the alias configuration for React.
```
import path from 'path';

const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Resolve React to a single instance
    config.resolve.alias['react'] = path.resolve('node_modules/react');

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;

```

If you are using a next.config.js, then do the below:
```
const path = require('path');

module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Resolve React to a single instance
    config.resolve.alias['react'] = path.resolve(__dirname, 'node_modules/react');
    
    // Important: return the modified config
    return config;
  },
};

```

### Import and use the agent for developemnt:
```
import { Standard } from '@agent-embed/nextjs'

...

<Standard
  id={'1234'}
  agentName={'Your agent name'}
  apiHost={"https://app.predictabledialogs.com/web/incoming"}
  style={{ width: '400px', height: '400px' }}
/>

```


### Develop and test:
Now, you can make changes to the agent-embed package. These changes will be reflected in your Next.js project immediately without needing to publish the package to npm.


### Watch Mode: 

Ensure that your package is built in watch mode if it needs to be transpiled (e.g., TypeScript to JavaScript). This way, changes are automatically compiled and available in your Next.js app.

```
cd agent-embed/js
npm run build -- --watch
cd ../react
npm run build -- --watch
cd ../nextjs
npm run build -- --watch
```


## Clean up

## Unlink Packages:
From your project
```
npm unlink @agent-embed/nextjs
npm unlink -g @agent-embed/nextjs

```

Check the global node_modules directory is cleared: 
```
npm ls -g --depth=0
npm rm -g <package1> <package2> ... <packageN>
```

Then, remove the node_modules directory and the package-lock.json file:
```
rm -rf node_modules package-lock.json

```
Reinstall your dependencies to ensure a fresh setup:

```
npm install

```

Add Missing Dependencies:

```
npm install @agent-embed/nextjs

```