FROM public.ecr.aws/docker/library/node:22-alpine AS build

WORKDIR /var/task
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_RSVP_WHATSAPP_NUMBER
ENV VITE_RSVP_WHATSAPP_NUMBER=${VITE_RSVP_WHATSAPP_NUMBER}
RUN npm run build

FROM public.ecr.aws/docker/library/node:22-alpine

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:1.1.0 /lambda-adapter /opt/extensions/lambda-adapter

WORKDIR /var/task
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /var/task/.output ./.output

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
