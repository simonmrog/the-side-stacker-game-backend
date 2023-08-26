FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
# RUN npm ci --omit=dev

COPY . .

RUN npm run build

EXPOSE 4200
CMD [ "node", "dist/index.js" ]