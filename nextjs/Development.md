## Steps to Link and Use `agent-embed` Package in Next.js Project

### Clone the Repository

Clone the repository:
```sh
git clone https://github.com/Predictable-Dialogs/agent-embed.git

```

### Go to agent-embed/nextjs, link the local package:
Create a symlink in the global node_modules directory, which can be referenced in your project.
```
cd agent-embed/nextjs
npm link
```

### Link the local package in your Next.js project:
Now, navigate to your project's root directory and link the previously created symlink to your project's node_modules.
```
cd /path/to/your/project
npm link @agent-embed/nextjs
```


### Import and use the agent for developemnt:
```
import dynamic from 'next/dynamic';

const Standard = dynamic(() => import('@agent-embed/nextjs').then((module) => module.Standard), { ssr: false });
```


### Develop and test:
Now, you can make changes to the agent-embed package. These changes will be reflected in your Next.js project immediately without needing to publish the package to npm.


### Watch Mode: 

Ensure that your package is built in watch mode if it needs to be transpiled (e.g., TypeScript to JavaScript). This way, changes are automatically compiled and available in your Next.js app.

```
cd agent-embed/nextjs
npm run build -- --watch
```


## Clean up

## Unlink Packages:
From your project
```
npm unlink @agent-embed/nextjs

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
npm install @agent-embed/nextjs @agent-embed/js @agent-embed/react

```

Check for Extraneous Packages:
Ensure your package.json only includes the necessary dependencies. Remove any extraneous packages listed during the npm ls react output. You can use the following command to clean up extraneous packages:

```
npm prune

```