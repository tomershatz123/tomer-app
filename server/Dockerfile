# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Use --production flag for production, or omit for development
RUN npm ci

# Copy source code
COPY . .

# Expose the port your Express app runs on
EXPOSE 5001

# Start the application
CMD ["npm", "start"]
