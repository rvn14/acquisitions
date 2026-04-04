FROM node:24-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]


FROM base AS development
USER root
RUN npm ci && npm cache clean --force
CMD ["npm", "run", "dev"]

FROM base AS production
RUN npm ci --only=production && npm cache clean --force
CMD ["npm", "start"]