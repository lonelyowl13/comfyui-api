"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var zod_1 = require("zod");
var config_1 = require("../../src/config");
var RequestSchema = zod_1.z.object({
    prompt: zod_1.z.string().describe("The positive prompt for image generation"),
    negative_prompt: zod_1.z.string().describe("The negative prompt for image generation"),
    seed: zod_1.z
        .number()
        .int()
        .optional()
        .default(function () { return Math.floor(Math.random() * 1000000000000000); })
        .describe("Seed for random number generation"),
    steps: zod_1.z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .default(4)
        .describe("Number of sampling steps"),
    cfg_scale: zod_1.z
        .number()
        .min(0)
        .max(20)
        .optional()
        .default(1)
        .describe("Classifier-free guidance scale"),
    sampler_name: config_1.default.samplers
        .optional()
        .default("euler")
        .describe("Name of the sampler to use"),
    scheduler: config_1.default.schedulers
        .optional()
        .default("simple")
        .describe("Type of scheduler to use"),
    denoise: zod_1.z
        .number()
        .min(0)
        .max(1)
        .optional()
        .default(0.8)
        .describe("Denoising strength"),
    checkpoint: zod_1.z.string().describe("Checkpoint name"),
    image: zod_1.z.string().describe("Input image for img2img"),
});
function generateWorkflow(input) {
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
}
;
var workflow = {
    RequestSchema: RequestSchema,
    generateWorkflow: generateWorkflow,
    summary: "Image-to-Image",
    description: "Text-guided Image-to-Image generation",
};
exports.default = workflow;
