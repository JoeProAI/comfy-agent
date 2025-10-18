/**
 * ComfyUI Workflow Templates
 * 
 * Pre-built workflow templates for common use cases.
 * These serve as starting points for users and examples for the AI.
 */

export interface WorkflowTemplate {
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  workflow: any;
}

/**
 * Basic Text-to-Image workflow template
 */
export const TEXT_TO_IMAGE_BASIC: WorkflowTemplate = {
  name: 'Text to Image (Basic)',
  description: 'Simple text-to-image generation using SDXL',
  category: 'Image Generation',
  difficulty: 'beginner',
  workflow: {
    nodes: {
      "1": {
        class_type: "CheckpointLoaderSimple",
        inputs: {
          ckpt_name: "sd_xl_base_1.0.safetensors"
        }
      },
      "2": {
        class_type: "CLIPTextEncode",
        inputs: {
          text: "beautiful landscape, mountains, sunset, highly detailed",
          clip: ["1", 1]
        }
      },
      "3": {
        class_type: "CLIPTextEncode",
        inputs: {
          text: "blurry, low quality, distorted",
          clip: ["1", 1]
        }
      },
      "4": {
        class_type: "EmptyLatentImage",
        inputs: {
          width: 1024,
          height: 1024,
          batch_size: 1
        }
      },
      "5": {
        class_type: "KSampler",
        inputs: {
          seed: Math.floor(Math.random() * 1000000000),
          steps: 30,
          cfg: 8.0,
          sampler_name: "euler",
          scheduler: "normal",
          denoise: 1.0,
          model: ["1", 0],
          positive: ["2", 0],
          negative: ["3", 0],
          latent_image: ["4", 0]
        }
      },
      "6": {
        class_type: "VAEDecode",
        inputs: {
          samples: ["5", 0],
          vae: ["1", 2]
        }
      },
      "7": {
        class_type: "SaveImage",
        inputs: {
          images: ["6", 0],
          filename_prefix: "ComfyUI"
        }
      }
    }
  }
};

/**
 * Advanced workflow with ControlNet
 */
export const CONTROLNET_WORKFLOW: WorkflowTemplate = {
  name: 'ControlNet Guided Generation',
  description: 'Image generation with ControlNet guidance for precise control',
  category: 'Advanced Generation',
  difficulty: 'intermediate',
  workflow: {
    nodes: {
      "1": {
        class_type: "CheckpointLoaderSimple",
        inputs: {
          ckpt_name: "sd_xl_base_1.0.safetensors"
        }
      },
      "2": {
        class_type: "ControlNetLoader",
        inputs: {
          control_net_name: "control_v11p_sd15_canny.pth"
        }
      },
      "3": {
        class_type: "LoadImage",
        inputs: {
          image: "input_image.png"
        }
      },
      "4": {
        class_type: "CannyEdgePreprocessor",
        inputs: {
          image: ["3", 0],
          low_threshold: 100,
          high_threshold: 200
        }
      },
      "5": {
        class_type: "ControlNetApply",
        inputs: {
          conditioning: ["6", 0],
          control_net: ["2", 0],
          image: ["4", 0],
          strength: 1.0
        }
      },
      "6": {
        class_type: "CLIPTextEncode",
        inputs: {
          text: "professional photograph, high quality",
          clip: ["1", 1]
        }
      },
      "7": {
        class_type: "CLIPTextEncode",
        inputs: {
          text: "low quality, blurry",
          clip: ["1", 1]
        }
      },
      "8": {
        class_type: "EmptyLatentImage",
        inputs: {
          width: 1024,
          height: 1024,
          batch_size: 1
        }
      },
      "9": {
        class_type: "KSampler",
        inputs: {
          seed: Math.floor(Math.random() * 1000000000),
          steps: 30,
          cfg: 8.0,
          sampler_name: "euler",
          scheduler: "normal",
          denoise: 1.0,
          model: ["1", 0],
          positive: ["5", 0],
          negative: ["7", 0],
          latent_image: ["8", 0]
        }
      },
      "10": {
        class_type: "VAEDecode",
        inputs: {
          samples: ["9", 0],
          vae: ["1", 2]
        }
      },
      "11": {
        class_type: "SaveImage",
        inputs: {
          images: ["10", 0],
          filename_prefix: "ControlNet"
        }
      }
    }
  }
};

