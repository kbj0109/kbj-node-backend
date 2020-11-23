FROM node:12.16.0

WORKDIR /app

RUN npm install -g pm2
RUN git clone https://github.com/vishnubob/wait-for-it.git

COPY ./package*.json /app/
RUN npm install --silent 
COPY . /app

EXPOSE 80
CMD ["sh", "-c", "./wait-for-it/wait-for-it.sh mysql:3306 -t 0 && node src/database/init && npm run db:migrate && pm2-runtime index.js"]
