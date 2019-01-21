FROM python:3.7-alpine
MAINTAINER Erignoux Laurent "lerignoux@gmail.com"

COPY ./requirements.txt /app/requirements.txt
WORKDIR /app

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

ENTRYPOINT ["python"]
CMD ["app.py"]
