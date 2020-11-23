FROM node:12.16.0

WORKDIR /app

RUN git clone https://github.com/vishnubob/wait-for-it.git

COPY ./package*.json /app/
RUN npm install --silent 
COPY . /app

CMD ["sh", "-c", "./wait-for-it/wait-for-it.sh mysql:3306 -t 0 && npm test"]
