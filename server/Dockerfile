FROM node:20-alpine

WORKDIR /app

# Install dependencies first for efficient layer caching
COPY package.json ./
RUN npm install --production

# Copy application source
COPY . .

EXPOSE 5000

CMD ["npm", "start"]
