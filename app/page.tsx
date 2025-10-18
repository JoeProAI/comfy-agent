'use client';

import { useState, useEffect } from 'react';
import { Send, Sparkles, Code, Zap, Brain, Loader2 } from 'lucide-react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  workflowJson?: any;
  modelUsed?: string;
  metrics?: {
    tokensUsed: number;
    responseTime: number;
    cost: number;
  };
}

interface ModelStats {
  totalRequests: number;
  modelUsage: Record<string, number>;
  avgCost: number;
  avgLatency: number;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<any>(null);
  const [modelStats, setModelStats] = useState<ModelStats | null>(null);
  const [showStats, setShowStats] = useState(false);

  // Load model stats on mount
  useEffect(() => {
    fetchModelStats();
  }, []);

  const fetchModelStats = async () => {
    try {
      const response = await fetch('/api/modelRouter');
      const data = await response.json();
      if (data.success) {
        setModelStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch model stats:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages,
          workflowContext: currentWorkflow
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        workflowJson: data.workflowJson,
        modelUsed: data.modelUsed,
        metrics: data.metrics
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update current workflow if new one was generated
      if (data.workflowJson) {
        setCurrentWorkflow(data.workflowJson);
      }

      // Refresh stats
      fetchModelStats();

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getModelIcon = (modelName?: string) => {
    if (!modelName) return <Sparkles className="w-4 h-4" />;
    
    if (modelName.includes('gpt-5')) {
      return <Brain className="w-4 h-4 text-purple-500" />;
    } else if (modelName.includes('gpt-4-turbo')) {
      return <Sparkles className="w-4 h-4 text-blue-500" />;
    } else if (modelName.includes('gpt-4o-mini')) {
      return <Zap className="w-4 h-4 text-yellow-500" />;
    } else {
      return <Code className="w-4 h-4 text-green-500" />;
    }
  };

  const getModelLabel = (modelName?: string) => {
    if (!modelName) return '';
    
    if (modelName.includes('gpt-5')) return 'GPT-5 (Deep Reasoning)';
    if (modelName.includes('gpt-4-turbo')) return 'GPT-4-Turbo (Balanced)';
    if (modelName.includes('gpt-4o-mini')) return 'GPT-4o-Mini (Fast)';
    if (modelName.includes('gpt-4o')) return 'GPT-4o (Efficient)';
    return modelName;
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Left Panel - Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                ComfyUI Cloud Assistant
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Master ComfyUI workflows with intelligent AI guidance
              </p>
            </div>
            <button
              onClick={() => setShowStats(!showStats)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
            >
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </button>
          </div>
        </div>

        {/* Stats Panel */}
        {showStats && modelStats && (
          <div className="bg-gray-900 border-b border-gray-800 p-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-400">Total Requests</div>
                <div className="text-2xl font-bold">{modelStats.totalRequests}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-400">Avg Cost</div>
                <div className="text-2xl font-bold">${modelStats.avgCost.toFixed(4)}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-400">Avg Latency</div>
                <div className="text-2xl font-bold">{(modelStats.avgLatency / 1000).toFixed(2)}s</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-400">Model Usage</div>
                <div className="text-xs mt-1">
                  {Object.entries(modelStats.modelUsage).map(([model, count]) => (
                    <div key={model} className="flex justify-between">
                      <span className="text-gray-400">{model}:</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-2xl">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                <h2 className="text-2xl font-bold mb-2">Welcome to ComfyUI Cloud Assistant</h2>
                <p className="text-gray-400 mb-6">
                  I'm here to help you master ComfyUI workflows. Ask me to build, optimize, debug, or explain anything about ComfyUI!
                </p>
                <div className="grid grid-cols-2 gap-3 text-left">
                  <button
                    onClick={() => setInput('Create a text-to-image workflow using SDXL')}
                    className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                  >
                    <Code className="w-5 h-5 mb-2 text-blue-400" />
                    <div className="font-semibold">Build Workflow</div>
                    <div className="text-xs text-gray-400">Create a new workflow</div>
                  </button>
                  <button
                    onClick={() => setInput('Explain how ControlNet nodes work in ComfyUI')}
                    className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                  >
                    <Brain className="w-5 h-5 mb-2 text-purple-400" />
                    <div className="font-semibold">Learn Concepts</div>
                    <div className="text-xs text-gray-400">Understand ComfyUI</div>
                  </button>
                  <button
                    onClick={() => setInput('Optimize my workflow for better performance')}
                    className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                  >
                    <Zap className="w-5 h-5 mb-2 text-yellow-400" />
                    <div className="font-semibold">Optimize</div>
                    <div className="text-xs text-gray-400">Improve performance</div>
                  </button>
                  <button
                    onClick={() => setInput('Debug: My workflow is not executing properly')}
                    className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                  >
                    <Code className="w-5 h-5 mb-2 text-red-400" />
                    <div className="font-semibold">Debug</div>
                    <div className="text-xs text-gray-400">Fix issues</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                {message.role === 'assistant' && message.modelUsed && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                    {getModelIcon(message.modelUsed)}
                    <span>{getModelLabel(message.modelUsed)}</span>
                    {message.metrics && (
                      <span className="ml-2">
                        • {message.metrics.responseTime}ms • ${message.metrics.cost.toFixed(4)}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="prose prose-invert max-w-none">
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} className="mb-2">{line}</p>
                  ))}
                </div>

                {message.workflowJson && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-purple-400">
                        Generated Workflow JSON
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            JSON.stringify(message.workflowJson, null, 2)
                          );
                        }}
                        className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                      >
                        Copy JSON
                      </button>
                    </div>
                    <pre className="bg-gray-900 p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(message.workflowJson, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-400">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-gray-900 border-t border-gray-800 p-4">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about ComfyUI workflows..."
              className="flex-1 bg-gray-800 text-gray-100 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>

      {/* Right Panel - Workflow Viewer */}
      <div className="w-1/2 border-l border-gray-800 flex flex-col">
        <div className="bg-gray-900 border-b border-gray-800 p-4">
          <h2 className="text-lg font-semibold">Workflow Visualizer</h2>
          <p className="text-sm text-gray-400 mt-1">
            {currentWorkflow ? 'Current workflow graph' : 'No workflow loaded'}
          </p>
        </div>

        <div className="flex-1 bg-gray-900">
          {currentWorkflow ? (
            <ReactFlow
              nodes={convertToReactFlowNodes(currentWorkflow)}
              edges={convertToReactFlowEdges(currentWorkflow)}
              fitView
            >
              <Background color="#374151" gap={16} />
              <Controls />
              <MiniMap 
                nodeColor="#6366f1"
                maskColor="rgba(0, 0, 0, 0.6)"
              />
            </ReactFlow>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Generate a workflow to see it visualized here</p>
              </div>
            </div>
          )}
        </div>

        {currentWorkflow && (
          <div className="bg-gray-900 border-t border-gray-800 p-4">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(currentWorkflow, null, 2)
                  );
                }}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
              >
                Copy JSON
              </button>
              <button
                onClick={() => {
                  const blob = new Blob(
                    [JSON.stringify(currentWorkflow, null, 2)],
                    { type: 'application/json' }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'comfy-workflow.json';
                  a.click();
                }}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors"
              >
                Download Workflow
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions for ReactFlow conversion
function convertToReactFlowNodes(workflow: any): any[] {
  if (!workflow?.nodes) return [];
  
  return Object.entries(workflow.nodes).map(([id, node]: [string, any]) => ({
    id,
    type: 'default',
    position: { x: (node.pos?.[0] || 0), y: (node.pos?.[1] || 0) },
    data: { 
      label: node.class_type || node.type || 'Node',
      ...node
    },
  }));
}

function convertToReactFlowEdges(workflow: any): any[] {
  if (!workflow?.nodes) return [];
  
  const edges: any[] = [];
  
  Object.entries(workflow.nodes).forEach(([targetId, node]: [string, any]) => {
    if (node.inputs) {
      Object.entries(node.inputs).forEach(([inputName, input]: [string, any]) => {
        if (Array.isArray(input) && input.length === 2) {
          const [sourceId, outputIndex] = input;
          edges.push({
            id: `${sourceId}-${targetId}-${inputName}`,
            source: sourceId.toString(),
            target: targetId,
            sourceHandle: outputIndex.toString(),
            targetHandle: inputName,
            animated: true,
          });
        }
      });
    }
  });
  
  return edges;
}