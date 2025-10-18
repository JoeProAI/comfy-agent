/**
 * Agent API Route - Core Intelligence Layer
 * 
 * Handles user requests, detects intent, routes to optimal model,
 * and generates ComfyUI workflows or provides assistance.
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { modelRouter } from '@/lib/modelRouter';
import type { TaskAnalysis, PerformanceMetrics } from '@/lib/modelRouter';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Intent detection patterns
const INTENT_PATTERNS = {
  BUILD: /(?:create|build|generate|make|design)\s+(?:a\s+)?workflow/i,
  OPTIMIZE: /(?:optimize|improve|enhance|refactor)\s+(?:my\s+)?workflow/i,
  DEBUG: /(?:debug|fix|troubleshoot|solve|error|issue|problem)/i,
  EXPLAIN: /(?:explain|what\s+is|how\s+does|tell\s+me\s+about|describe)/i,
  MODIFY: /(?:modify|change|update|edit|adjust)\s+(?:my\s+)?workflow/i,
  LEARN: /(?:teach|learn|tutorial|guide|how\s+to|best\s+practice)/i,
};

interface AgentRequest {
  message: string;
  conversationHistory?: any[];
  workflowContext?: any;
  userPreferences?: Partial<TaskAnalysis>;
}

interface AgentResponse {
  response: string;
  workflowJson?: any;
  suggestions?: string[];
  modelUsed: string;
  reasoning?: string;
  metrics?: {
    tokensUsed: number;
    responseTime: number;
    cost: number;
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: AgentRequest = await request.json();
    const { message, conversationHistory = [], workflowContext, userPreferences } = body;

    // 1. Detect user intent
    const intent = detectIntent(message);
    console.log('🎯 Detected intent:', intent);

    // 2. Select optimal model using smart router
    const selectedModel = await modelRouter.selectModel(
      message,
      conversationHistory,
      userPreferences
    );
    console.log('🧠 Selected model:', selectedModel);

    // 3. Build context-aware system prompt
    const systemPrompt = buildSystemPrompt(intent, workflowContext);

    // 4. Prepare conversation messages
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user' as const, content: message }
    ];

    // 5. Call OpenAI with selected model
    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages,
      temperature: intent === 'BUILD' || intent === 'MODIFY' ? 0.7 : 0.3,
      max_tokens: intent === 'EXPLAIN' ? 1000 : 4000,
    });

    const responseText = completion.choices[0].message.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;
    const responseTime = Date.now() - startTime;

    // 6. Extract workflow JSON if present
    const workflowJson = extractWorkflowJson(responseText);

    // 7. Generate suggestions based on intent
    const suggestions = generateSuggestions(intent, responseText);

    // 8. Calculate cost
    const modelCaps = await getModelCapabilities(selectedModel);
    const cost = calculateCost(
      completion.usage?.prompt_tokens || 0,
      completion.usage?.completion_tokens || 0,
      modelCaps
    );

    // 9. Record metrics for learning
    const metrics: PerformanceMetrics = {
      modelUsed: selectedModel,
      taskType: intent,
      taskDomain: detectDomain(message),
      responseTime,
      tokenUsage: {
        prompt: completion.usage?.prompt_tokens || 0,
        completion: completion.usage?.completion_tokens || 0,
        total: tokensUsed
      },
      cost,
      timestamp: new Date(),
      success: true
    };
    
    await modelRouter.recordMetrics(metrics);

    // 10. Build response
    const response: AgentResponse = {
      response: responseText,
      workflowJson,
      suggestions,
      modelUsed: selectedModel,
      reasoning: `Selected ${selectedModel} for ${intent} task (complexity: ${detectComplexity(message)}/100)`,
      metrics: {
        tokensUsed,
        responseTime,
        cost
      }
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Agent API Error:', error);
    
    // Record failed metrics
    const metrics: PerformanceMetrics = {
      modelUsed: 'unknown',
      taskType: 'error',
      taskDomain: 'error',
      responseTime: Date.now() - startTime,
      tokenUsage: { prompt: 0, completion: 0, total: 0 },
      cost: 0,
      timestamp: new Date(),
      success: false
    };
    
    await modelRouter.recordMetrics(metrics);

    return NextResponse.json(
      { 
        error: error.message || 'An error occurred',
        modelUsed: 'error',
        response: 'I encountered an error processing your request. Please try again.'
      },
      { status: 500 }
    );
  }
}

/**
 * Detect user intent from message
 */
function detectIntent(message: string): string {
  for (const [intent, pattern] of Object.entries(INTENT_PATTERNS)) {
    if (pattern.test(message)) {
      return intent;
    }
  }
  return 'GENERAL';
}

/**
 * Detect domain from message
 */
function detectDomain(message: string): string {
  const lower = message.toLowerCase();
  
  if (lower.includes('workflow') || lower.includes('graph')) return 'workflow_design';
  if (lower.includes('node')) return 'node_configuration';
  if (lower.includes('model') || lower.includes('checkpoint')) return 'model_management';
  if (lower.includes('api')) return 'api_integration';
  
  return 'general';
}

