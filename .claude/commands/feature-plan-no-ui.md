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
– The implementation could impact multiple files, the analysis should present the changes needed across the entire code base, file by file.

# Implementation rules:
The plan should contain a reference to the implementation rules at `agent-embed/js/src/__rules__/implementation-rules.md`

# ULTRA-THINKING DIRECTIVE
Before presenting the implementation plan, engage in extended thinking so the plan is as per 
 - The instructions in this command 
 - Covers all aspects mentioned in the `feature_spec`.

# FEATURE PLAN SAVING
When the implementation plan is ready, it should be written into the the directory in which the `feature_spec` lies.