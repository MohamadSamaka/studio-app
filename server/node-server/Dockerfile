FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install necessary packages including mysql-client and netcat
RUN apt-get update && \
    apt-get install -y netcat-openbsd default-mysql-client && \
    rm -rf /var/lib/apt/lists/*

# Install app dependencies
COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn install

# Install nodemon for development (optional)
RUN yarn add nodemon

# Copy app source code
COPY . .

# Copy the entrypoint script
COPY entrypoint.sh /usr/src/app/entrypoint.sh

# Ensure the entrypoint script is executable
RUN chmod +x /usr/src/app/entrypoint.sh

# Expose the port the app runs on
EXPOSE 3000

# Define the entrypoint
ENTRYPOINT ["/bin/sh","./entrypoint.sh"]

# Start the app
CMD ["npm", "run", "start"]

# Ready command to keep container running for testing instead of running npm
# CMD ["tail", "-f", "/dev/null"]
