FROM node:current-alpine
WORKDIR /apps/metis
COPY package*.json ./
# How do we run `RUN npm install --production` for the production image?
RUN npm install
COPY . .
RUN npm install -g npx
EXPOSE 4000
# Docker-compose code can replace the following command
CMD ["npm", "start"]
