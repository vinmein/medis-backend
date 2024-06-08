# Set nginx base image
FROM node:20

LABEL maintainer="Higglerslab"

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

RUN npm install --only=production

RUN npm run build

EXPOSE 3000

# Command to run your app
CMD ["npm", "start"]
