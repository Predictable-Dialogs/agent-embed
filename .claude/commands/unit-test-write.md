 **UNIT TEST WRITE COMMAND**

**Variables:**
component_doc: $ARGUMENTS
component_src: $ARGUMENTS
component_test_plan: $ARGUMENTS

**ARGUMENTS PARSING:**
Parse the following arguments from "$ARGUMENTS":
1. `component_doc` - Path to the file which contains source code documentation.
2. `component_src` - Path to the component source code which needs unit tests.
3. `component_test_plan` - Path to the file which contains specs for the unit tests

**DOC & CODE ANALYSIS**
- Read and deeply understand the code using doc at `component_doc` and source at `component_src`. 

**UNIT TEST WRITING**
- Read the unit test plan file at `component_test_plan`. Then think step-by-step to write only the tests specified in the plan.  

**ULTRA-THINKING DIRECTIVE:**
Before writing the unit tests, engage in extended thinking as below:
  - Assertions in tests need to be meaningful. Do not write trivial assertions that always pass. The tests must fail if the feature is broken.
  - No false positive tests – tests that pass with broken functionality are forbidden. 

**RULES**
Always Follow the below rules
  - Only write "Approved" tests in plan.
  - Where needed write tests in jsdom so window and localStorage exist
  - Do not delete or modify existing tests.
  - Do not modify the plan.