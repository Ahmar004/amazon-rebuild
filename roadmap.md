# What we are building:
Name: Amazon.com
We are building the exact clone of Amazon.com, I have a one-day window for this technical assessment, this is part of my application for the role of Software Engineer at 8x.careers, so please work on it accordingly, we have to ship a perfect clone of amazon.com under 24 hours without hitting token limits.

<hr style="height:4px; background-color:Grey; border:none;">

## Rules:

### Rule-0.0:
We have only one day window to build this (an amazon.com clone) and so you shall adopt working strategies and techniques that does efficient utilization of tokens and helps ship the clone within a one-day window time without hitting token limits.
### Rule-0.1:
Interview me and ask me questions at every important decision making step or when you face a confusion, asking questions from me would also help you get more context on how I want you to build the Amazon and also the "why" behind a requirement.
### Rule-0.2: 
The front-end shall be bug-free and exactly like that of https://amazon.com, it shall be robust and MUST BE user-friendly. The code & backend shall be clean, easy-to-understand, scalable and that the code as well as the front-end doesn't have emojis or long hyphens (use single hyphens like "-" where needed).
### Rule 0.3:
Tech Stack & deployment must be free of cost
### Rule-1: 
Follow this roadmap file at all costs. if you think another step or task needs to be done, please first add it here after approval from me.
### Rule-2: 
Do only one step at a time from this roadmap file for accuracy and focus.
### Rule-3: 
Follow Claude.md file at all costs
### Rule-4:
The frontend & theme shall follow https://amazon.com exactly 100%, until a user looks at the URL, they should not be able to tell that it is a clone, and not the real amazon.
### Rule-5:
Code like a senior Full Stack Engineer, following industry best practices, keeping things simple and easy to understand (both in code and the UI) and only heading to complex solutions/implementations when no simple solution is there. Solve any type of problem you face with a simple solution except for when the problem has only complex solutions.
### Rule-6:
Steps 0, 1, 2, 3, 4 MUST be done using Opus. In Step-6, the main session stays on Opus while implementer subagents run on Sonnet to save tokens.
### Rule-7:
Planning (Steps 0 to 4) is time-boxed to about 2.5 hours in total. Batch questions for each step into as few rounds as possible.
### Rule-8:
There must always be a working, deployed version of the app. Every slice is committed and deployed before the next one starts, so if time runs out, what is live is a smaller app that fully works.

<hr style="height:4px; background-color:Grey; border:none;">

## Steps:

### Step-00:
Agent capture setup (mandatory, from the 8x brief): install Claude Code hooks that log every prompt and final response to .agent-logs/, verify with canary prompts in two sessions, write CAPTURE-TEST.md, initialise git and push to a public GitHub repo. Commit .agent-logs/ as we go, together with the code. Save the 8x brief word for word as docs/requirements.md. Then the user goes through amazon.com end to end (sign up, every flow) and saves screenshots under docs/recon/, which Step-0 analyses along with docs/requirements.md.

### Step-0:
Use /superpowers:brainstorming skill to analyze the requirements under @docs\requirements.md file, and create an accurate and precise spec.md file under /docs to save your in-depth understanding of this project, but spec.md file should still be detailed enough that we no longer have to look at @requirements.md under @/docs again. spec.md shall rank every feature as must-have, nice-to-have or out of scope, and shall state where the product catalogue data and images come from. (about 30 min)

### Step-1:
Use /superpowers:brainstorming writing-plans skill to create a tech-stack.md file under docs to propose and approve the feasible tech stack for this app from me, also suggest the feasible web app rendering strategy that we shuold use after doing an anlysis ( example SSR/CSR/ISR/SSG or a mix of these if feasible) along with precise explanation for reasons to support your choice. It shall also cover the database, hosting and the free-tier limits of each. (about 30 min) Wait for approval from my side before proceeding to step-2

### Step-2: 
Edit the Claude.md file for this project to add any feasible additions based on the files: spec.md and tech-stack.md under @/docs. (about 15 min)

### Step-3: 
Use /superpowers:brainstorming writing-plans skill to create a design.md document for this app that has all the details of how each feature shall be built, it shall cover frontend + backend both. Create Design.md doc on the basis of @spec.md file under /docs as well as @tech-stack.md file under /docs. Please do not invent requirements by yourself, the design.md shall be a guide on how to build this app into a fully working system. The design.md shall also list the list of screens/pop-ups/tabs/flows that our web app shall have. It shall end with an ordered slice plan: vertical slices (for example home, search, product page, cart, checkout, sign-in, orders), ordered must-have first, each one working end-to-end and deployable on its own. (about 1 hour)

### Step-4:
Use /superpowers:brainstorming skill to re-analyze Design.md, @spec.md and @tech-stack.md files under /docs and validate that we are ready to build a perfect clone of the Amazon app. Ask any open-questions from user related to confusions or conflicts in between the docs, and ensure that our next step could be starting the code implementation (meaning that the plan and design is solid and smooth, having no conflicts/confusion and no weaknesses) (about 15 min)

### Step-5:
Foundation (git and GitHub already set up in Step-00): scaffold the project, set up the database and external services under .env.local with an env.example file, seed the product catalogue, deploy the empty app to Vercel on its free vercel.app address (no paid domain, Rule 0.3). (about 45 min)

### Step-6:
Use subagent-driven-development skill to build the app slice by slice in the order of the slice plan in Design.md, on the basis of Design.md, @spec.md and @tech-stack.md files. For every slice: write tests first (test-driven-development), build it, compare it visually against the live amazon.com page, then commit and deploy before starting the next slice. Use Opus for the main agent and Sonnet for the subagents to avoid hitting token limits.

### Step-7:
Hardening: use systematic-debugging and end-to-end tests of the key flows (browse, search, product page, cart, checkout, orders) to find and fix bugs across the whole system, then run a light load check to confirm the deployed app stays responsive under concurrent users.

### Step-8:
Skipped: no paid domain under Rule 0.3; the live link is the free vercel.app address.

### Step-9:
Write the README for submission: what is built, how to run it, the live URL, the trade-offs made, and how AI was used to build it, and a talking-point outline for the walkthrough video (five minutes at most, camera on).

<hr style="height:4px; background-color:Grey; border:none;">