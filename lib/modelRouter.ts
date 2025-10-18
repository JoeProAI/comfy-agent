/**
 * Smart Model Router - Intelligent, Self-Tuning Model Selection
 * 
 * This router dynamically selects the optimal OpenAI model based on:
 * - Task complexity and type
 * - Context size and token requirements
 * - Latency targets
 * - Cost efficiency
 * - Historical performance data
 */

import OpenAI from 'openai';
import { promises as fs } from 'fs';
import path from 'path';

// Model capabilities and pricing (updated dynamically)
interface ModelCapabilities {
  name: string;
  maxTokens: number;
  costPer1kTokens: {
    input: number;
    output: number;
  };
  averageLatency: number;
  capabilities: string[];
  releaseDate: Date;
  performanceScore: number; // 0-100, learned from metrics
}

// Task analysis structure
interface TaskAnalysis {
  type: 'deep_reasoning' | 'code' | 'quick_inference';
  contextTokens: number;
  complexity: number; // 0-100
  latencyTarget: 'fast' | 'balanced' | 'thorough';
  costSensitivity: 'low' | 'medium' | 'high';
  domain: string;
  requiresStructuredOutput: boolean;
}

// Performance metrics for learning
interface PerformanceMetrics {
  modelUsed: string;
  taskType: string;
  taskDomain: string;
  responseTime: number;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
  timestamp: Date;
  success: boolean;
  qualityScore?: number;
}

// Routing weights (learned and adjusted over time)
interface RoutingWeights {
  gpt5_complexity_threshold: number;
  gpt4turbo_complexity_threshold: number;
  token_size_multiplier: number;
  cost_weight: number;
  latency_weight: number;
  quality_weight: number;
}

class SmartModelRouter {
  private openai: OpenAI;
  private metricsPath: string;
  private weightsPath: string;
  private modelCapabilities: Map<string, ModelCapabilities>;
  private routingWeights: RoutingWeights;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.metricsPath = path.join(process.cwd(), 'data', 'metrics.jsonl');
    this.weightsPath = path.join(process.cwd(), 'data', 'routing_weights.json');
    
    // Initialize with default model capabilities
    this.modelCapabilities = new Map([
      ['gpt-5', {
        name: 'gpt-5',
        maxTokens: 128000,
        costPer1kTokens: { input: 0.03, output: 0.06 },
        averageLatency: 3000,
        capabilities: ['deep_reasoning', 'code', 'analysis'],
        releaseDate: new Date('2025-01-01'),
        performanceScore: 95
      }],
      ['gpt-4-turbo', {
        name: 'gpt-4-turbo',
        maxTokens: 128000,
        costPer1kTokens: { input: 0.01, output: 0.03 },
        averageLatency: 2000,
        capabilities: ['code', 'analysis', 'reasoning'],
        releaseDate: new Date('2024-04-01'),
        performanceScore: 85
      }],
      ['gpt-4o', {
        name: 'gpt-4o',
        maxTokens: 128000,
        costPer1kTokens: { input: 0.005, output: 0.015 },
        averageLatency: 1500,
        capabilities: ['code', 'quick_inference', 'multimodal'],
        releaseDate: new Date('2024-05-01'),
        performanceScore: 80
      }],
      ['gpt-4o-mini', {
        name: 'gpt-4o-mini',
        maxTokens: 128000,
        costPer1kTokens: { input: 0.00015, output: 0.0006 },
        averageLatency: 800,
        capabilities: ['quick_inference', 'summarization'],
        releaseDate: new Date('2024-07-01'),
        performanceScore: 70
      }]
    ]);

    // Initialize with default routing weights
    this.routingWeights = {
      gpt5_complexity_threshold: 75,
      gpt4turbo_complexity_threshold: 50,
      token_size_multiplier: 1.2,
      cost_weight: 0.3,
      latency_weight: 0.3,
      quality_weight: 0.4
    };

