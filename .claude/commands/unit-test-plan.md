**UNIT TEST PLAN COMMAND**

**Variables:**
component_doc: $ARGUMENTS
component_src: $ARGUMENTS
component_test_doc: $ARGUMENTS

**ARGUMENTS PARSING:**
Parse the following arguments from "$ARGUMENTS":
1. `component_doc` - Path to the file which contains source code documentation.
2. `component_src` - Path to the component source code which needs unit tests.
3. `component_test_doc` - Path to the file which contains specs for the unit tests

**DOC & CODE ANALYSIS**
- Read and deeply understand the code using doc at `component_doc` and source at `component_src`. 

**UNIT TEST PLANNING**
- Read the unit test specification file at `component_test_doc`. Then think step-by-step and outline all the test scenarios needed. Do not write the test code yet – just list the distinct test cases and what each should assert. 

**ULTRA-THINKING DIRECTIVE:**
Before presenting the unit test plan, engage in extended thinking so the unit tests follow the rules below:
  - The planned tests should be concrete, which means the test should cover the positive and its opposite negative tests as well.
  - Assertions in tests need to be meaningful. 
  - Do not write trivial assertions that always pass.
  - The tests must fail if the feature is broken.
  - No false positive tests – tests that pass with broken functionality are forbidden. 

