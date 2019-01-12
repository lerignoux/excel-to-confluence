from python:3.7-alpine
MAINTAINER Erignoux Laurent <lerignoux@gmail.com>

RUN mkdir /app

COPY . /app
RUN pip install -r /app/requirements.txt
