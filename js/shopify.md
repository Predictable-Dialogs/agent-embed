## Shopify Instructions

Including custom JavaScript into your Shopify store can enhance its functionality and user experience. Here's a guide on how to do it:

Step 1: Access Your Shopify Admin
Log into your Shopify admin panel.
Go to Online Store > Themes.

Step 2: Choose Your Theme
Find the theme you want to edit and click Customize.
If you want to edit the code directly, click on Actions > Edit code instead of Customize.

Step 3: Add Custom JavaScript
If Editing Directly in Theme:

In the code editor, look for a file named theme.liquid or similar.
Scroll to the bottom of this file before the closing </body> tag.

Insert a <script> tag and write your custom JavaScript inside or link to an external JavaScript file.
```html
<script type="module">
  import Agent from 'https://cdn.jsdelivr.net/npm/@agent-embed/js@0.0.1/dist/web.js'

  Agent.initBubble({
    agentName: 'options-agent',
  })
</script>
<agent-bubble></agent-bubble>
```

Save the changes.
Using Theme Customizer (for basic scripts):

Some themes have sections where you can insert custom scripts without editing the code directly. Look for a section like Theme settings or Custom HTML.
Add your JavaScript code in the provided area.

Step 4: Test Your Script
Preview your theme to see if the JavaScript works as intended.
Check for any console errors and ensure the script doesn't break any existing functionality.


### Important Considerations:
Backup Your Theme: Always backup your theme before making changes.

Performance Impact: Be aware that adding too much JavaScript can slow down your site.

Compatibility: Ensure your script is compatible with major browsers.

Shopify Guidelines: Follow Shopify's guidelines and limitations for custom code.

Using External JavaScript Files:
If you prefer to use an external JS file:
Upload the file to your Shopify store's Files section.
Link to the file in your theme.liquid using the URL provided by Shopify after upload.

Debugging:
Use browser developer tools for debugging and testing your JavaScript.
Advanced Customization:
For more complex tasks, consider hiring a professional Shopify developer or using Shopify apps that can add the desired functionality without direct coding.

Remember, the exact steps might slightly vary depending on your specific theme and its features. Always test thoroughly to ensure the custom JS doesn't interfere with your store's functionality.




