# Welcome to your Lovable project

## AWS production deployment

The `.github/workflows/deploy-aws.yml` workflow deploys this Node SSR app to AWS Lambda and updates the customer CloudFront origin after a successful health check. Push to `main` to deploy; the first successful run creates the Lambda function and Function URL automatically. Runtime settings are read from the encrypted `/rsvp/prod/customer-env` parameter in AWS Systems Manager (`eu-west-1`). GitHub authenticates to AWS with its repository-restricted OIDC role; no AWS access keys or runtime secrets belong in GitHub.

The WhatsApp contact number defaults to RSVP DXB's UAE number. Set the repository Actions variable `VITE_RSVP_WHATSAPP_NUMBER` if it changes.

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

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Member email delivery

Application receipt, admin application notifications, and application decision emails are sent from the server through Amazon SES. Set `RSVP_ADMIN_EMAIL=vinitahirani@rsvpdxb.com` to choose the admin notification recipient (this is the default).
Configure `AWS_REGION=eu-north-1`, `SES_FROM_EMAIL=vinitahirani@rsvpdxb.com`,
`RSVP_PASSWORD_RESET_FROM=RSVP DXB <noreply@rsvpdxb.com>`, and `PUBLIC_SITE_URL` in the app's
hosting environment. Both sender addresses must belong to a verified SES identity. Give the app
runtime an IAM role or dedicated IAM credentials with `ses:SendEmail` access to that identity;
do not use root-account credentials or expose AWS credentials through `VITE_*` variables.

SES must have production access enabled in the same region before it can send to unverified
customer addresses. While the account remains in the sandbox, verify each recipient in SES for
testing. A successful SES API response confirms acceptance by SES, not final inbox delivery.

Applicants can separately opt in to a WhatsApp welcome message on the registration form. To enable
delivery, configure `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
`WHATSAPP_GRAPH_API_VERSION`, `WHATSAPP_WELCOME_TEMPLATE_NAME`, and
`WHATSAPP_TEMPLATE_LANGUAGE` in the customer runtime environment. Meta requires the welcome
template to be approved before it can send business-initiated messages; configure its body with a
single text parameter for the applicant's name. Run `npm run db:migrate` to store opt-in and
timestamp data. UAE mobile numbers entered locally are normalized to `+971`; other international
numbers must include their country code.

Member password reset links are sent only to approved members already in the database. Reset
tokens are stored as hashes, expire after 30 minutes, work once, and revoke existing member
sessions after a successful reset. Apply the database migration with `npm run db:migrate` before
deploying this feature.
