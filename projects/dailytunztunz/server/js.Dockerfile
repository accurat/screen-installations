FROM node:12
LABEL mantainer="l.d.mattiazzi@gmail.com"
RUN mkdir /app
COPY streamer.js /app/.
WORKDIR /app