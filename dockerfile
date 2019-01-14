FROM node:9
WORKDIR /apps/metis
COPY package*.json ./
RUN npm install
RUN npm install -g socket.io
COPY . .
EXPOSE 4000
CMD ["npm", "start"]