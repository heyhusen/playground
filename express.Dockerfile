FROM docker.io/library/node:20-bookworm
ADD ./openapi.yaml ./openapi.yaml
ADD ./backend/node /app/node
WORKDIR /app/node
RUN rm -rf node_modules
RUN rm -rf dist
RUN npm install -g pnpm

EXPOSE 3000
CMD ["pnpm", "dev"]
