FROM node:22-alpine as build

ARG REACT_APP_BACKEND_URL
ARG REACT_APP_TINYMCE_API_KEY
ARG REACT_APP_ENV

ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}
ENV REACT_APP_TINYMCE_API_KEY=${REACT_APP_TINYMCE_API_KEY}
ENV REACT_APP_ENV=${REACT_APP_ENV}

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm ls @types/dompurify || (echo "@types/dompurify not found" && exit 1)

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]