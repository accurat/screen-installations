FROM python:3.7
LABEL mantainer="l.d.mattiazzi@gmail.com"

RUN mkdir /app
COPY ./*.py /app/.
COPY requirements.txt /app/.
COPY .env /app/.env

WORKDIR /app

RUN pip install -r requirements.txt
EXPOSE 5000

ENTRYPOINT ["python"]
CMD ["index.py"]
