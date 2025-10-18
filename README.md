# ComfyUI Cloud Assistant

An intelligent AI-powered assistant for mastering ComfyUI workflows, featuring adaptive model routing and professional workflow guidance.

## 🌟 Features

### Intelligent Model Routing
- **Smart Model Selection**: Automatically chooses the optimal OpenAI model (GPT-5, GPT-4-Turbo, GPT-4o, GPT-4o-Mini) based on task complexity, context size, and cost efficiency
- **Adaptive Learning**: Improves routing decisions over time based on performance metrics
- **Cost Optimization**: Balances quality with cost through intelligent model selection
- **Real-time Metrics**: Track model usage, costs, and performance

### ComfyUI Mastery
- **Workflow Generation**: Create complex ComfyUI workflows from natural language descriptions
- **Workflow Optimization**: Improve performance and efficiency of existing workflows
- **Debugging Assistance**: Systematic troubleshooting and error resolution
- **Educational Guidance**: Learn advanced ComfyUI concepts and techniques
- **Visual Workflow Editor**: Interactive graph visualization with ReactFlow

### Comfy Cloud Integration
- **Direct API Integration**: Execute workflows on Comfy Cloud
- **Status Monitoring**: Track workflow execution progress
- **History Management**: Access previous workflow runs
- **Offline Mode**: Generate workflows for manual use when API unavailable

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm or yarn
- OpenAI API key
- Comfy Cloud API key (for cloud execution)

### Installation

