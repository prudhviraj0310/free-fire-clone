FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
