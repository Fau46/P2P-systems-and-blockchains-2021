FROM maven:3.8.1-openjdk-15
WORKDIR /ipfs
COPY . .
RUN chmod +x *
CMD ["./compile&run.sh"]