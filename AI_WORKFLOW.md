# AI Workflow Note

## AI Tool Used

I primarily used Claude (Sonnet) through the Claude web interface. I used it as a conversational assistant by sharing project files, code snippets, error messages, and screenshots whenever I got stuck during development. And i also used used Chatgpt to understand a few new concepts during the building of the project.

## Where AI Helped Me the Most

### Code Review and Bug Detection

One of the most useful things Claude did was review my project and point out issues that I had missed. It identified problems such as missing imports, incomplete routing, authentication weaknesses, and configuration issues that were causing parts of the application to fail.

### Debugging Errors

When I encountered errors during development, especially API and authentication issues, I shared the error messages and relevant code. Instead of spending a long time guessing possible causes, Claude helped narrow down the root problem and suggested fixes that I could test immediately.

### Understanding Complex Bugs

A few bugs were not obvious from simply reading the code. For example, when document renaming was not working correctly, Claude helped me trace the issue to how state updates and closures were behaving in React. This saved significant debugging time and helped me better understand the underlying problem.

### Generating Boilerplate Code

For repetitive tasks such as file upload functionality, middleware setup, utility functions, and test cases, AI helped generate the initial structure. This allowed me to focus more on integrating the features into the application rather than writing standard boilerplate code from scratch.

## Changes I Made to AI Suggestions

I did not blindly accept every suggestion. I reviewed the generated code before adding it to the project and modified several parts to fit my application structure and requirements.

For example, I adopted stronger authentication practices using JWT-based authentication and implemented server-side authorization checks to improve security. I also adjusted several UI and API-related suggestions to match the design and architecture of my project.

## How I Verified the Results

I verified all AI-generated changes through testing rather than assuming they were correct.

My testing process included:

* Running the application locally after each major change.
* Testing user registration and login flows.
* Creating, editing, and renaming documents.
* Verifying document persistence after page refreshes.
* Testing file import functionality.
* Testing document sharing between different user accounts.
* Checking that protected routes could not be accessed without proper authentication.

Whenever a suggested fix did not work as expected, I investigated further, reproduced the issue, and refined the implementation until the feature behaved correctly.

## What I Learned

AI significantly accelerated development by helping with debugging, code reviews, and generating repetitive code. However, successful implementation still required understanding the codebase, validating suggestions, testing functionality, and making design decisions independently.

I treated AI as a development assistant rather than an automatic code generator, and all final code was reviewed, tested, and integrated manually.
