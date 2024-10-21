# https://bun.sh/guides/ecosystem/docker

FROM oven/bun:alpine
WORKDIR /app

COPY package.json package.json
RUN bun install

COPY . .
RUN bun run build

RUN bunx prisma generate

EXPOSE 3000
ENTRYPOINT ["bun", "./build"]