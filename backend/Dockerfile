FROM tiangolo/uvicorn-gunicorn-fastapi:python3.9

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

ENV ENVIRONMENT=production

CMD ["sh", "-c", "echo ENVIRONMENT is: $ENVIRONMENT && if [ \"$ENVIRONMENT\" = \"development\" ] ; then echo 'Starting Uvicorn with SSL...' && uvicorn main:app --reload --host 0.0.0.0 --port ${PORT:-8000} --ssl-keyfile /app/certs/0.0.0.0-key.pem --ssl-certfile /app/certs/0.0.0.0.pem; else echo 'Starting Gunicorn in Production...' && gunicorn -k uvicorn.workers.UvicornWorker -w 4 -b 0.0.0.0:${PORT:-8000} main:app; fi"]