    this.loadWeights();
  }

  /**
   * Main entry point: Select the best model for a given task
   */
  async selectModel(
    userInput: string,
    conversationHistory: any[] = [],
    userPreferences?: Partial<TaskAnalysis>
  ): Promise<string> {
    // 1. Analyze the task
    const analysis = await this.analyzeTask(userInput, conversationHistory, userPreferences);
    
    // 2. Calculate scores for each model
    const modelScores = await this.scoreModels(analysis);
    
    // 3. Select the highest scoring model
    const selectedModel = this.selectOptimalModel(modelScores);
    
    // 4. Log the decision for learning
    await this.logDecision(analysis, selectedModel);
    
    return selectedModel;
  }

  /**
   * Analyze task characteristics to determine requirements
   */
  private async analyzeTask(
    input: string,
    history: any[],
    preferences?: Partial<TaskAnalysis>
  ): TaskAnalysis {
    // Estimate token count
    const contextTokens = this.estimateTokens(input, history);
    
    // Detect complexity through multiple signals
    const complexity = this.detectComplexity(input);
    
    // Classify domain
    const domain = this.classifyDomain(input);
    
    // Determine task type
    const type = this.determineTaskType(input, complexity);
    
    // Infer latency target
    const latencyTarget = preferences?.latencyTarget || this.inferLatencyTarget(input);
    
    // Determine cost sensitivity
    const costSensitivity = preferences?.costSensitivity || 'medium';
    
    // Check if structured output is needed
    const requiresStructuredOutput = this.requiresStructuredOutput(input);

    return {
      type,
      contextTokens,
      complexity,
      latencyTarget,
      costSensitivity,
      domain,
      requiresStructuredOutput
    };
  }

  /**
   * Detect task complexity using multiple heuristics
   */
  private detectComplexity(input: string): number {
    let score = 0;
    
    // Length-based complexity
    if (input.length > 1000) score += 20;
    else if (input.length > 500) score += 10;
    
    // Keyword-based complexity indicators
    const complexityKeywords = [
      'optimize', 'debug', 'analyze', 'design', 'architect',
      'complex', 'advanced', 'sophisticated', 'intricate',
      'multi-step', 'workflow', 'pipeline', 'system'
    ];
    
    const lowerInput = input.toLowerCase();
    complexityKeywords.forEach(keyword => {
      if (lowerInput.includes(keyword)) score += 5;
    });
    
    // Question complexity
    const questionCount = (input.match(/\?/g) || []).length;
    if (questionCount > 2) score += 10;
    
    // Technical depth indicators
    const technicalTerms = [
      'node', 'graph', 'json', 'api', 'parameter',
      'configuration', 'integration', 'implementation'
    ];
    
    technicalTerms.forEach(term => {
      if (lowerInput.includes(term)) score += 3;
    });
    
    // ComfyUI-specific complexity
    const comfyTerms = [
      'workflow', 'checkpoint', 'lora', 'controlnet',
      'sampler', 'scheduler', 'vae', 'clip'
    ];
    
    comfyTerms.forEach(term => {
      if (lowerInput.includes(term)) score += 4;
    });
    
    return Math.min(100, score);
  }

  /**
   * Classify the domain of the task
   */
  private classifyDomain(input: string): string {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('workflow') || lowerInput.includes('graph')) {
      return 'workflow_design';
    }
    if (lowerInput.includes('json') || lowerInput.includes('code')) {
      return 'code_generation';
    }
    if (lowerInput.includes('explain') || lowerInput.includes('what is')) {
      return 'explanation';
    }
    if (lowerInput.includes('optimize') || lowerInput.includes('improve')) {
      return 'optimization';
    }
    if (lowerInput.includes('debug') || lowerInput.includes('fix')) {
      return 'debugging';
    }
    
    return 'general';
  }

  /**
   * Determine the primary task type
   */
  private determineTaskType(
    input: string,
    complexity: number
  ): 'deep_reasoning' | 'code' | 'quick_inference' {
    const lowerInput = input.toLowerCase();
    
    // Deep reasoning indicators
    if (complexity > this.routingWeights.gpt5_complexity_threshold) {
      return 'deep_reasoning';
    }
    
    if (lowerInput.includes('design') || 
        lowerInput.includes('architect') ||
        lowerInput.includes('strategy') ||
        lowerInput.includes('optimize complex')) {
      return 'deep_reasoning';
    }
    
    // Code generation indicators
    if (lowerInput.includes('json') ||
        lowerInput.includes('workflow') ||
        lowerInput.includes('generate') ||
        lowerInput.includes('create') && complexity > 30) {
      return 'code';
    }
    
    // Default to quick inference for simple queries
    return 'quick_inference';
  }

  /**
   * Infer latency target from user input
   */
  private inferLatencyTarget(input: string): 'fast' | 'balanced' | 'thorough' {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('quick') || lowerInput.includes('fast')) {
      return 'fast';
    }
    if (lowerInput.includes('thorough') || lowerInput.includes('detailed')) {
      return 'thorough';
    }
    
    return 'balanced';
  }

  /**
   * Check if task requires structured output
   */
  private requiresStructuredOutput(input: string): boolean {
    const lowerInput = input.toLowerCase();
    return lowerInput.includes('json') || 
           lowerInput.includes('workflow') ||
           lowerInput.includes('format');
  }

  /**
   * Estimate token count for input and context
   */
  private estimateTokens(input: string, history: any[]): number {
    // Rough estimation: ~4 characters per token
    const inputTokens = Math.ceil(input.length / 4);
    const historyTokens = history.reduce((sum, msg) => {
      return sum + Math.ceil((msg.content?.length || 0) / 4);
    }, 0);
    
    return inputTokens + historyTokens;
  }

  /**
   * Score each available model for the given task
   */
  private async scoreModels(analysis: TaskAnalysis): Promise<Map<string, number>> {
    const scores = new Map<string, number>();
    
    for (const [modelName, capabilities] of this.modelCapabilities) {
      let score = 0;
      
      // 1. Capability match score (0-40 points)
      if (capabilities.capabilities.includes(analysis.type)) {
        score += 40;
      } else if (analysis.type === 'deep_reasoning' && 
                 capabilities.capabilities.includes('reasoning')) {
        score += 30;
      } else if (analysis.type === 'code' && 
                 capabilities.capabilities.includes('analysis')) {
        score += 25;
      }
      
      // 2. Complexity match score (0-30 points)
      const complexityFit = this.calculateComplexityFit(
        analysis.complexity,
        capabilities.performanceScore
      );
      score += complexityFit * 30;
      
      // 3. Cost efficiency score (0-15 points)
      const costScore = this.calculateCostScore(
        capabilities.costPer1kTokens,
        analysis.contextTokens,
        analysis.costSensitivity
      );
      score += costScore * this.routingWeights.cost_weight * 50;
      
      // 4. Latency score (0-15 points)
      const latencyScore = this.calculateLatencyScore(
        capabilities.averageLatency,
        analysis.latencyTarget
      );
      score += latencyScore * this.routingWeights.latency_weight * 50;
      
      // 5. Historical performance bonus (0-10 points)
      score += (capabilities.performanceScore / 100) * 10;
      
      scores.set(modelName, score);
    }
    
    return scores;
  }

  /**
   * Calculate how well model complexity matches task complexity
   */
  private calculateComplexityFit(
    taskComplexity: number,
    modelPerformance: number
  ): number {
    // Perfect fit when model performance slightly exceeds task complexity
    const ideal = taskComplexity + 10;
    const difference = Math.abs(modelPerformance - ideal);
    
    // Score decreases as difference increases
    return Math.max(0, 1 - (difference / 100));
  }

  /**
   * Calculate cost efficiency score
   */
  private calculateCostScore(
    pricing: { input: number; output: number },
    tokens: number,
    sensitivity: string
  ): number {
    const estimatedCost = (pricing.input + pricing.output) * (tokens / 1000);
    
    // Normalize cost to 0-1 scale (assuming max $1 per request)
    const normalizedCost = Math.min(1, estimatedCost);
    
    // Invert so lower cost = higher score
    let score = 1 - normalizedCost;
    
    // Adjust based on cost sensitivity
    if (sensitivity === 'high') {
      score = Math.pow(score, 0.5); // More aggressive cost optimization
    } else if (sensitivity === 'low') {
      score = Math.pow(score, 2); // Less concerned about cost
    }
    
    return score;
  }

  /**
   * Calculate latency score based on target
   */
  private calculateLatencyScore(
    modelLatency: number,
    target: string
  ): number {
    const targetLatency = {
      'fast': 1000,
      'balanced': 2500,
      'thorough': 5000
    }[target];
    
    if (modelLatency <= targetLatency) {
      return 1.0;
    }
    
    // Penalize models that are slower than target
    const penalty = (modelLatency - targetLatency) / targetLatency;
    return Math.max(0, 1 - penalty);
  }

  /**
   * Select the model with the highest score
   */
  private selectOptimalModel(scores: Map<string, number>): string {
    let bestModel = 'gpt-4-turbo'; // Safe default
    let bestScore = 0;
    
    for (const [model, score] of scores) {
      if (score > bestScore) {
        bestScore = score;
        bestModel = model;
      }
    }
    
    return bestModel;
  }

  /**
   * Log routing decision for learning
   */
  private async logDecision(analysis: TaskAnalysis, selectedModel: string): Promise<void> {
    const decision = {
      timestamp: new Date().toISOString(),
      analysis,
      selectedModel,
      scores: await this.scoreModels(analysis)
    };
    
    // Log to console for debugging
    console.log('🧠 Model Router Decision:', {
      model: selectedModel,
      type: analysis.type,
      complexity: analysis.complexity,
      tokens: analysis.contextTokens
    });
  }

  /**
   * Record performance metrics after task completion
   */
  async recordMetrics(metrics: PerformanceMetrics): Promise<void> {
    try {
      // Ensure data directory exists
      await fs.mkdir(path.dirname(this.metricsPath), { recursive: true });
      
      // Append metrics as JSONL
      const line = JSON.stringify(metrics) + '\n';
      await fs.appendFile(this.metricsPath, line);
      
      // Trigger learning if we have enough data
      const metricsCount = await this.getMetricsCount();
      if (metricsCount % 100 === 0) {
        await this.updateRoutingWeights();
      }
    } catch (error) {
      console.error('Error recording metrics:', error);
    }
  }

  /**
   * Get count of recorded metrics
   */
  private async getMetricsCount(): Promise<number> {
    try {
      const content = await fs.readFile(this.metricsPath, 'utf-8');
      return content.split('\n').filter(line => line.trim()).length;
    } catch {
      return 0;
    }
  }

  /**
   * Update routing weights based on historical performance
   */
  private async updateRoutingWeights(): Promise<void> {
    try {
      const metrics = await this.loadMetrics();
      
      if (metrics.length < 50) return; // Need minimum data
      
      // Analyze performance by model and task type
      const analysis = this.analyzeMetricsPerformance(metrics);
      
      // Calculate optimal thresholds
      const newWeights = this.calculateOptimalWeights(analysis);
      
      // Update weights
      this.routingWeights = newWeights;
      
      // Save to disk
      await fs.writeFile(
        this.weightsPath,
        JSON.stringify(newWeights, null, 2)
      );
      
      console.log('📊 Updated routing weights based on performance data');
    } catch (error) {
      console.error('Error updating routing weights:', error);
    }
  }

  /**
   * Load historical metrics
   */
  private async loadMetrics(): Promise<PerformanceMetrics[]> {
    try {
      const content = await fs.readFile(this.metricsPath, 'utf-8');
      return content
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
    } catch {
      return [];
    }
  }

  /**
   * Analyze metrics to find performance patterns
   */
  private analyzeMetricsPerformance(metrics: PerformanceMetrics[]): any {
    const byModel = new Map<string, PerformanceMetrics[]>();
    
    // Group by model
    metrics.forEach(m => {
      if (!byModel.has(m.modelUsed)) {
        byModel.set(m.modelUsed, []);
      }
      byModel.get(m.modelUsed)!.push(m);
    });
    
    // Calculate statistics for each model
    const analysis: any = {};
    
    for (const [model, modelMetrics] of byModel) {
      analysis[model] = {
        avgResponseTime: this.average(modelMetrics.map(m => m.responseTime)),
        avgCost: this.average(modelMetrics.map(m => m.cost)),
        successRate: modelMetrics.filter(m => m.success).length / modelMetrics.length,
        avgQuality: this.average(
          modelMetrics.map(m => m.qualityScore || 0).filter(q => q > 0)
        ),
        taskTypes: this.groupByTaskType(modelMetrics)
      };
    }
    
    return analysis;
  }

  /**
   * Calculate optimal routing weights from performance analysis
   */
  private calculateOptimalWeights(analysis: any): RoutingWeights {
    // Find the complexity threshold where GPT-5 outperforms GPT-4-Turbo
    const gpt5Performance = analysis['gpt-5']?.avgQuality || 0;
    const gpt4Performance = analysis['gpt-4-turbo']?.avgQuality || 0;
    
    // Adjust thresholds based on relative performance
    const performanceRatio = gpt5Performance / (gpt4Performance || 1);
    
    return {
      gpt5_complexity_threshold: performanceRatio > 1.2 ? 70 : 80,
      gpt4turbo_complexity_threshold: 45,
      token_size_multiplier: 1.2,
      cost_weight: this.calculateCostWeight(analysis),
      latency_weight: this.calculateLatencyWeight(analysis),
      quality_weight: 0.4
    };
  }

  /**
   * Calculate optimal cost weight based on user behavior
   */
  private calculateCostWeight(analysis: any): number {
    // If users consistently choose quality over cost, reduce cost weight
    const avgQuality = this.average(
      Object.values(analysis).map((a: any) => a.avgQuality || 0)
    );
    
    return avgQuality > 0.8 ? 0.2 : 0.3;
  }

  /**
   * Calculate optimal latency weight
   */
  private calculateLatencyWeight(analysis: any): number {
    // If response times are consistently fast, maintain current weight
    const avgLatency = this.average(
      Object.values(analysis).map((a: any) => a.avgResponseTime || 0)
    );
    
    return avgLatency < 2000 ? 0.3 : 0.4;
  }

  /**
   * Load saved routing weights
   */
  private async loadWeights(): Promise<void> {
    try {
      const content = await fs.readFile(this.weightsPath, 'utf-8');
      this.routingWeights = JSON.parse(content);
      console.log('📊 Loaded learned routing weights');
    } catch {
      console.log('📊 Using default routing weights');
    }
  }

  /**
   * Discover new models from OpenAI API
   */
  async discoverNewModels(): Promise<void> {
    try {
      const models = await this.openai.models.list();
      
      for (const model of models.data) {
        if (model.id.startsWith('gpt-') && 
            !model.id.includes('instruct') &&
            !this.modelCapabilities.has(model.id)) {
          
          console.log(`🆕 Discovered new model: ${model.id}`);
          
          // Add with conservative defaults
          this.modelCapabilities.set(model.id, {
            name: model.id,
            maxTokens: 128000,
            costPer1kTokens: { input: 0.01, output: 0.03 },
            averageLatency: 2000,
            capabilities: ['general'],
            releaseDate: new Date(model.created * 1000),
            performanceScore: 75 // Will be learned
          });
        }
      }
    } catch (error) {
      console.error('Error discovering models:', error);
    }
  }

  /**
   * Get current routing statistics
   */
  async getRoutingStats(): Promise<any> {
    const metrics = await this.loadMetrics();
    
    if (metrics.length === 0) {
      return {
        totalRequests: 0,
        modelUsage: {},
        avgCost: 0,
        avgLatency: 0
      };
    }
    
    const modelUsage: Record<string, number> = {};
    metrics.forEach(m => {
      modelUsage[m.modelUsed] = (modelUsage[m.modelUsed] || 0) + 1;
    });
    
    return {
      totalRequests: metrics.length,
      modelUsage,
      avgCost: this.average(metrics.map(m => m.cost)),
      avgLatency: this.average(metrics.map(m => m.responseTime)),
      successRate: metrics.filter(m => m.success).length / metrics.length,
      currentWeights: this.routingWeights
    };
  }

  // Utility functions
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private groupByTaskType(metrics: PerformanceMetrics[]): Record<string, number> {
    const groups: Record<string, number> = {};
    metrics.forEach(m => {
      groups[m.taskType] = (groups[m.taskType] || 0) + 1;
    });
    return groups;
  }
}

// Export singleton instance
export const modelRouter = new SmartModelRouter();

// Export types
export type { TaskAnalysis, PerformanceMetrics, ModelCapabilities };