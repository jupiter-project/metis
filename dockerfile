FROM node:9
EXPOSE 4000
WORKDIR /apps/metis
ADD package.json /apps/metis
RUN npm install
COPY . .
CMD ["npm", "start"]