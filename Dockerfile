# Set nginx base image
FROM node:18

LABEL maintainer="Higglerslab"

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

RUN npm install --only=production
RUN npx husky install

RUN npm run build

EXPOSE 3000

# Command to run your app
CMD ["npm", "start"]
