**FEATURE PLAN COMMAND**

**Variables:**
feature_spec: $ARGUMENTS

**ARGUMENTS PARSING:**
Parse the following arguments from "$ARGUMENTS":
1. `feature_spec` - Path to the file which contains specs for the feature.

**DOC & CODE ANALYSIS**
- Read and deeply understand the feature specs using doc at `feature_spec`.

**FEATURE PLANNING**
- Read the feature specification file at `feature_spec`. Then think step-by-step and outline all the refactor steps needed. Do not write the code yet. 
– The refactor could impact multiple files, the analysis should present the changes needed across the entire code base, file by file.

**ULTRA-THINKING DIRECTIVE:**
Before presenting the feature plan, engage in extended thinking so the plan is as per the `feature_spec`.