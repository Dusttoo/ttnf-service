# Stage 1: Build the React app
FROM node:22-alpine as build
ARG REACT_APP_BACKEND_URL
ARG REACT_APP_TINYMCE_API_KEY
ARG NODE_ENV
ARG REACT_APP_ENV

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]