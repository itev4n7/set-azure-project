FROM node:18.18.0-alpine

WORKDIR /set-azure-project

COPY yarn.lock package.json ./

RUN yarn install --production

COPY . ./

RUN yarn build

EXPOSE 3000

CMD ["yarn","start"]