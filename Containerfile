# https://bun.sh/guides/ecosystem/docker

FROM oven/bun:latest AS base
WORKDIR /app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
ENV DATABASE_URL=files:../db.sqlite
RUN bunx prisma generate
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=prerelease /app/build ./build
COPY --from=prerelease /app/node_modules ./node_modules
COPY --from=prerelease /app/package.json ./package.json
COPY --from=prerelease /app/prisma ./prisma

USER bun
VOLUME /app/store
EXPOSE 3000/tcp
ENV DATABASE_URL=file:/app/store/db.sqlite
CMD [ "sh", "-c", "bunx prisma migrate deploy && bun --bun ./build"]