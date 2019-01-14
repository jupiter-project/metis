FROM node:9
EXPOSE 4000
WORKDIR /apps/metis
ADD package.json
ADD package-lock.json
RUN npm install
RUN npm install -g socket.io
COPY . .
CMD ["npm", "start"]