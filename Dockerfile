FROM tomaszdevx/uni-base-image:v1.0.1 AS stage0

ARG NPM_USER=devx
ARG NPM_SCOPE=@bhe
ARG NPM_REGISTRY=https://npm.devx.agency:4873
ARG NPM_EMAIL=office@devx.agency
ARG NPM_PASSWORD

WORKDIR /workspace

RUN npm-cli-login -u $NPM_USER -p $NPM_PASSWORD -e $NPM_EMAIL -r $NPM_REGISTRY -s $NPM_SCOPE

COPY ./ ./

RUN yarn install && yarn build && yarn cache clean && apk del native-deps

FROM node:14-alpine

WORKDIR /workspace

COPY --from=stage0 ./workspace .

EXPOSE 30006
CMD ["yarn", "start:prod"]
