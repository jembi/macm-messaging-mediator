FROM node:10.15.3-alpine
RUN mkdir /code
WORKDIR /code
COPY package*.json /code/
RUN npm install
EXPOSE 3000
COPY . /code/
