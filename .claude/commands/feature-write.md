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