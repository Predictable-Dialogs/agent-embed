**UI BUG FIX COMMAND**

**Variables:**
bug_desc: $ARGUMENTS

**ARGUMENTS PARSING:**
Parse the following arguments from "$ARGUMENTS":
1. `bug_desc` - Path to the file which contains the bug description.

**BUG AND UI ANALYSIS**
- Read and deeply understand the bug description using docs at `bug_desc`.
- Generate the latest build using `npm run build`. The python server to serve the build should already be running.
- Use PLAYWRIGHT MCP to test. Open the UI at `http://localhost:8000/htmls/localbuild-localhost-std.html` which would use the generated build.
- Analyse the UI opened and navigate the UI as required to understand the issue.

**BUG FIX**
- Think step-by-step and implement all the steps needed to fix the bug.

**ULTRA-THINKING DIRECTIVE:**
Before writing the code, engage in extended thinking so the implementation follows the rules.

## RULES FOR IMPLEMENTATION
- The implementation should improve readability and maintainability of the code. 
- The implementation should not affect the performance of the code.
- We will not run any lint after implementaion.
- We will run existing tests to ensure we have not broken existing functionality.
- We should execute `npm run build` to ensure it works.
- DO NOT create/modify/edit/delete any tests.