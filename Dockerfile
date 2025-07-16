FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ libc6-compat pkgconfig cairo-dev pango-dev giflib-dev libpng-dev pixman-dev

COPY package*.json ./

RUN npm install --production

COPY . .

CMD ["node", "bot.js"]
