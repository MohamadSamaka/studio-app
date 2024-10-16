FROM node:18

# Create app directory
WORKDIR /usr/src/app

RUN apt-get update && \
    apt-get install -y netcat-openbsd && \
    rm -rf /var/lib/apt/lists/*

# Install app dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Install nodemon for development (optional)
RUN npm install -g nodemon

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

#ready command to keep container running for testing instead of running npm
#CMD ["tail", "-f", "/dev/null"]