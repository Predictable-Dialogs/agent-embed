**FEATURE IMPLEMENT COMMAND**

**Variables:**
requirement_spec: $ARGUMENTS
feature_spec: $ARGUMENTS

**ARGUMENTS PARSING:**
Parse the following arguments from "$ARGUMENTS":
1. `requirement_spec` - Path to the file which contains the requirement spec.
2. `feature_spec` - Path to the file which contains the feature spec.

**DOC & CODE ANALYSIS**
- Read and deeply understand the requirements and implementation using docs at `requirement_spec` and `feature_spec`. 

**IMPLEMENT**
- Think step-by-step and implement all the steps needed.

**ULTRA-THINKING DIRECTIVE:**
Before writing the code, engage in extended thinking so the implementation follows the rules.

## RULES FOR IMPLEMENTATION
- The implementation should improve readability and maintainability of the code. 
- The implementation should not affect the performance of the code.
- We will not run any lint after implementaion.
- We will run existing tests to ensure we have not broken existing functionality.
- We should execute `npm run build` to ensure it works.
- DO NOT create/modify/edit/delete any tests.


# Testing: 
- Use the Playwright MCP server for testing. You need to build the code before testing using `npm run build`.
- The python http server is already running.
- The fixtures are in `agent-embed/js/src/__tests__/fixtures`, feel free to use and modify for testing.
- E.g of opening a fixter is: `http://localhost:8000/pd/agent-embed/js/src/__tests__/fixtures/lb-lh-std-input.html`


# Writing Unit tests
- Write unit tests AFTER testing with playwright only.
- Follow the rules in `agent-embed/js/src/__rules__/test-rules.md` for writing the tests.

