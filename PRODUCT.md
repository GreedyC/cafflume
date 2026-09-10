# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Home specialty coffee enthusiasts dialing in pour-overs, espresso, and immersion brews. They care about brew parameters (dose, yield, water temperature, grind setting, brew duration), bean resting curves, and dial-in history across different roasters and varieties.

## Product Purpose
BrewStack provides a dedicated, tactile digital journal to track beans, record precise brew parameters, monitor roast age and resting windows, and refine recipes over time so every cup gets measurably better.

## Positioning
Unlike generic note-taking apps or bloated social coffee feeds, BrewStack is an intentional, focused personal brewing workshop. It couples roast age and resting curve intelligence with precise dialing-in metrics (dose, yield, brew time, grind, temp, rating) with zero friction.

## Operating Context
Used next to the coffee grinder, kettle, and scale in the kitchen or brew bar while brewing, or immediately after tasting a cup. Frequently accessed on mobile or tablet during the morning routine, demanding instant legibility, swift inputs, and tactile responsiveness.

## Capabilities and Constraints
- Bean inventory tracking roaster, origin, variety, processing method, roast date, open date, and status (active vs. finished).
- Roast age calculation with resting status indicators (resting, ideal window, consume first).
- Brew logs recording method (V60, Aeropress, Espresso, etc.), dose (g), yield (ml), water temperature (°C), grind setting, brew duration (min/sec), rating, and sensory tasting notes.
- Live brew sessions with a persistent timer, recipe draft recovery, one-variable comparison, and complete handoff into the result form.
- Structured cupping sessions linked to a coffee, with eight sensory dimensions and a clearly labeled personal 100-point score.
- Dashboard with daily brew activity, weekly brewing statistics, favorite brew method, and highest-rated recipes for active beans.
- User authentication and role-based access (Admin, Member) with secure session management and invite-based onboarding.
- Built with Next.js 16 (App Router), React 19, Tailwind CSS, Prisma ORM, and PostgreSQL.
- Bonus waiting/entertainment utility: Coffee 2048 mini-game (`/play`).

## Brand Commitments
- Name: BrewStack
- Language & Voice: English is the default. Turkish, Spanish, German, Norwegian, Japanese, and Korean are available from a compact text-based language selector. Voice is concise, expert, neutral, and globally legible.
- Identity signals: Modern precision-metrology workstation; cool off-white, graphite and anodized gray surfaces with one restrained safety-orange signal color; neutral sans typography and monospaced numeric readouts.

## Evidence on Hand
- Full functional Next.js application codebase with Prisma schema and seed data.
- Implemented dashboard, bean list, brew log entries, recipe cards, user management, and settings routes.
- Seed data and test suites covering API security, auth sessions, validations, and 2048 logic.

## Product Principles
1. **Ritual Over Friction:** Logging a brew or checking bean freshness must take seconds; inputs must feel effortless at the brew bar.
2. **Precision Without Clutter:** Display vital dial-in parameters (ratio, grind, temp, time) with clear hierarchy and typographic clarity.
3. **Respect the Curve:** Treat the bean's timeline (roast date, rest window, peak flavor window) as a core dimension of the experience.
4. **Industrial Clarity:** The interface should feel like a calibrated coffee instrument: modern, restrained, durable, and culturally neutral rather than decorative or lifestyle-led.

## Accessibility & Inclusion
- High-contrast readable text in both light and dark themes.
- Generous tap targets for rapid one-handed mobile use at the brew station.
- Clear numeric display and distinct semantic status indicators (not relying on color alone).
