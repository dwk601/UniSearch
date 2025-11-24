# UniSearch

**UniSearch** is a modern web platform designed to empower international students in their journey to discover and apply to undergraduate institutions in the United States. It provides comprehensive data, advanced filtering, and tailored insights for non-US applicants.

## 🚀 Features

- **Comprehensive Database**: Access detailed information on over 2,300+ US institutions, including rankings, tuition, and acceptance rates.
- **Smart Search & Filtering**: Filter schools by location, major, test scores (SAT/ACT, TOEFL/IELTS), tuition costs, and more.
- **International Focus**: Dedicated data points for international students, such as international tuition rates and English proficiency requirements.
- **User Dashboard**: Create an account to save favorite schools and track your research.
- **Modern UI**: A beautiful, responsive interface built with the latest web technologies.
- **Secure**: Protected against bots and automated scraping.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/), [Magic UI](https://magicui.design/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Security**: [Arcjet](https://arcjet.com/) (Bot Protection)

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1.  **Clone the repository:**

    ```bash
    git clone
    cd uni-web
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root directory and add the following keys:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ARCJET_KEY=your_arcjet_key
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- `app/`: Next.js App Router pages and API routes.
- `components/`: Reusable UI components (SchoolCard, Filters, etc.).
- `lib/`: Utility functions, Supabase client, and types.
- `hooks/`: Custom React hooks.
- `public/`: Static assets.

## 📄 License

This project is licensed under the MIT License.
