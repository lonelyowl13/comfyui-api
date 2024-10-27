import { z } from "zod";
import { ComfyNode, Workflow } from "../../src/types";
import config from "../../src/config";

const RequestSchema = z.object({
    prompt: z.string().describe("The positive prompt for image generation"),
    negative_prompt: z.string().describe("The negative prompt for image generation"),
    seed: z
      .number()
      .int()
      .optional()
      .default(() => Math.floor(Math.random() * 1000000000000000))
      .describe("Seed for random number generation"),
    steps: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .default(4)
      .describe("Number of sampling steps"),
    cfg_scale: z
      .number()
      .min(0)
      .max(20)
      .optional()
      .default(1)
      .describe("Classifier-free guidance scale"),
    sampler_name: config.samplers
      .optional()
      .default("euler")
      .describe("Name of the sampler to use"),
    scheduler: config.schedulers
      .optional()
      .default("simple")
      .describe("Type of scheduler to use"),
    denoise: z
      .number()
      .min(0)
      .max(1)
      .optional()
      .default(0.8)
      .describe("Denoising strength"),
    checkpoint: z.string().describe("Checkpoint name"),
    image: z.string().describe("Input image for img2img"),
  });


type InputType = z.infer<typeof RequestSchema>;

function generateWorkflow(input: InputType): Record<string, ComfyNode> {
  return {
    "3": {
      "inputs": {
        "seed": input.seed,
        "steps": input.steps,
        "cfg": input.cfg_scale,
        "sampler_name": input.sampler_name,
        "scheduler": input.scheduler,
        "denoise": input.denoise,
        "model": [
          "4",
          0
        ],
        "positive": [
          "6",
          0
        ],
        "negative": [
          "7",
          0
        ],
        "latent_image": [
          "12",
          0
        ]
      },
      "class_type": "KSampler",
      "_meta": {
        "title": "KSampler"
      }
    },
    "4": {
      "inputs": {
        "ckpt_name": input.checkpoint
      },
      "class_type": "CheckpointLoaderSimple",
      "_meta": {
        "title": "Load Checkpoint"
      }
    },
    "6": {
      "inputs": {
        "text": input.prompt,
        "clip": [
          "4",
          1
        ]
      },
      "class_type": "CLIPTextEncode",
      "_meta": {
        "title": "CLIP Text Encode (Prompt)"
      }
    },
    "7": {
      "inputs": {
        "text": input.negative_prompt,
        "clip": [
          "4",
          1
        ]
      },
      "class_type": "CLIPTextEncode",
      "_meta": {
        "title": "CLIP Text Encode (Prompt)"
      }
    },
    "8": {
      "inputs": {
        "samples": [
          "3",
          0
        ],
        "vae": [
          "4",
          2
        ]
      },
      "class_type": "VAEDecode",
      "_meta": {
        "title": "VAE Decode"
      }
    },
    "9": {
      "inputs": {
        "filename_prefix": "ComfyUI",
        "images": [
          "8",
          0
        ]
      },
      "class_type": "SaveImage",
      "_meta": {
        "title": "Save Image"
      }
    },
    "10": {
      "inputs": {
        "image": input.image,
        "upload": "image"
      },
      "class_type": "LoadImage",
      "_meta": {
        "title": "Load Image"
      }
    },
    "12": {
      "inputs": {
        "pixels": [
          "10",
          0
        ],
        "vae": [
          "4",
          2
        ]
      },
      "class_type": "VAEEncode",
      "_meta": {
        "title": "VAE Encode"
      }
    }
  };
};


const workflow: Workflow = {
  RequestSchema,
  generateWorkflow,
  summary: "Image-to-Image",
  description: "Text-guided Image-to-Image generation",
};

export default workflow;