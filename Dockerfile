FROM ubuntu:oracular

RUN apt-get update && apt-get install -y curl

VOLUME ["/models", "/input", "/output", "/workflows" ]

RUN curl -L "https://github.com/lonelyowl13/comfyui-api/releases/download/1.4.3/comfyui-api" > /comfyui-api

RUN chmod +x comfyui-api

CMD ["./comfyui-api"]