FROM node:10

COPY ./ /src/app

WORKDIR /src/app

RUN npm install --production
RUN npm run build

CMD npm start