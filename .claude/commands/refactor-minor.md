**REFACTOR PLAN COMMAND**

**Variables:**
primary_src: $ARGUMENTS
refactor_spec: $ARGUMENTS

**ARGUMENTS PARSING:**
Parse the following arguments from "$ARGUMENTS":
1. `primary_src` - Path to the file which contains the primary source code which needs to be refactored.
2. `refactor_spec` - Path to the file which contains specs for the refactor.

**DOC & CODE ANALYSIS**
- Read and deeply understand the code at `primary_src`. 

**REFACTOR PLANNING**
- Read the refactor specification file at `refactor_spec`. Then think step-by-step and outline all the refactor steps needed. Do not write the code yet. 
– The refactor could impact files other than `primary_src`, the analysis should present the changes needed across the entire code base, file by file.

**ULTRA-THINKING DIRECTIVE:**
Before presenting the refactor plan, engage in extended thinking so the refactor follow the rules.

## RULES FOR REFACTORING
- The refactor should improve readability and maintainability of the code. 
- The refactor should not affect the performance of the code.