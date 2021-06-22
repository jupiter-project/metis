FROM node:14.17
WORKDIR /apps/metis
COPY package*.json ./
# How do we run `RUN npm install --production` for the production image?
RUN npm install
COPY . .
EXPOSE 4000
# Docker-compose code can replace the following command
CMD ["npm", "start"]
