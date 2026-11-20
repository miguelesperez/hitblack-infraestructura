FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV PORT=3004
EXPOSE 3004
CMD ["node", "server.js"]
