**REFACTOR COMMAND**

**Variables:**
refactor_plan: $ARGUMENTS
primary_src: $ARGUMENTS

**ARGUMENTS PARSING:**
Parse the following arguments from "$ARGUMENTS":
1. `refactor_plan` - Path to the file which contains the refactoring plan.
2. `primary_src` - Path to the file which contains the primary source code could be affected.

**DOC & CODE ANALYSIS**
- Read and deeply understand the code using doc at `refactor_plan` and source at `primary_src`. 

**REFACTOR**
- Think step-by-step and implement all the refactor steps needed.

**ULTRA-THINKING DIRECTIVE:**
Before writing the code, engage in extended thinking so the refactor follow the rules.

## RULES FOR REFACTORING
- The refactor should improve readability and maintainability of the code. 
- The refactor should not affect the performance of the code.
- After the refactor run the tests specified and ensure all tests continue to pass. DO NOT modify/edit/delete any existing tests.