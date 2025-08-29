# TeamFlow: AI-Powered Task & Team Management Application

![TeamFlow Screenshot](https://picsum.photos/1200/600?random=1)

## Overview

TeamFlow is an AI-powered project management application built to enhance team collaboration. It serves as a centralized platform for managing tasks and tracking progress, aiming to streamline workflows through intelligent features. TeamFlow is designed for software teams, project managers, and any group needing an efficient, visual tool to organize their work.

---

## Stakeholder Identification

| NAME                | ROLE                               | RESPONSIBILITY                                                                | INTERESTS IN THIS PRODUCT                                                                 |
| ------------------- | ---------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Project Manager** | Product Owner / Project Lead       | Defines project goals, manages backlog, prioritizes features, and ensures the project meets business objectives. | Successful project delivery, on-time and within budget. A tool that provides clear visibility into project progress and team workload. |
| **Development Team**| Software Engineers (Frontend/Backend) | Develop, test, and maintain the application's features and infrastructure.      | A stable, well-documented codebase. An effective tool to track tasks, bugs, and development progress without unnecessary complexity. |
| **UI/UX Designer**  | User Experience & Interface Designer | Creates user-friendly, intuitive, and visually appealing interfaces. Conducts user research to guide design decisions. | A product that is easy to use and provides a positive user experience. Successful implementation of their design vision. |
| **End-Users**       | Team Leaders & Team Members        | Use the application for daily task management, collaboration, and progress tracking. | An intuitive and efficient tool that simplifies their work, improves communication, and helps them stay organized and focused. |
| **Company Mgmt.**   | Executive Sponsor / Department Head | Provides budget and resources, oversees project alignment with company strategy. | Return on investment (ROI), improved team productivity, and successful adoption of the tool across the organization. |

---

## ✨ Key Features

*   **Visual Task Management:** Drag-and-drop Kanban board for easy status updates (`Backlog`, `To Do`, `In Progress`, `Done`).
*   **Multiple Views:** View tasks as a Kanban Board, a Calendar (by due date), or a Timeline to get a comprehensive overview of the project.
*   **Team Administration:** Create teams, add/remove members, and assign roles (Leader, Member).
*   **AI Integration with Genkit:**
    *   **Auto-Generated Descriptions:** AI helps craft detailed task descriptions from just a few keywords.
    *   **Assignee Suggestions:** AI analyzes member expertise and workload to recommend the most suitable person for a task.
*   **Customizable Interface:** Multiple color themes (Light, Dark, Ocean, Forest, High Contrast) to personalize the user experience.
*   **Analytics & Reporting:** Visual charts to track team performance and work distribution.
*   **Responsive Design:** Optimized interface for a seamless experience on both desktop and mobile devices.
*   **Secure Authentication:** Secure login system with user permissions.

---

## 🚀 Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (using App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **UI:** [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Shadcn/ui](https://ui.shadcn.com/)
*   **Database:** [MongoDB](https://www.mongodb.com/)
*   **DB Interaction:** [Mongoose](https://mongoosejs.com/)
*   **Server-Side Logic:** Next.js Server Actions
*   **Artificial Intelligence (AI):** [Google AI & Genkit](https://firebase.google.com/docs/genkit)
*   **State Management:** React Hooks & Context API
*   **Drag & Drop:** [dnd-kit](https://dndkit.com/)
*   **Charts:** [Recharts](https://recharts.org/)

---

## 🛠️ Setup and Run the Project

To run this project locally, follow these steps:

### 1. Prerequisites

*   [Node.js](https://nodejs.org/en) (version 18.x or higher)
*   `npm` or `yarn`
*   A MongoDB connection string (from MongoDB Atlas or a local instance)
*   A Google AI API Key (for Genkit features)

### 2. Installation Steps

**a. Clone the repository:**
```bash
git clone <YOUR_REPOSITORY_URL>
cd <PROJECT_DIRECTORY_NAME>
```

**b. Install dependencies:**
```bash
npm install
```

**c. Set up environment variables:**

Create a file named `.env` in the project's root directory and add the following variables:

```env
# Your connection string to your MongoDB database
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority"

# Your API Key from Google AI Studio
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

**d. Run the development servers:**

You need to run the Next.js app and the Genkit server concurrently in two separate terminals:

*   **Terminal 1 (Run the Next.js app):**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

*   **Terminal 2 (Run Genkit for AI):**
    ```bash
    npm run genkit:watch
    ```
    This will start the Genkit server and automatically reload on changes to the flow files.

### 3. Default Account

After the initial data seed, you can log in with the following account:
-   **Email:** `admin@teamflow.com`
-   **Password:** `Admin@1234`

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.
