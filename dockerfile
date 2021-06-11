FROM node:14.17
WORKDIR /apps/metis
COPY package*.json ./
RUN npm install
COPY . .
RUN npm install -g concurrently nodemon webpack jest plop
EXPOSE 4000
CMD ["npm", "start"]
