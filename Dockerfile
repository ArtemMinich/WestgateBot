FROM node:18-bookworm

ENV TZ=Europe/Kyiv
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

# Не Alpine → стабільна збірка canvas
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    pkg-config \
    python3 \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install --loglevel=info

COPY . .

CMD ["npm", "start"]
