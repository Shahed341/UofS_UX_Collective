FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 5000

# Start Node with auto-restart on code edits
CMD ["npm", "run", "dev"]
