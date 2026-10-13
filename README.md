This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Use Node.js 24 LTS (also specified in `.nvmrc`), install dependencies, then run the development server:

```bash
nvm install
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Pages live in `src/app`. The page auto-updates as you edit the file.

This project uses `next/font` to load Poppins and Tajawal. Next.js uses Turbopack for development and production builds, with SVGR configured for SVG component imports.

Run the checks after a batch of changes:

```bash
npm run lint
npm run typecheck
npm run build
```

ESLint stays on the latest 9.x release because the React and accessibility plugins used by Next.js do not yet support ESLint 10. TypeScript stays on 6.0 because typescript-eslint does not yet support TypeScript 7. Node type definitions match the Node 24 runtime.

The Lightning CSS override aligns Tailwind and the editor's Vite dependency on one version, keeping native binaries consistent across platforms.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Orders

Orders uses Shopify-inspired status views, compact search/payment/date filters,
URL-backed pagination and a details drawer. The drawer shows immutable purchased
items, totals, customer/address information and an internal action timeline.
Internal admins can confirm, dispatch, deliver, cancel before dispatch and record
cash collection separately after delivery. The current backend only supports COD
in Kuwait with a KWD 2 delivery fee. Orders is hidden from store admins.
Select up to 50 rows on the current page to apply any of those actions in bulk.
Changing filters/pages clears selection. Batch results list individual failures
and retain failed rows for review. Staff can post private notes in the timeline;
these never appear in the customer app or generate notifications.

Layout/feature references:
- https://help.shopify.com/en/manual/fulfillment/managing-orders/viewing-orders
- https://help.shopify.com/en/manual/fulfillment/managing-orders/managing-order-details
