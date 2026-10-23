# UX Collective — backend/Dockerfile
# Author: Md Shahed
# Date: 2026-10-23

FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 5000

# Start Node with auto-restart on code edits
CMD ["npm", "run", "dev"]
