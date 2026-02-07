Chapter 4: TOOLS AND TECHNOLOGIES

4.1 OVERVIEW OF TOOLS
A software development tool is a program or application that software developers use to create, debug, maintain, or otherwise support other programs and applications. The term usually refers to relatively simple programs that can be combined together to accomplish a task.
In the development of "Learnity," we used a suite of modern tools to ensure that the application is robust, scalable, and easy to maintain. We moved beyond simple text editors to powerful Integrated Development Environments (IDEs) and cloud-based infrastructure.

4.2 NEXT.JS 16 (FRAMEWORK)
Next.js is a React framework that enables several extra features, including server-side rendering and generating static websites. React is a JavaScript library for building user interfaces, but Next.js takes it further by providing a complete structure for building full-stack web applications.
*   **Why we used it:** It allows us to build both the frontend (what the user sees) and the backend (API logic) in a single project. Its "App Router" feature makes navigation very fast.

4.3 TAILWIND CSS (STYLING)
Tailwind CSS is a utility-first CSS framework. Unlike traditional CSS where you write separate files with custom classes, Tailwind provides low-level utility classes (like `flex`, `pt-4`, `text-center`) that can be used directly in the HTML.
*   **Advantage:** It dramatically speeds up the design process and ensures that the website looks good on mobile devices without writing complex media queries.

4.4 POSTGRESQL & NEON (DATABASE)
PostgreSQL is a powerful, open-source object-relational database system. It uses and extends the SQL language combined with many features that safely store and scale the most complicated data workloads.
*   **Neon:** We used Neon, which is a serverless Postgres provider. This means we don't have to manage the database server ourselves; it automatically scales up when many students are using the app and scales down when they aren't.

4.5 PRISMA (ORM)
Prisma is a next-generation Object-Relational Mapper (ORM). It acts as a bridge between our Next.js code and the PostgreSQL database.
*   **Usage:** Instead of writing raw SQL queries, we write simpler JavaScript functions. Prisma also provides "Type Safety," meaning if we try to save a Student's data without an email address, the code will show an error before we even run it.

4.6 GETSTREAM (CHAT SDK)
GetStream is a powerful API for building scalable chat and activity feed applications.
*   **Implementation:** We used it to build the "Classroom Community" chat. It handles storing messages, showing who is online, and typing indicators, saving us weeks of development time.

4.7 100MS (VIDEO SDK)
100ms is a live video infrastructure platform. It provides the tools to build video conferencing apps like Zoom or Google Meet.
*   **Role in Project:** It powers our live video classrooms. It automatically handles video quality, adjusting it based on the student's internet speed so the connection doesn't drop.

4.8 VISUAL STUDIO CODE (IDE)
Visual Studio Code is a source-code editor made by Microsoft. It includes support for debugging, embedded Git control and GitHub, syntax highlighting, and intelligent code completion.
*   **Role:** This was our primary workspace for writing code. Its extensive ecosystem of extensions (like "ESLint" and "Prettier") helped keep our code clean and error-free.

4.9 GIT & GITHUB (VERSION CONTROL)
Git is a distributed version-control system for tracking changes in source code during software development. GitHub is a cloud-based hosting service for Git repositories.
*   **Workflow:** We used Git to save versions of our project. If a new feature broke the site, we could easily "undo" the changes and go back to a working version.
