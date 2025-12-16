# Azure DevOps Iteration Manager (Jalali)

A React-based Azure DevOps extension (Hub) that lets teams list, select, add and edit iterations while using the Jalali (Persian) calendar.

This repository contains a sample Azure DevOps extension built with React and TypeScript that integrates with the Azure DevOps SDK and REST APIs to manage team iterations. It includes UI components, dialogs, and services for working with iterations, plus local persistence of selected iteration per team.

## Key Features

- List and pick team iterations from an Azure DevOps project
- Add new iterations and edit iteration date ranges using Jalali (Persian) dates
- Persist selected iteration per team in `localStorage`
- Built as a sample Hub extension using the Azure DevOps SDK and REST clients

## Project Structure (high level)

- `src/Samples/IterationManagerHub` — main hub UI, dialogs, tables, and services
- `src` — other sample components, tests, mocks and types
- `static`, `coverage` — build/test artifacts and static files
- `azure-devops-extension.json` / `azure-devops-extension-dev.json` — extension manifest(s)
- `webpack.config.js`, `tsconfig.json`, `package.json` — build and dev configuration

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Build the project:

```bash
npm run build
```

3. Run the development server (if available):

```bash
npm run start:dev
```

4. Package and publish the extension using the Azure DevOps Extension Tools (tfx) or follow your CI pipeline steps. See the manifest files (`azure-devops-extension.json`) for contribution points and hub configuration.

## Development Notes

- The hub initializes the Azure DevOps SDK via `SDK.init()` and waits for `SDK.ready()` before calling `getPageContext()` to avoid timing issues.
- TypeScript declarations for asset imports (e.g. `.scss`) may require a `declare module '*.scss'` in a `d.ts` file.
- Tests and mocks are included under `src/Tests` and `src/__mocks__`.

## Contributing

Contributions and bug reports are welcome. Open issues or pull requests against this repository. When contributing:

- Run `npm install` and `npm run build` locally
- Add unit tests for new logic where appropriate
- Keep UI/UX consistent with existing components

## Suggested repository name

- `azure-devops-iteration-manager-jalali` (recommended)

## License

See the `LICENSE` file in the repository root.

---

If you want, I can commit this `README.md`, create the GitHub repo named `azure-devops-iteration-manager-jalali` and push the code for you — should I proceed?

## Persian (فارسی)

### معرفی کوتاه

این افزونه (Hub) برای Azure DevOps با React و TypeScript ساخته شده تا تکرارها (Iterations) را با تقویم جلالی مدیریت کنید؛ می‌توانید تکرارها را ببینید، انتخاب کنید، اضافه کنید و تاریخ‌هایشان را ویرایش کنید.

### قابلیت‌ها

- نمایش و انتخاب تکرارهای تیم در پروژه Azure DevOps
- افزودن تکرار جدید و ویرایش تاریخ‌های شروع/پایان با تقویم جلالی
- ذخیره‌سازی تکرار انتخاب‌شده برای هر تیم در `localStorage`
- یک افزونه Hub بر پایه Azure DevOps SDK و REST API

### شروع سریع

1. نصب پیش‌نیازها:

```bash
npm install
```

2. ساخت نسخه نهایی:

```bash
npm run build
```

3. اجرای سرور توسعه (برای دیباگ محلی):

```bash
npm run start:dev
```

- در حالت توسعه، `azure-devops-extension-dev.json` روی `https://localhost:3000` تنظیم شده است.

4. بسته‌بندی و انتشار:

- با `tfx extension publish` و مانیفست‌های `azure-devops-extension*.json` یا از پایپ‌لاین CI خود استفاده کنید.

### نکات توسعه

- قبل از صدا زدن `getPageContext()` حتماً `SDK.init()` و `SDK.ready()` را فراخوانی کنید تا مشکل زمان‌بندی نداشته باشید.
- برای ایمپورت فایل‌های `.scss` در TypeScript، در یک فایل `d.ts` بنویسید:

```ts
declare module '*.scss';
```

---