/**
 * Detect complexity score
 */
function detectComplexity(message: string): number {
  let score = 0;
  
  if (message.length > 500) score += 20;
  if (message.includes('complex') || message.includes('advanced')) score += 15;
  if (message.includes('optimize') || message.includes('debug')) score += 10;
  if ((message.match(/\?/g) || []).length > 2) score += 10;
  
  return Math.min(100, score);
}

/**
 * Build context-aware system prompt
 */
function buildSystemPrompt(intent: string, workflowContext?: any): string {
  const basePrompt = `You are an expert ComfyUI Cloud assistant specializing in workflow design, optimization, and mastery-level guidance. You help users build, debug, and understand ComfyUI workflows.

Key Principles:
- Focus on modular, reusable workflow design
- Provide educational explanations, not just solutions
- Avoid generic scene generation - focus on creative control
- Teach advanced composition techniques
- Optimize for Comfy Cloud environment (no local dependencies)

Your expertise includes:
- ComfyUI JSON graph structure and node architecture
- All supported models (SD, SDXL, Flux, video models, etc.)
- Node types, parameters, and connections
- Workflow optimization and performance tuning
- Best practices for professional workflows`;

  const intentPrompts: Record<string, string> = {
    BUILD: `\n\nCurrent Task: Help the user BUILD a new workflow. Provide:
- Clear workflow structure with proper node connections
- Valid ComfyUI JSON format
- Explanation of each node's purpose
- Best practices for this type of workflow
- Suggestions for variations or enhancements`,

    OPTIMIZE: `\n\nCurrent Task: Help the user OPTIMIZE their workflow. Focus on:
- Performance improvements
- Memory efficiency
- Better node organization
- Alternative approaches
- Professional workflow patterns`,

    DEBUG: `\n\nCurrent Task: Help the user DEBUG their workflow. Provide:
- Systematic troubleshooting approach
- Common error patterns and solutions
- Validation of node connections
- Parameter verification
- Step-by-step debugging guide`,

    EXPLAIN: `\n\nCurrent Task: EXPLAIN ComfyUI concepts. Provide:
- Clear, educational explanations
- Practical examples
- Visual descriptions when helpful
- Related concepts and connections
- Best practices and tips`,

    MODIFY: `\n\nCurrent Task: Help the user MODIFY their workflow. Focus on:
- Understanding current workflow structure
- Implementing requested changes
- Maintaining workflow integrity
- Explaining modifications
- Suggesting improvements`,

    LEARN: `\n\nCurrent Task: TEACH the user about ComfyUI. Provide:
- Step-by-step tutorials
- Progressive learning path
- Hands-on examples
- Common pitfalls to avoid
- Advanced techniques when appropriate`,
  };

  let prompt = basePrompt + (intentPrompts[intent] || '');

  if (workflowContext) {
    prompt += `\n\nCurrent Workflow Context:\n${JSON.stringify(workflowContext, null, 2)}`;
  }

  return prompt;
}

/**
 * Extract workflow JSON from response
 */
function extractWorkflowJson(response: string): any | null {
  try {
    // Look for JSON code blocks
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // Look for raw JSON objects
    const objectMatch = response.match(/\{[\s\S]*"nodes"[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Generate contextual suggestions
 */
function generateSuggestions(intent: string, response: string): string[] {
  const suggestions: string[] = [];

  switch (intent) {
    case 'BUILD':
      suggestions.push(
        'Optimize this workflow for performance',
        'Explain the nodes in detail',
        'Show me variations of this workflow',
        'Add advanced features'
      );
      break;
    case 'OPTIMIZE':
      suggestions.push(
        'Explain the optimizations',
        'Show before/after comparison',
        'Suggest further improvements',
        'Test the optimized workflow'
      );
      break;
    case 'DEBUG':
      suggestions.push(
        'Explain the root cause',
        'Show me similar issues',
        'Prevent this in the future',
        'Validate the fix'
      );
      break;
    case 'EXPLAIN':
      suggestions.push(
        'Show me a practical example',
        'Explain related concepts',
        'What are the best practices?',
        'How do I use this in a workflow?'
      );
      break;
  }

  return suggestions;
}

/**
 * Get model capabilities for cost calculation
 */
async function getModelCapabilities(modelName: string): Promise<any> {
  const capabilities: Record<string, any> = {
    'gpt-5': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-4o': { input: 0.005, output: 0.015 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 }
  };
  
  return capabilities[modelName] || capabilities['gpt-4-turbo'];
}

/**
 * Calculate request cost
 */
function calculateCost(
  promptTokens: number,
  completionTokens: number,
  pricing: any
): number {
  const inputCost = (promptTokens / 1000) * pricing.input;
  const outputCost = (completionTokens / 1000) * pricing.output;
  return inputCost + outputCost;
}