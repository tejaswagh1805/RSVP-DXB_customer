# Welcome to your Lovable project

## AWS production deployment

The `.github/workflows/deploy-aws.yml` workflow deploys this Node SSR app to AWS Lambda and updates the customer CloudFront origin after a successful health check. Push to `main` to deploy; the first successful run creates the Lambda function and Function URL automatically. Runtime settings are read from the encrypted `/rsvp/prod/customer-env` parameter in AWS Systems Manager (`eu-west-1`). GitHub authenticates to AWS with its repository-restricted OIDC role; no AWS access keys or runtime secrets belong in GitHub.

Set the repository Actions variable `VITE_RSVP_WHATSAPP_NUMBER` if the Infobip sender number changes from the workflow's current default.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

Without `DATABASE_URL`, the development server previews the public pages using
bundled sample events. Sign-in and database submissions require a development
database. Add `DATABASE_URL` to `.env` and restart the server to use live data.
Production always requires a configured database.

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Member email delivery

Application receipt, admin application notifications, and application decision emails are sent from the server through Amazon SES. Set `RSVP_ADMIN_EMAIL=vinitahirani@rsvpdxb.com` to choose the admin notification recipient (this is the default).
Configure `AWS_REGION=eu-north-1` and `SES_FROM_EMAIL=vinitahirani@rsvpdxb.com` in the app's
hosting environment. The sender address must belong to a verified SES identity. Give the app
runtime an IAM role or dedicated IAM credentials with `ses:SendEmail` access to that identity;
do not use root-account credentials or expose AWS credentials through `VITE_*` variables.

SES must have production access enabled in the same region before it can send to unverified
customer addresses. While the account remains in the sandbox, verify each recipient in SES for
testing. A successful SES API response confirms acceptance by SES, not final inbox delivery.
