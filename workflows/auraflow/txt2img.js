"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var zod_1 = require("zod");
var config_1 = require("../../src/config");
var checkpoint = config_1.default.models.checkpoints.enum.optional();
if (config_1.default.warmupCkpt) {
    checkpoint = checkpoint.default(config_1.default.warmupCkpt);
}
var RequestSchema = zod_1.z.object({
    prompt: zod_1.z.string().describe("The positive prompt for image generation"),
    negative_prompt: zod_1.z.string().describe("Negative prompt"),
    width: zod_1.z
        .number()
        .int()
        .min(256)
        .max(2048)
        .optional()
        .default(1024)
        .describe("Width of the generated image"),
    height: zod_1.z
        .number()
        .int()
        .min(256)
        .max(2048)
        .optional()
        .default(1024)
        .describe("Height of the generated image"),
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
        .default(1)
        .describe("Denoising strength"),
    checkpoint: checkpoint,
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
                    "5",
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
        "5": {
            "inputs": {
                "width": input.width,
                "height": input.height,
                "batch_size": 1
            },
            "class_type": "EmptyLatentImage",
            "_meta": {
                "title": "Empty Latent Image"
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
        }
    };
}
var workflow = {
    RequestSchema: RequestSchema,
    generateWorkflow: generateWorkflow,
};
exports.default = workflow;
