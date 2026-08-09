# Build and run the SvelteKit node server. Two stages so the runtime image carries no
# toolchain and no dev dependencies.
FROM docker.io/library/node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

FROM docker.io/library/node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# scripts/ and src/lib/password.ts come along: the entrypoint applies schema.sql and ensures
# the admin account before the server starts
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./
COPY --from=build /app/schema.sql ./
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/src/lib/password.ts ./src/lib/password.ts
COPY docker-entrypoint.sh /usr/local/bin/

USER node
EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "build"]
