# Deployment Guide - ComfyUI Cloud Assistant

## Prerequisites

Before deploying, ensure you have:
- ✅ OpenAI API key
- ✅ Comfy Cloud API key (optional, for cloud execution)
- ✅ GitHub account
- ✅ Vercel account (free tier works)

## Step-by-Step Deployment

### 1. Prepare Your Repository

#### Option A: Push to Your GitHub

```bash
# Navigate to the project directory
cd comfy-agent

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/comfy-agent.git

# Push to GitHub
git branch -M main
git push -u origin main
```

#### Option B: Create New Repository on GitHub

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `comfy-agent`
3. Follow the instructions to push existing code

### 2. Deploy to Vercel

#### Method 1: Vercel Dashboard (Recommended)

1. **Go to [Vercel](https://vercel.com)**
2. **Click "Add New Project"**
3. **Import your GitHub repository**
   - Select `comfy-agent` from your repositories
   - Click "Import"

4. **Configure Project**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

5. **Add Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   Name: OPENAI_API_KEY
   Value: your_openai_api_key_here
   ```
   
   ```
   Name: COMFY_CLOUD_KEY
   Value: your_comfy_cloud_api_key_here
   ```
   
   ```
   Name: SMART_MODEL_ROUTER
   Value: true
   ```

6. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Your app will be live at `https://comfy-agent-xxx.vercel.app`

#### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from comfy-agent directory)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? comfy-agent
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add OPENAI_API_KEY
# Paste your OpenAI API key when prompted

vercel env add COMFY_CLOUD_KEY
# Paste your Comfy Cloud API key when prompted

# Deploy to production
vercel --prod
```

### 3. Verify Deployment

1. **Visit your deployment URL**
   - Should see the ComfyUI Cloud Assistant interface
   - Dark mode should be active
   - Chat interface should be responsive

2. **Test the assistant**
   - Try: "Create a simple text-to-image workflow"
   - Verify model selection indicator appears
   - Check that workflow JSON is generated

3. **Check model router stats**
   - Click "Show Stats" button
   - Verify metrics are being tracked

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `COMFY_CLOUD_KEY` | Comfy Cloud API key | None |
| `COMFY_CLOUD_API_URL` | Comfy Cloud API endpoint | `https://api.comfy.org` |
| `SMART_MODEL_ROUTER` | Enable smart routing | `true` |
| `DEFAULT_MODEL` | Override model selection | None (uses smart routing) |

## Post-Deployment Configuration

### 1. Custom Domain (Optional)

In Vercel Dashboard:
1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### 2. Analytics (Optional)

Enable Vercel Analytics:
1. Go to project settings
2. Click "Analytics"
3. Enable Web Analytics
4. Track user interactions and performance

### 3. Monitoring

Set up monitoring:
1. **Vercel Logs**: View real-time logs in dashboard
2. **Error Tracking**: Enable error reporting
3. **Performance**: Monitor Core Web Vitals

## Updating Your Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Your update message"
git push origin main

# Vercel will automatically deploy
```

### Manual Deployments

```bash
# Deploy latest changes
vercel --prod
```

## Troubleshooting

### Build Failures

**Error: "Module not found"**
```bash
# Ensure all dependencies are in package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

**Error: "Environment variable not found"**
- Check that all required env vars are set in Vercel dashboard
- Redeploy after adding variables

### Runtime Errors

**Error: "OpenAI API key invalid"**
- Verify API key in Vercel environment variables
- Ensure no extra spaces or quotes
- Regenerate key if necessary

**Error: "Failed to fetch model stats"**
- Check that `/data` directory has write permissions
- Verify file system access in Vercel (may need serverless function config)

### Performance Issues

**Slow response times**
- Check OpenAI API status
- Review model router metrics
- Consider upgrading Vercel plan for better performance

**High costs**
- Review model usage in stats dashboard
- Adjust routing weights if needed
- Enable more aggressive cost optimization

## Security Best Practices

### API Key Management

1. **Never commit API keys to Git**
   - Always use environment variables
   - Add `.env` to `.gitignore`

2. **Rotate keys regularly**
   - Update in Vercel dashboard
   - Redeploy after rotation

3. **Use separate keys for dev/prod**
   - Development: Use separate OpenAI project
   - Production: Use dedicated production keys

### Access Control

1. **Add authentication** (future enhancement)
   - Implement NextAuth.js
   - Restrict access to authorized users

2. **Rate limiting**
   - Use Vercel Edge Config
   - Implement request throttling

## Scaling Considerations

### Performance Optimization

1. **Enable caching**
   - Use Vercel Edge Caching
   - Cache static assets
   - Implement response caching

2. **Optimize bundle size**
   ```bash
   npm run build -- --analyze
   ```

3. **Use CDN**
   - Vercel automatically uses CDN
   - Optimize image assets

### Cost Management

1. **Monitor usage**
   - Track OpenAI API costs
   - Review Vercel usage
   - Set up billing alerts

2. **Optimize model selection**
   - Review routing metrics
   - Adjust cost sensitivity
   - Use cheaper models when appropriate

## Support & Resources

### Documentation
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)

### Community
- [ComfyUI Discord](https://comfy.org/discord)
- [GitHub Issues](https://github.com/YOUR_USERNAME/comfy-agent/issues)

### Getting Help

If you encounter issues:
1. Check Vercel deployment logs
2. Review browser console for errors
3. Test API endpoints directly
4. Consult documentation
5. Open a GitHub issue

## Success Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Deployment successful
- [ ] Application accessible via URL
- [ ] Model router functioning
- [ ] Workflow generation working
- [ ] Stats dashboard displaying data
- [ ] Custom domain configured (optional)
- [ ] Monitoring enabled

## Next Steps

After successful deployment:

1. **Test thoroughly**
   - Try different workflow types
   - Verify model selection
   - Check cost tracking

2. **Customize**
   - Adjust routing weights
   - Add custom templates
   - Enhance UI/UX

3. **Share**
   - Share with team
   - Gather feedback
   - Iterate and improve

4. **Monitor**
   - Track usage patterns
   - Review costs
   - Optimize performance

---

🎉 **Congratulations!** Your ComfyUI Cloud Assistant is now live and ready to help you master ComfyUI workflows!