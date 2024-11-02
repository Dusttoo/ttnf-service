# Stage 1: Build the React app
FROM node:22-alpine as build

# Declare build arguments
ARG REACT_APP_BACKEND_URL
ARG REACT_APP_TINYMCE_API_KEY
ARG NODE_ENV
ARG REACT_APP_ENV

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Explicitly pass the variables to the npm run build command
RUN npm run build --build-arg REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL --build-arg REACT_APP_TINYMCE_API_KEY=$REACT_APP_TINYMCE_API_KEY --build-arg NODE_ENV=$NODE_ENV --build-arg REACT_APP_ENV=$REACT_APP_ENV

# Stage 2: Serve the built app with Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]