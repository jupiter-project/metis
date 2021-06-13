FROM node:current-alpine
WORKDIR /apps/metis
COPY package*.json ./
RUN npm install
COPY . .
RUN npm install
EXPOSE 4000
# Docker-compose code can replace the following command
CMD ["npm", "start"]
