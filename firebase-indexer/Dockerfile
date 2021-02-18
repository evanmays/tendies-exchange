FROM ubuntu:18.04

RUN apt-get update
RUN apt-get -qq update

RUN apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_15.x | bash -
RUN apt-get install -y nodejs 
RUN apt-get install -y build-essential
RUN apt-get install -y libudev-dev libusb-1.0-0-dev jq yarn
RUN apt-get install -y libusb-1.0-0 libusb-1.0-0-dev
RUN export CXX=g++
RUN apt-get install g++ gcc make 
RUN apt-get autoremove
#RUN update-alternatives --install /usr/bin/node node /usr/bin/nodejs 10
RUN apt-get install -y git

# firebase-indexer stuff
COPY . ./
RUN npm install
ENTRYPOINT ["/bin/bash", "run.sh"]
