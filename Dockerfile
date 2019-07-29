FROM node:10

WORKDIR /app

COPY src/ ./src/
COPY package*.json tsconfig.json config.json ./

RUN npm ci
RUN npm run build

ENV TOKEN ""
ENV DB_STRING "nedb://nedb-data"

CMD npm start