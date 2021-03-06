FROM node:12.13.1   

WORKDIR /usr/src/app
COPY package.json .
RUN npm install    
COPY . .
RUN npm install -g nodemon
CMD [ "npm", "start" ]