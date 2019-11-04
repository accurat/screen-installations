FROM ubuntu:18.04
LABEL mantainer="l.d.mattiazzi@gmail.com"

RUN apt update
RUN apt install -y software-properties-common

# Install node
RUN apt install -y  curl
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt install -y nodejs

# Install Python
RUN add-apt-repository -y ppa:deadsnakes/ppa
RUN apt install -y python3.7
RUN apt install -y python3-pip

# Install Nginx
RUN apt install -y nginx

# Install pm2
RUN npm install -g pm2

RUN mkdir /app
COPY ./*.py /app/
COPY requirements.txt /app/.
COPY .env /app/.env
COPY streamer.js /app/.

WORKDIR /app

RUN pip3 install -r requirements.txt

RUN pm2-runtime index.py --interpreter python3
RUN pm2-runtime streamer.js

COPY ./default.conf /etc/nginx/sites-available/default
RUN mkdir -p /run/nginx
CMD ["nginx", "-g", "daemon off;"]