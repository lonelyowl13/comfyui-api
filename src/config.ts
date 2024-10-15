import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
const {
  HOST = "::",
  PORT = "3000",
  DIRECT_ADDRESS = "127.0.0.1",
  COMFYUI_PORT_HOST = "8188",
  STARTUP_CHECK_INTERVAL_S = "1",
  STARTUP_CHECK_MAX_TRIES = "10",
  OUTPUT_DIR = "/output",
  INPUT_DIR = "/input",
  MODEL_DIR = "/models",
  WARMUP_PROMPT_FILE,
  WORKFLOW_MODELS = "all",
  WORKFLOW_DIR = "/workflows",
  MARKDOWN_SCHEMA_DESCRIPTIONS = "true",
} = process.env;


const SAMPLERS: string[] = (process.env.SAMPLERS && JSON.parse(process.env.SAMPLERS)) ?? [
  "euler", 
  "euler_cfg_pp", 
  "euler_ancestral", 
  "euler_ancestral_cfg_pp", 
  "heun", 
  "heunpp2", 
  "dpm_2", 
  "dpm_2_ancestral", 
  "lms", 
  "dpm_fast", 
  "dpm_adaptive", 
  "dpmpp_2s_ancestral", 
  "dpmpp_2s_ancestral_cfg_pp", 
  "dpmpp_sde", 
  "dpmpp_sde_gpu", 
  "dpmpp_2m", 
  "dpmpp_2m_cfg_pp", 
  "dpmpp_2m_sde", 
  "dpmpp_2m_sde_gpu", 
  "dpmpp_3m_sde", 
  "dpmpp_3m_sde_gpu", 
  "ddpm", 
  "lcm", 
  "ipndm", 
  "ipndm_v", 
  "deis", 
  "ddim", 
  "uni_pc", 
  "uni_pc_bh2",
];

const SCHEDULERS: string[] = (process.env.SCHEDULERS && JSON.parse(process.env.SCHEDULERS)) ?? [
  "normal", 
  "karras", 
  "exponential", 
  "sgm_uniform", 
  "simple", 
  "ddim_uniform", 
  "beta",
];


fs.mkdirSync(WORKFLOW_DIR, { recursive: true });

const comfyURL = `http://${DIRECT_ADDRESS}:${COMFYUI_PORT_HOST}`;
const selfURL = `http://localhost:${PORT}`;
const port = parseInt(PORT, 10);
const startupCheckInterval = parseInt(STARTUP_CHECK_INTERVAL_S, 10) * 1000;
const startupCheckMaxTries = parseInt(STARTUP_CHECK_MAX_TRIES, 10);


let warmupPrompt: any | undefined;
let warmupCkpt: string | undefined;
if (WARMUP_PROMPT_FILE) {
  assert(fs.existsSync(WARMUP_PROMPT_FILE), "Warmup prompt file not found");
  try {
    warmupPrompt = JSON.parse(
      fs.readFileSync(WARMUP_PROMPT_FILE, { encoding: "utf-8" })
    );
    for (const nodeId in warmupPrompt) {
      const node = warmupPrompt[nodeId];
      if (node.class_type === "CheckpointLoaderSimple") {
        warmupCkpt = node.inputs.ckpt_name;
        break;
      }
    }
  } catch (e: any) {
    throw new Error(`Failed to parse warmup prompt: ${e.message}`);
  }
}

const config = {
  wrapperHost: HOST,
  wrapperPort: port,
  selfURL,
  comfyHost: DIRECT_ADDRESS,
  comfyPort: COMFYUI_PORT_HOST,
  comfyURL,
  startupCheckInterval,
  startupCheckMaxTries,
  outputDir: OUTPUT_DIR,
  inputDir: INPUT_DIR,
  workflowDir: WORKFLOW_DIR,
  warmupPrompt,
  warmupCkpt,
  samplers: z.enum(SAMPLERS as [string, ...string[]]),
  schedulers: z.enum(SCHEDULERS as [string, ...string[]]),
  models: {} as Record<
    string,
    {
      dir: string;
      all: string[];
      enum: z.ZodEnum<[string, ...string[]]>;
    }
  >,
  workflowModels: WORKFLOW_MODELS,
  markdownSchemaDescriptions: MARKDOWN_SCHEMA_DESCRIPTIONS === "true",
};

const model_dirs = fs.readdirSync(MODEL_DIR);
for (const model_dir of model_dirs) {
  const model_path = path.join(MODEL_DIR, model_dir);
  if (fs.statSync(model_path).isDirectory()) {
    const all = fs
      .readdirSync(model_path)
      .filter((f) => !(f.startsWith("put_") && f.endsWith("_here")));
    config.models[model_dir] = {
      dir: model_path,
      all,
      enum: z.enum(all as [string, ...string[]]),
    };
  }
}

export default config;
