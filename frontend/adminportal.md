"Mujhe apne backend ke liye ek mukammal, production-ready Admin Portal banana hai. Neeche tamam requirements detail mein di gayi hain:

🏗️ 1. Project & Folder Structure

Frontend ka folder structure fully optimized aur professional hona chahiye
Feature-based ya module-based architecture follow karo (e.g. src/features/, src/components/, src/pages/, src/hooks/, src/services/, src/store/, src/utils/, src/types/)
Reusable components alag folder mein hone chahiye
Har module apni jagah organized ho — koi bhi file galat jagah na ho
Environment variables ka proper setup ho (.env, .env.example)
Absolute imports configure hone chahiye (no ../../.. hell)


🔐 2. Authentication & Authorization

Secure login/logout system with JWT or session-based auth
Token refresh mechanism (access + refresh tokens)
Role-based access control (RBAC) — e.g. Super Admin, Admin, seller, customer, support_agent
Protected routes — unauthorized users ko access na mile
Persistent login (remember me / token stored securely)
Session timeout handling
Unauthorized / forbidden pages (401, 403)


📊 3. Dashboard

Main dashboard with real-time stats/KPIs (cards, counters)
Charts & graphs (bar, line, pie — e.g. using Recharts ya Chart.js)
Recent activity feed
Quick action buttons
Responsive layout for all screen sizes


📋 4. CRUD Modules (Backend ke mutabiq)

Har backend resource ke liye complete CRUD UI:

Data tables with pagination, sorting, filtering, search
Add / Edit forms with full validation
Delete with confirmation modal
Bulk actions (select all, bulk delete, bulk status change)
Export to CSV / Excel / PDF


Loading skeletons aur empty states har jagah hone chahiye


🧩 5. UI/UX & Components

Fully responsive design (mobile, tablet, desktop)
Professional UI library use karo (e.g. shadcn/ui, Ant Design, MUI, Chakra UI)
Dark mode / light mode toggle
Toast/snackbar notifications for all actions (success, error, warning)
Global error boundary
404 Not Found page
Loader/spinner for async operations
Confirmation dialogs for destructive actions
Breadcrumbs for navigation


🔗 6. API Integration

Centralized API service layer (e.g. Axios instance with base URL, interceptors)
Request interceptor — auto attach auth token
Response interceptor — handle 401 (auto logout), 500 errors globally
Full error handling on every API call
Loading & error states on every data fetch
Optimistic updates jahan applicable ho
API types/interfaces properly defined (TypeScript)


🗃️ 7. State Management

Global state management properly setup (Redux Toolkit / Zustand / React Query)
Server state aur client state alag manage ho
React Query ya SWR for data fetching, caching, background refetch
Form state managed with React Hook Form + Zod/Yup validation


🧪 8. Testing

Unit tests for utility functions aur hooks
Component tests for critical UI components
Integration tests for key user flows (login, CRUD operations)
API mock setup for tests (MSW ya similar)
Test coverage report generate ho


⚡ 9. Performance & Optimization

Code splitting aur lazy loading for all routes
Memoization jahan zaroorat ho (useMemo, useCallback, React.memo)
Image optimization
Bundle size optimized — unnecessary dependencies na hon
Debounce on search inputs
Virtualized lists for large datasets (e.g. react-window)


🛡️ 10. Security

XSS protection — no dangerouslySetInnerHTML without sanitization
CSRF token handling agar backend support karta ho
Sensitive data (tokens) securely stored (httpOnly cookies preferred)
Input sanitization on all forms
No hardcoded secrets/API keys in code


📁 11. Code Quality

TypeScript strict mode enabled
ESLint + Prettier configured with strict rules
Husky pre-commit hooks (lint + format check)
No any types — proper typing everywhere
No unused variables, imports ya dead code
Consistent naming conventions (camelCase, PascalCase jahan applicable)
Every component, hook aur utility properly documented (JSDoc where needed)


🚀 12. Build & Deployment Ready

Production build fully optimized
Environment-specific configs (dev, staging, prod)
README with setup instructions, environment variables list, run commands
.gitignore properly configured
No console logs in production build


Final requirement: Jab yeh sab complete ho, to pura portal error-free hona chahiye. Har cheez test ki gayi ho. Koi bhi broken link, broken API call, ya UI glitch na ho. Yeh ek production-ready, client-ko-dene-layak admin portal hona chahiye — nah sirf ek demo."**