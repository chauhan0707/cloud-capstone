# Usage:
#   docker run -it --rm -v ${PWD}:/app -p 3000:3000 "$USER/$(basename $PWD)"
FROM node:12

# set working directory
WORKDIR /app

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent
RUN npm install -g --silent \
    typescript \
    react-scripts

# add app
COPY . ./

EXPOSE 3000
# start app
CMD ["npm", "start"]
