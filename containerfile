# https://bun.sh/guides/ecosystem/docker

FROM oven/bun:distroless
WORKDIR /app

COPY project/package.json package.json
RUN bun install

COPY project/ .
RUN bun run build

EXPOSE 3000
ENTRYPOINT ["bun", "./build"]