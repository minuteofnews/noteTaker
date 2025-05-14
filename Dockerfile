FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy everything to /app
COPY . .

# Install dependencies
RUN npm install

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["npm", "run", "dev"]