1. **Clone or download this repository**

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
OPENAI_API_KEY=your_openai_api_key_here
COMFY_CLOUD_KEY=your_comfy_cloud_api_key_here
```

4. **Run development server**
```bash
npm run dev
```

5. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Set environment variables in Vercel**
```bash
vercel env add OPENAI_API_KEY
vercel env add COMFY_CLOUD_KEY
```

5. **Deploy to production**
```bash
vercel --prod
```

### Deploy to Other Platforms

The application is a standard Next.js app and can be deployed to:
- Netlify
- Railway
- Render
- AWS Amplify
- Any platform supporting Next.js

## 🧠 Smart Model Router

### How It Works

The Smart Model Router analyzes each request and selects the optimal model based on:

1. **Task Complexity** (0-100 score)
   - Keyword analysis
   - Technical depth
   - Question complexity
   - Domain-specific indicators

2. **Context Size**
   - Token estimation
   - Conversation history
   - Workflow context

3. **Task Type Detection**
   - Deep Reasoning: Complex problem-solving, optimization
   - Code Generation: Workflow JSON, structured outputs
   - Quick Inference: Simple queries, explanations

4. **Cost Efficiency**
   - Model pricing comparison
   - Token usage optimization
   - User cost sensitivity

5. **Latency Requirements**
   - Fast: Quick responses (GPT-4o-Mini)
   - Balanced: Quality + speed (GPT-4-Turbo)
   - Thorough: Maximum quality (GPT-5)

### Model Selection Matrix

| Task Type | Complexity | Context | Selected Model | Reasoning |
|-----------|-----------|---------|----------------|-----------|
| Deep Reasoning | High (>75) | Large | GPT-5 | Maximum reasoning capability |
| Deep Reasoning | Medium | Medium | GPT-4-Turbo | Balanced performance |
| Code Generation | Any | Any | GPT-4-Turbo | Optimal for structured outputs |
| Quick Inference | Low | Small | GPT-4o-Mini | Speed and efficiency |
| Explanation | Low-Medium | Any | GPT-4o | Fast, accurate responses |

### Adaptive Learning

The router continuously improves through:
- **Performance Tracking**: Records response time, cost, quality
- **Pattern Recognition**: Identifies optimal model for each task type
- **Weight Adjustment**: Updates routing thresholds every 100 requests
- **Model Discovery**: Automatically integrates new OpenAI models

### Metrics Dashboard

View routing statistics in the UI:
- Total requests processed
- Model usage distribution
- Average cost per request
- Average response latency
- Success rate

## 🎯 Usage Examples

### Building Workflows
```
User: "Create a text-to-image workflow using SDXL with ControlNet"
Assistant: [Uses GPT-4-Turbo for structured JSON generation]
```

### Optimizing Workflows
```
User: "Optimize my workflow for faster generation"
Assistant: [Uses GPT-5 for deep analysis and optimization]
```

### Learning
```
User: "Explain how sampling works in ComfyUI"
Assistant: [Uses GPT-4o for quick, accurate explanation]
```

### Debugging
```
User: "My workflow fails at the VAE decode step"
Assistant: [Uses GPT-4-Turbo for systematic debugging]
```

## 🏗️ Architecture

### Project Structure
```
comfy-agent/
├── app/
│   ├── api/
│   │   ├── agent/          # Core AI agent logic
│   │   ├── comfy/          # Comfy Cloud proxy
│   │   └── modelRouter/    # Router stats API
│   ├── page.tsx            # Main UI
│   ├── layout.tsx          # App layout
│   └── globals.css         # Global styles
├── lib/
│   └── modelRouter.ts      # Smart model router
├── components/             # React components
├── utils/                  # Utility functions
├── data/                   # Metrics and weights
├── docs/                   # Documentation
│   ├── comfy_cloud_reference.md
│   ├── comfyui_reference.md
│   └── model_router.md
└── public/                 # Static assets
```

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS, ShadCN UI components
- **Visualization**: ReactFlow for workflow graphs
- **AI**: OpenAI API with intelligent routing
- **State Management**: React hooks
- **API**: Next.js API routes

## 🔧 Configuration

### Model Router Settings

Edit `lib/modelRouter.ts` to adjust routing behavior:

```typescript
// Default routing weights
routingWeights = {
  gpt5_complexity_threshold: 75,      // Complexity score for GPT-5
  gpt4turbo_complexity_threshold: 50, // Complexity score for GPT-4-Turbo
  token_size_multiplier: 1.2,         // Weight for context size
  cost_weight: 0.3,                   // Importance of cost (0-1)
  latency_weight: 0.3,                // Importance of speed (0-1)
  quality_weight: 0.4                 // Importance of quality (0-1)
}
```

### User Preferences

Pass preferences in API requests:
```typescript
{
  message: "Your question",
  userPreferences: {
    costSensitivity: 'high',      // 'low' | 'medium' | 'high'
    latencyTarget: 'fast',        // 'fast' | 'balanced' | 'thorough'
  }
}
```

## 📊 Monitoring & Analytics

### Metrics Collection
- All requests are logged to `data/metrics.jsonl`
- Metrics include: model used, response time, token usage, cost, success rate
- Privacy-focused: No user data stored, only performance metrics

### Routing Weights
- Learned weights saved to `data/routing_weights.json`
- Updated automatically every 100 requests
- Manual updates via admin interface (future feature)

### Performance Analysis
Access routing stats via API:
```bash
curl http://localhost:3000/api/modelRouter
```

## 🎓 Learning Resources

### Documentation
- [Comfy Cloud Reference](./docs/comfy_cloud_reference.md)
- [ComfyUI Architecture](./docs/comfyui_reference.md)
- [Model Router Deep Dive](./docs/model_router.md)

### External Resources
- [ComfyUI Official Docs](https://docs.comfy.org/)
- [ComfyUI Examples](https://comfyanonymous.github.io/ComfyUI_examples/)
- [Comfy Cloud](https://cloud.comfy.org/)

## 🔐 Security

### API Keys
- Never commit `.env` file to version control
- Use Vercel environment variables for production
- Rotate keys regularly

### Data Privacy
- No user conversations stored
- Only anonymized performance metrics
- Local-first architecture

## 🛠️ Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Type Checking
```bash
npx tsc --noEmit
```

### Linting
```bash
npm run lint
```

## 🚧 Troubleshooting

### Common Issues

**"Module not found" errors**
```bash
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors**
```bash
npm install --save-dev @types/node @types/react
```

**API connection issues**
- Verify OPENAI_API_KEY is set correctly
- Check COMFY_CLOUD_KEY if using cloud features
- Ensure API endpoints are accessible

**Build failures**
```bash
npm run build -- --debug
```

## 🔮 Future Enhancements

### Planned Features
- [ ] Multi-provider support (Anthropic, Mistral)
- [ ] Reinforcement learning for routing
- [ ] Advanced workflow templates library
- [ ] Collaborative workflow editing
- [ ] Workflow version control
- [ ] Custom node development assistant
- [ ] Performance benchmarking tools
- [ ] Workflow marketplace integration

### Extensibility
The architecture supports:
- Custom model providers via abstraction layer
- Plugin system for additional features
- Workflow template marketplace
- Community-contributed enhancements

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 💬 Support

- GitHub Issues: Report bugs and request features
- Discord: Join the ComfyUI community
- Documentation: Check the docs folder

## 🙏 Acknowledgments

- ComfyUI team for the amazing framework
- OpenAI for powerful language models
- Comfy Cloud for seamless cloud execution
- Open source community for inspiration

---

Built with ❤️ for the ComfyUI community