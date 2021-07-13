FROM node:alpine
WORKDIR /usr/bin/clash-operator
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install \
    && npm install ts-node
COPY src/ ./src
COPY *.ts ./
RUN npx tsc
VOLUME [ "/etc/clash-operator", "/etc/clash"]
CMD [ "npx", "ts-node", "./src/index.ts", "-c", "/etc/clash-operator/config.yaml" ]