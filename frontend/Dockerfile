# Stage 1: Build the React app
FROM node:14-alpine as build
ARG REACT_APP_INSTRUMENTATION_KEY
ARG REACT_APP_BACKEND_URL
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

RUN echo "REACT_APP_INSTRUMENTATION_KEY=$REACT_APP_INSTRUMENTATION_KEY"
RUN echo "REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL"

COPY . .
# Build the application
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]