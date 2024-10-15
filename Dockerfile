FROM ubuntu:oracular

COPY ./bin/comfyui-api .

VOLUME [ \
    "/models", \
    "/output", \
    "/input", \
    "/workflows" \
    ]

ENV OUTPUT_DIR="/output"
ENV INPUT_DIR="/input"
ENV MODEL_DIR="/models"
ENV WORKFLOW_DIR="/workflows"

RUN chmod +x comfyui-api

CMD ["./comfyui-api"]