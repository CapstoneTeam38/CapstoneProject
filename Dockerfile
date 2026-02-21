# Use official Node image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of project
COPY . .

# Expose your app port
EXPOSE 5000

# Start app
CMD ["npm", "start"]