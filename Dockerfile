FROM node:alpine
WORKDIR /usr/bin/clash-operator
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install \
    && npm install ts-node -g
COPY src/ ./src
RUN tsc
VOLUME [ "/etc/clash-operator", "/etc/clash"]
CMD [ "ts-node", "./src/index.ts", "-c", "/etc/clash-operator/config.yaml" ]

