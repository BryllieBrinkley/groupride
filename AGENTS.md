# AGENTS.md

This is GroupRide, a premium marketplace for group transportation bookings.

Tech stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Stripe

Package manager:
- pnpm

Commands:
- Install: pnpm install
- Dev server: pnpm dev
- Build: pnpm build
- Lint: pnpm lint

Project structure:
- app/ contains routes and pages
- components/ contains reusable UI components
- lib/ contains utilities, auth, services, and data logic
- public/ contains images and assets
- styles/ contains global styles

Design system:
- Soft beige backgrounds
- Thin borders
- Rounded cards
- Large typography
- Muted gray labels
- Dark brown buttons
- Match homepage aesthetic exactly
- Keep layouts clean and spacious
- Use 2-column layouts on desktop and stacked layouts on mobile

Coding rules:
- Reuse existing components whenever possible
- Avoid duplicate UI styles
- Keep sections modular
- Prefer server components where possible
- Use named exports
- Keep code readable and production-ready
- Do not install new dependencies unless necessary

Important reusable components:
- Navbar
- Card
- Button
- Badge
- Input
- Label
- PageHeader
- DashboardNav

Operator page requirements:
- Hero section with application form
- Benefits cards
- How it works section
- Fleet type cards
- Dashboard preview
- Requirements checklist
- FAQ section
- Final CTA banner