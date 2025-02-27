FROM node:alpine AS build

WORKDIR /usr/src/app

RUN npm install -g @angular/cli

COPY . /usr/src/app

RUN npm install

RUN npm run build --prod

FROM nginx:latest AS ngi

COPY --from=build /usr/src/app/dist/mtg-trader/browser /usr/share/nginx/html
COPY /nginx/ssl/  /etc/nginx/
COPY /nginx/nginx.conf  /etc/nginx/conf.d/default.conf

EXPOSE 443

