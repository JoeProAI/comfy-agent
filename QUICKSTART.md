# Quick Start Guide - ComfyUI Cloud Assistant

Get up and running in 5 minutes!

## 🚀 Installation

### 1. Install Dependencies

```bash
cd comfy-agent
npm install
```

### 2. Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-key-here
COMFY_CLOUD_KEY=your-comfy-cloud-key-here  # Optional
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 First Steps

### Try These Example Prompts

1. **Build a Workflow**
   ```
   Create a text-to-image workflow using SDXL
   ```

2. **Learn a Concept**
   ```
   Explain how KSampler nodes work in ComfyUI
   ```

3. **Optimize**
   ```
   How can I make my workflow run faster?
   ```

4. **Debug**
   ```
   My workflow fails at the VAE decode step, help me fix it
   ```

## 🧠 Understanding Model Selection

Watch the model indicator in responses:

- 🧩 **GPT-5**: Complex reasoning tasks
- 🧠 **GPT-4-Turbo**: Balanced performance
- ⚡ **GPT-4o-Mini**: Quick responses

The router automatically selects the best model for each task!

## 📊 View Statistics

Click "Show Stats" to see:
- Total requests
- Model usage distribution
- Average cost per request
- Response latency

## 🎨 Using the Workflow Viewer

1. Generate a workflow using the chat
2. See it visualized in the right panel
3. Click "Copy JSON" to use in ComfyUI
4. Click "Download Workflow" to save locally

## 🔧 Common Tasks

### Generate a Basic Workflow

```
Create a simple text-to-image workflow with:
- SDXL checkpoint
- Positive prompt: "beautiful landscape"
- Negative prompt: "low quality"
- 30 steps, CFG 8
```

### Add ControlNet

```
Add ControlNet to my workflow for better control
```

### Optimize Performance

```
My workflow is slow, how can I optimize it?
```

### Learn Advanced Techniques

```
Teach me about area composition in ComfyUI
```

## 💡 Tips

1. **Be Specific**: The more details you provide, the better the assistance
2. **Ask Follow-ups**: Build on previous responses for iterative improvement
3. **Use Context**: Reference "my workflow" after generating one
4. **Explore**: Try different types of requests to see model selection in action

## 🐛 Troubleshooting

### "API key not configured"
- Check `.env` file exists
- Verify `OPENAI_API_KEY` is set
- Restart dev server

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
npm install --save-dev @types/node @types/react
```

## 📚 Learn More

- [Full README](./README.md) - Complete documentation
- [Model Router Guide](./docs/model_router.md) - Deep dive into smart routing
- [ComfyUI Reference](./docs/comfyui_reference.md) - ComfyUI architecture
- [Deployment Guide](./DEPLOYMENT.md) - Deploy to production

## 🎓 Next Steps

1. **Experiment** with different workflow types
2. **Monitor** model selection patterns
3. **Customize** routing weights if needed
4. **Deploy** to Vercel for production use
5. **Share** with your team

---

**Need Help?** Check the [README](./README.md) or open an issue on GitHub.

**Ready to Deploy?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment.