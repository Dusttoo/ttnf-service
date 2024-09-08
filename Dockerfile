# Stage 1: Build the React app
FROM node:14-alpine as build
WORKDIR /app
COPY ./frontend/package.json ./frontend/package-lock.json ./
RUN npm install
COPY ./frontend ./
RUN npm run build

# Stage 2: Serve the React app using Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Stage 3: Setup the backend with FastAPI
FROM tiangolo/uvicorn-gunicorn-fastapi:python3.9
WORKDIR /app
COPY ./backend /app/backend
RUN pip install --no-cache-dir -r backend/requirements.txt
EXPOSE 8000
ENV NAME World
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
