FROM node:9
EXPOSE 4000
WORKDIR /apps/metis
COPY package.json /apps/metis
COPY package-lock.json /apps/metis
RUN npm install
RUN npm install -g socket.io
COPY . .
CMD ["npm", "start"]