/**
 * Image-to-Image workflow
 */
export const IMAGE_TO_IMAGE: WorkflowTemplate = {
  name: 'Image to Image',
  description: 'Transform existing images with AI',
  category: 'Image Editing',
  difficulty: 'beginner',
  workflow: {
    nodes: {
      "1": {
        class_type: "CheckpointLoaderSimple",
        inputs: {
          ckpt_name: "sd_xl_base_1.0.safetensors"
        }
      },
      "2": {
        class_type: "LoadImage",
        inputs: {
          image: "input.png"
        }
      },
      "3": {
        class_type: "VAEEncode",
        inputs: {
          pixels: ["2", 0],
          vae: ["1", 2]
        }
      },
      "4": {
        class_type: "CLIPTextEncode",
        inputs: {
          text: "enhanced, improved, professional",
          clip: ["1", 1]
        }
      },
      "5": {
        class_type: "CLIPTextEncode",
        inputs: {
          text: "low quality, artifacts",
          clip: ["1", 1]
        }
      },
      "6": {
        class_type: "KSampler",
        inputs: {
          seed: Math.floor(Math.random() * 1000000000),
          steps: 25,
          cfg: 7.5,
          sampler_name: "euler",
          scheduler: "normal",
          denoise: 0.75,
          model: ["1", 0],
          positive: ["4", 0],
          negative: ["5", 0],
          latent_image: ["3", 0]
        }
      },
      "7": {
        class_type: "VAEDecode",
        inputs: {
          samples: ["6", 0],
          vae: ["1", 2]
        }
      },
      "8": {
        class_type: "SaveImage",
        inputs: {
          images: ["7", 0],
          filename_prefix: "img2img"
        }
      }
    }
  }
};

/**
 * Get all available templates
 */
export function getAllTemplates(): WorkflowTemplate[] {
  return [
    TEXT_TO_IMAGE_BASIC,
    CONTROLNET_WORKFLOW,
    IMAGE_TO_IMAGE
  ];
}

/**
 * Get template by name
 */
export function getTemplateByName(name: string): WorkflowTemplate | null {
  return getAllTemplates().find(t => t.name === name) || null;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): WorkflowTemplate[] {
  return getAllTemplates().filter(t => t.category === category);
}

/**
 * Get templates by difficulty
 */
export function getTemplatesByDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): WorkflowTemplate[] {
  return getAllTemplates().filter(t => t.difficulty === difficulty);
}

/**
 * Create a custom workflow from template
 */
export function createFromTemplate(
  template: WorkflowTemplate,
  customizations?: {
    checkpoint?: string;
    positivePrompt?: string;
    negativePrompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    cfg?: number;
  }
): any {
  const workflow = JSON.parse(JSON.stringify(template.workflow)); // Deep clone

  if (!customizations) return workflow;

  // Apply customizations
  Object.values(workflow.nodes).forEach((node: any) => {
    if (node.class_type === 'CheckpointLoaderSimple' && customizations.checkpoint) {
      node.inputs.ckpt_name = customizations.checkpoint;
    }
    
    if (node.class_type === 'CLIPTextEncode') {
      if (node.inputs.text && !node.inputs.text.includes('low quality') && customizations.positivePrompt) {
        node.inputs.text = customizations.positivePrompt;
      }
      if (node.inputs.text && node.inputs.text.includes('low quality') && customizations.negativePrompt) {
        node.inputs.text = customizations.negativePrompt;
      }
    }
    
    if (node.class_type === 'EmptyLatentImage') {
      if (customizations.width) node.inputs.width = customizations.width;
      if (customizations.height) node.inputs.height = customizations.height;
    }
    
    if (node.class_type === 'KSampler') {
      if (customizations.steps) node.inputs.steps = customizations.steps;
      if (customizations.cfg) node.inputs.cfg = customizations.cfg;
    }
  });

  return workflow;
}