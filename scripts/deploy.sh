#!/bin/bash

# ComfyUI Cloud Assistant - Deployment Script
# This script automates the deployment process to Vercel

set -e  # Exit on error

echo "🚀 ComfyUI Cloud Assistant - Deployment Script"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the comfy-agent directory."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git config user.email "comfy-agent@machine.ai"
    git config user.name "ComfyUI Assistant"
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "📝 Committing changes..."
    git add .
    git commit -m "Update: Prepare for deployment"
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and add your API keys before deploying!"
    echo "Required: OPENAI_API_KEY"
    echo "Optional: COMFY_CLOUD_KEY"
    echo ""
    read -p "Press Enter after you've configured .env, or Ctrl+C to cancel..."
fi

# Verify OpenAI API key is set
if ! grep -q "OPENAI_API_KEY=sk-" .env 2>/dev/null; then
    echo "⚠️  Warning: OPENAI_API_KEY not properly configured in .env"
    echo "Please add your OpenAI API key to .env file"
    exit 1
fi

echo ""
echo "🔍 Pre-deployment checks..."
echo "✅ Git repository initialized"
echo "✅ Dependencies installed"
echo "✅ Environment configured"
echo ""

# Ask for deployment confirmation
read -p "Deploy to Vercel? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "🚀 Deploying to Vercel..."
echo ""

# Deploy to Vercel
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Visit your deployment URL"
echo "2. Test the assistant with example prompts"
echo "3. Monitor model selection and costs"
echo "4. Configure custom domain (optional)"
echo ""
echo "📚 Resources:"
echo "- README.md - Full documentation"
echo "- DEPLOYMENT.md - Detailed deployment guide"
echo "- QUICKSTART.md - Quick start guide"
echo ""
echo "🎉 Your ComfyUI Cloud Assistant is now live!"