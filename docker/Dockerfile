FROM node:carbon

# Create App Directory
WORKDIR /usr/src/Pricing-service

COPY . .

RUN npm install

EXPOSE 8080

CMD [ "npm", "start" ]


