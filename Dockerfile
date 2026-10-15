FROM node:22-slim

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app
RUN chown node:node /app
USER node

# --ignore-scripts: skips the ffmpeg/playwright downloads, which only the dev tools/ scripts use.
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY --chown=node:node . .

# NEXT_PUBLIC_* values are baked into the browser bundle at build time, so they are build args.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Prerenders every page from the API, so the backend must be reachable during the build.
RUN npm run build

EXPOSE 3000
CMD ["npm", "start", "--", "-p", "3000"]
