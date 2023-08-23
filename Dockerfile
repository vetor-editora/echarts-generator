FROM node:20

# Create the app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

# Copy everything else on the project
COPY . .

# Expose the port we want to use
EXPOSE 5050

# Tell Docker to run server.js on spin up
RUN ["chmod", "+x", "/usr/src/app/start.sh"]
CMD ./start.sh