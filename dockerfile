FROM node:10-alpine AS BUILD_IMAGE

# couchbase sdk requirements
RUN apk update && apk add curl bash python g++ make && rm -rf /var/cache/apk/*
# install node-prune (https://github.com/tj/node-prune)
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin


WORKDIR /apps/metis
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build

# remove development dependencies
RUN npm prune --production

# run node prune
RUN /usr/local/bin/node-prune

# remove unused dependencies
RUN rm -rf node_modules/rxjs
RUN rm -rf node_modules/swagger-ui-dist
RUN rm -rf node_modules/couchbase


FROM node:10-alpine

WORKDIR /apps/metis

# copy from build image
COPY --from=BUILD_IMAGE /apps/metis/ .

RUN npm install pm2 -g

EXPOSE 4000

# Patch for using ps in DO container
RUN sed -i 's/pidusage(pids, function retPidUsage(err, statistics) {/pidusage(pids, { usePs: true }, function retPidUsage(err, statistics) {/' /usr/local/lib/node_modules/pm2/lib/God/ActionMethods.js

RUN apk --no-cache add procps

CMD npm start
