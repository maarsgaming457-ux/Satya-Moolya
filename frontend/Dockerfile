# Use the official Node.js runtime
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Next.js app
RUN npm run build

# Expose Cloud Run port
EXPOSE 8080

ENV PORT=8080

# Start Next.js on Cloud Run port
CMD ["npm", "start", "--", "-p", "8080"]