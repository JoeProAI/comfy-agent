# Usage Guide - ComfyUI Cloud Assistant

## Table of Contents
1. [Getting Started](#getting-started)
2. [Core Features](#core-features)
3. [Workflow Building](#workflow-building)
4. [Advanced Techniques](#advanced-techniques)
5. [Model Router](#model-router)
6. [Best Practices](#best-practices)

## Getting Started

### Your First Interaction

Start with a simple request:
```
"Create a basic text-to-image workflow"
```

The assistant will:
1. Analyze your request
2. Select the optimal model (likely GPT-4-Turbo for code generation)
3. Generate a complete ComfyUI workflow JSON
4. Explain each component
5. Display it in the visual graph viewer

### Understanding Responses

Each response includes:
- **Model Used**: Which AI model processed your request
- **Response Time**: How long it took
- **Cost**: Estimated cost of the request
- **Workflow JSON**: Generated workflow (if applicable)

## Core Features

### 1. Workflow Generation

#### Basic Generation
```
"Create a text-to-image workflow using SDXL"
```

#### With Specifications
```
"Create a workflow that:
- Uses SDXL checkpoint
- Generates 1024x1024 images
- Uses 30 sampling steps
- CFG scale of 8
- Euler sampler"
```

#### Advanced Generation
```
"Design a complex workflow with:
- ControlNet for pose guidance
- Multiple LoRA models
- Upscaling to 4K
- Batch processing of 4 images"
```

### 2. Workflow Optimization

#### Performance Optimization
```
"Optimize my workflow for faster generation"
```

The assistant will:
- Analyze current workflow structure
- Identify bottlenecks
- Suggest optimizations
- Provide optimized version

#### Memory Optimization
```
"My workflow uses too much VRAM, how can I reduce it?"
```

### 3. Debugging

#### Error Resolution
```
"My workflow fails with error: [paste error message]"
```

#### Systematic Debugging
```
"Debug my workflow step by step"
```

The assistant will:
- Analyze workflow structure
- Check node connections
- Validate parameters
- Identify issues
- Provide fixes

### 4. Learning & Education

#### Concept Explanation
```
"Explain how sampling works in ComfyUI"
```

#### Node Documentation
```
"What does the KSampler node do and what are its parameters?"
```

#### Best Practices
```
"What are the best practices for text-to-image workflows?"
```

#### Advanced Techniques
```
"Teach me about area composition and how to use it"
```

## Workflow Building

### Building Blocks

#### 1. Model Loading
```
"Add a checkpoint loader for SDXL"
```

#### 2. Text Encoding
```
"Add positive and negative prompts to my workflow"
```

#### 3. Sampling
```
"Configure the sampler with 30 steps and CFG 8"
```

#### 4. Image Processing
```
"Add upscaling to my workflow"
```

#### 5. Output
```
"Save the final image with a custom filename"
```

### Complete Workflow Examples

#### Text-to-Image
```
"Create a complete text-to-image workflow with:
- SDXL base model
- Positive prompt: 'professional photograph of a mountain landscape'
- Negative prompt: 'low quality, blurry'
- 1024x1024 resolution
- 30 steps
- Euler sampler"
```

#### Image-to-Image
```
"Create an image-to-image workflow that:
- Loads an input image
- Applies artistic style
- Uses 0.75 denoise strength
- Outputs enhanced version"
```

#### ControlNet Workflow
```
"Build a ControlNet workflow for:
- Pose-guided generation
- Using Canny edge detection
- SDXL model
- High quality output"
```

## Advanced Techniques

### Multi-Model Workflows

```
"Create a workflow that uses:
- SDXL for base generation
- Refiner model for enhancement
- Upscaler for final output"
```

### Batch Processing

```
"Design a workflow that generates 4 variations of the same prompt"
```

### Custom Nodes

```
"How do I integrate custom nodes into my workflow?"
```

### API Integration

```
"Show me how to use API nodes in my workflow"
```

## Model Router

### Understanding Model Selection

The router considers:
1. **Task Complexity**: How difficult is the request?
2. **Context Size**: How much information is involved?
3. **Task Type**: Is it reasoning, code, or quick inference?
4. **Cost**: What's the most cost-effective option?
5. **Speed**: How fast does it need to be?

### Model Indicators

- 🧩 **GPT-5**: Used for complex reasoning, optimization, advanced debugging
- 🧠 **GPT-4-Turbo**: Used for workflow generation, structured outputs
- ⚡ **GPT-4o-Mini**: Used for quick explanations, simple queries

### Influencing Model Selection

#### Request Complexity
```
"Create a simple workflow"  → GPT-4o-Mini or GPT-4o
"Design a complex multi-stage workflow" → GPT-4-Turbo or GPT-5
```

#### Explicit Preferences
```
"Quickly explain..." → Favors faster models
"Thoroughly analyze..." → Favors more capable models
```

### Monitoring Costs

View real-time cost tracking:
1. Click "Show Stats"
2. See average cost per request
3. Monitor total spending
4. Review model usage distribution

## Best Practices

### Effective Prompting

#### ✅ Good Prompts
```
"Create a text-to-image workflow using SDXL with 30 steps and CFG 8"
"Explain how ControlNet nodes work and show an example"
"Optimize my workflow by reducing memory usage"
```

#### ❌ Avoid
```
"Make something"  # Too vague
"Fix it"  # No context
"Help"  # Not specific
```

### Iterative Development

1. **Start Simple**
   ```
   "Create a basic text-to-image workflow"
   ```

2. **Add Features**
   ```
   "Add ControlNet to this workflow"
   ```

3. **Optimize**
   ```
   "Optimize this workflow for speed"
   ```

4. **Refine**
   ```
   "Adjust the sampling parameters for better quality"
   ```

### Workflow Organization

#### Use Descriptive Names
```
"Name the checkpoint loader 'SDXL_Base'"
```

#### Group Related Nodes
```
"Group the text encoding nodes together"
```

#### Add Comments
```
"Add a comment explaining the sampling strategy"
```

## Common Workflows

### 1. Text-to-Image (Basic)
```
"Create a basic text-to-image workflow"
```

### 2. Image-to-Image
```
"Create an image-to-image workflow with 0.75 denoise"
```

### 3. Inpainting
```
"Create an inpainting workflow for fixing image regions"
```

### 4. Upscaling
```
"Create a workflow that upscales images to 4K"
```

### 5. ControlNet
```
"Create a ControlNet workflow using Canny edge detection"
```

### 6. Video Generation
```
"Create a text-to-video workflow using Stable Video Diffusion"
```

## Troubleshooting Workflows

### Validation Errors

```
"Validate my workflow and fix any errors"
```

### Connection Issues

```
"Check if all nodes are properly connected"
```

### Parameter Problems

```
"My sampler parameters seem wrong, help me fix them"
```

### Performance Issues

```
"My workflow is too slow, what's causing it?"
```

## Tips & Tricks

### 1. Use Templates

```
"Show me workflow templates for [use case]"
```

### 2. Learn from Examples

```
"Explain this workflow step by step: [paste JSON]"
```

### 3. Experiment Safely

```
"What happens if I change [parameter]?"
```

### 4. Get Suggestions

```
"What are some creative ways to use [node type]?"
```

### 5. Stay Updated

```
"What are the latest ComfyUI features I should know about?"
```

## Advanced Usage

### Custom Workflows

```
"Create a custom workflow that:
1. Loads multiple images
2. Processes them in batch
3. Applies different styles to each
4. Combines results
5. Outputs a grid"
```

### Workflow Automation

```
"Design a workflow that can be automated for batch processing"
```

### Integration

```
"How do I integrate this workflow with the Comfy Cloud API?"
```

### Performance Tuning

```
"Analyze my workflow and suggest performance improvements"
```

## Getting Help

### In-App Help

- Use the example prompts on the home screen
- Click "Show Stats" to understand model usage
- Review generated workflows in the visualizer

### Documentation

- [README.md](./README.md) - Complete documentation
- [Model Router Guide](./docs/model_router.md) - Smart routing details
- [ComfyUI Reference](./docs/comfyui_reference.md) - ComfyUI architecture

### Community

- [ComfyUI Discord](https://comfy.org/discord)
- [ComfyUI Documentation](https://docs.comfy.org/)
- [GitHub Issues](https://github.com/YOUR_USERNAME/comfy-agent/issues)

## Keyboard Shortcuts

- `Enter`: Send message
- `Shift + Enter`: New line in input
- `Ctrl/Cmd + K`: Clear conversation (future feature)
- `Ctrl/Cmd + S`: Save workflow (future feature)

## FAQ

**Q: How do I know which model is being used?**
A: Check the model indicator icon and label in each response.

**Q: Can I force a specific model?**
A: Currently, the router automatically selects the best model. Manual override is a planned feature.

**Q: How accurate are the cost estimates?**
A: Very accurate - based on actual token usage and current OpenAI pricing.

**Q: Can I use this offline?**
A: The app requires internet for OpenAI API, but generated workflows can be used offline in ComfyUI.

**Q: How do I export workflows?**
A: Click "Copy JSON" or "Download Workflow" in the workflow viewer panel.

**Q: Can I upload my existing workflows?**
A: Paste workflow JSON in the chat and ask for analysis or modifications.

---

**Happy workflow building!** 🎨

For more help, see the [README](./README.md) or [Deployment Guide](./DEPLOYMENT.md).