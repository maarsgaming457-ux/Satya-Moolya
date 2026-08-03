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

# Expose the port Cloud Run uses
EXPOSE 8080

# Cloud Run provides the PORT environment variable
ENV PORT=8080

# Start the Next.js server
CMD ["npm", "start"]