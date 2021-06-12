FROM node:14.17
WORKDIR /apps/metis
COPY package*.json ./
RUN npm install
COPY . .
RUN npm install
EXPOSE 4000
CMD ["npm", "start"]
