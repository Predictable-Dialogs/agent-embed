# LIST OF CSS CLASSES AND DESCRIPTIONS 

You need to go through the code to come up with a list of CSS classes and their descriptions. The code uses tailwind, so the LIST YOU come up with are classes OTHER THAN tailwind classes. We will be using these classes to theme the chatbot.

The @js/src/assets directory contains some of the classes in @js/src/assets/index.css

These classes should be studied on how it is used in the code base and based on the study the the class list and description can be come up with.

Also there are a list of css variables which the code uses, now when documenting the class, it is possible that the class also take a css variable, in which case when we try to pass a custom style sheet using the custom css prop, there is a possibility that the css variable may conflict the style sheet. THIS ASPECT has to be carefully studied during testing. And documented for each class.

## DETAILED PROCESS TO FOLLOW

- Read the classes in @js/src/assets/index.css and keep note of it.

- Start from the classes in the main Bot Component code. Keep a note of the classes.
- In a sequential step by step manner start traversing the child components to the Bot component and studying their classes. The Bot component is: @js/src/components/Bot.tsx . Keep a note of the classes (other than tailwind classes) as you will use the playwright mcp server to test the styles.
- Ensure you follow a proper algorithmn so that yor are able to traverse each child component till the end and then start from the next child component, none should get missed.
- MAKE A LIST OF ALL YOU LEARN IN THE FILE @spec/custom-css/CSS-CLASSES.MD - FOLLOW THE CONVENTION IN THE FILE.

## ANALYSIS OF CHATBOT STRUCTURE AND CLASSES

After completion of taking note of each class and traversing the code.
- DO extended thinking on the structure of the chabot, its different input options, bubble options and avatar options.
- DO extended thinking on different CSS classes and how they could be used in the chatbot.

## CHATBOT THEMES IDEATION

NOW COME UP WITH 10 DIFFERENT THEME IDEAS. 5 THEMES SHOULD BE DESIGNED WITH INPUT TYPE OF FIXED-BOTTOM. AND 5 THEMES WITH FLOATING INPUT
 - Comic book theme
 - Futuristic theme
 - Vintage theme
 - Social media theme
 - Gaming theme
 - Nature inspired theme
 etc

- MAKE A LIST OF ALL YOU IDEATED IN THE FILE IN @spec/custom-css/ALL_THEMES.MD


## THEME DESIGN AND TESTING
  - STEP 1: NOW STEP BY STEP, DESIGN AND TEST ONE THEME AT A TIME. USE THE CSS CLASSES YOU NOTED DOWN BEFORE in @spec/custom-css/CSS-CLASSES.MD
  - STEP 2: BEFORE STARTING TESTING WRITE DOWN THE THEME IN A NEW FILE IN THE DIR @spec/custom-css. EACH THEME FILE CONTAINS ONE THEME, THE STARTING CSS AND THE FINAL PERFECTED CSS FOR THE SAME THEME.
  - STEP 3: TEST THE THEME USING THE PLAYWRIGHT MCP SERVER, BY GOING TO HTTP://LOCALHOST:3001 AND THEN GOING TO THE LIVE PREVIEW SECTION AND ENTERING THE CUSTOM CSS, THE CHATBOT IS VISIBLE ON THE RIGHT. IF NEEDED CHANGE THE BACKGROUND, FONT, BUBBLE, INPUT OPTIONS, INPUT STYLING. 
  - STEP 4: THERE COULD BE ISSUES IN THE DESIGN, UPDATE THE FILE: @spec/custom-css/CSS-CLASSES.MD WITH THE LEARNINGS FROM THE ISSUES.  
  - STEP 5: RECALIBRATE THE THEME AGAIN AND TEST. IF ISSUES UPDATE THE FILE: @spec/custom-css/CSS-CLASSES.MD WITH THE LEARNINGS FROM THE ISSUES.  
  - STEP 6: REPEAT ABOVE THREE STEPS TILL YOU GET THE UI THEME PREFECTED. ONLY AFTER PERFECTING IT SHOULD YOU MOVE TO THE NEXT STEP.
  - STEP 8: WRITE THE PREFECTED THEME INTO THE THEME FILE IN THE DIR @spec/custom-css.
  - STEP 7: PICK THE NEXT THEME, AND START FROM STEP 1, IF NO MORE THEMES STOP.