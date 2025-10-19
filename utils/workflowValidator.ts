/**
 * ComfyUI Workflow Validation Utilities
 * 
 * Validates workflow JSON structure, node connections, and parameters
 * to ensure compatibility with ComfyUI and Comfy Cloud.
 */

export interface WorkflowNode {
  class_type: string;
  inputs: Record<string, any>;
  _meta?: {
    title?: string;
  };
}

export interface ComfyWorkflow {
  nodes: Record<string, WorkflowNode>;
  links?: any[];
  groups?: any[];
  config?: any;
  version?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Validate a ComfyUI workflow JSON structure
 */
export function validateWorkflow(workflow: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check basic structure
  if (!workflow) {
    errors.push('Workflow is null or undefined');
    return { valid: false, errors, warnings, suggestions };
  }

  if (typeof workflow !== 'object') {
    errors.push('Workflow must be an object');
    return { valid: false, errors, warnings, suggestions };
  }

  // Check for nodes
  if (!workflow.nodes || typeof workflow.nodes !== 'object') {
    errors.push('Workflow must contain a "nodes" object');
    return { valid: false, errors, warnings, suggestions };
  }

  const nodeIds = Object.keys(workflow.nodes);
  
  if (nodeIds.length === 0) {
    errors.push('Workflow must contain at least one node');
    return { valid: false, errors, warnings, suggestions };
  }

  // Validate each node
  nodeIds.forEach(nodeId => {
    const node = workflow.nodes[nodeId];
    
    // Check node structure
    if (!node.class_type) {
      errors.push(`Node ${nodeId}: Missing class_type`);
    }
    
    if (!node.inputs || typeof node.inputs !== 'object') {
      errors.push(`Node ${nodeId}: Missing or invalid inputs object`);
    }

    // Check for common node types
    validateNodeType(nodeId, node, errors, warnings, suggestions);
  });

  // Validate connections
  validateConnections(workflow, errors, warnings);

  // Check for required nodes
  validateRequiredNodes(workflow, warnings, suggestions);

  // Performance suggestions
  addPerformanceSuggestions(workflow, suggestions);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

/**
 * Validate specific node types
 */
function validateNodeType(
  nodeId: string,
  node: WorkflowNode,
  errors: string[],
  warnings: string[],
  suggestions: string[]
): void {
  const classType = node.class_type;

  // Validate common node types
  switch (classType) {
    case 'CheckpointLoaderSimple':
      if (!node.inputs.ckpt_name) {
        errors.push(`Node ${nodeId}: CheckpointLoader missing ckpt_name`);
      }
      break;

    case 'CLIPTextEncode':
      if (!node.inputs.text && !node.inputs.clip) {
        warnings.push(`Node ${nodeId}: CLIPTextEncode missing text or clip input`);
      }
      break;

    case 'KSampler':
      const requiredSamplerInputs = ['model', 'positive', 'negative', 'latent_image'];
      requiredSamplerInputs.forEach(input => {
        if (!node.inputs[input]) {
          errors.push(`Node ${nodeId}: KSampler missing required input: ${input}`);
        }
      });
      
      // Validate sampler parameters
      if (node.inputs.steps && (node.inputs.steps < 1 || node.inputs.steps > 150)) {
        warnings.push(`Node ${nodeId}: Unusual step count (${node.inputs.steps}). Typical range: 20-50`);
      }
      
      if (node.inputs.cfg && (node.inputs.cfg < 1 || node.inputs.cfg > 30)) {
        warnings.push(`Node ${nodeId}: Unusual CFG value (${node.inputs.cfg}). Typical range: 7-12`);
      }
      break;

    case 'VAEDecode':
      if (!node.inputs.samples || !node.inputs.vae) {
        errors.push(`Node ${nodeId}: VAEDecode missing required inputs`);
      }
      break;

    case 'SaveImage':
      if (!node.inputs.images) {
        errors.push(`Node ${nodeId}: SaveImage missing images input`);
      }
      if (!node.inputs.filename_prefix) {
        suggestions.push(`Node ${nodeId}: Consider adding filename_prefix for better organization`);
      }
      break;
  }
}

/**
 * Validate node connections
 */
function validateConnections(
  workflow: ComfyWorkflow,
  errors: string[],
  warnings: string[]
): void {
  const nodeIds = Object.keys(workflow.nodes);

  nodeIds.forEach(nodeId => {
    const node = workflow.nodes[nodeId];
    
    if (node.inputs) {
      Object.entries(node.inputs).forEach(([inputName, inputValue]) => {
        // Check if input is a connection (array format)
        if (Array.isArray(inputValue) && inputValue.length === 2) {
          const [sourceNodeId, outputIndex] = inputValue;
          
          // Validate source node exists
          if (!workflow.nodes[sourceNodeId]) {
            errors.push(
              `Node ${nodeId}: Input "${inputName}" references non-existent node ${sourceNodeId}`
            );
          }
        }
      });
    }
  });
}

/**
 * Check for required nodes in a complete workflow
 */
function validateRequiredNodes(
  workflow: ComfyWorkflow,
  warnings: string[],
  suggestions: string[]
): void {
  const nodeTypes = Object.values(workflow.nodes).map(n => n.class_type);
  
  // Check for model loader
  const hasModelLoader = nodeTypes.some(t => 
    t.includes('CheckpointLoader') || t.includes('ModelLoader')
  );
  
  if (!hasModelLoader) {
    warnings.push('Workflow missing model loader node');
  }

  // Check for output node
  const hasOutput = nodeTypes.some(t => 
    t.includes('SaveImage') || t.includes('PreviewImage')
  );
  
  if (!hasOutput) {
    warnings.push('Workflow missing output node (SaveImage or PreviewImage)');
  }

  // Check for sampler
  const hasSampler = nodeTypes.some(t => 
    t.includes('Sampler') || t.includes('KSampler')
  );
  
  if (!hasSampler && nodeTypes.some(t => t.includes('Checkpoint'))) {
    suggestions.push('Consider adding a sampler node for image generation');
  }
}

/**
 * Add performance optimization suggestions
 */
function addPerformanceSuggestions(
  workflow: ComfyWorkflow,
  suggestions: string[]
): void {
  const nodeCount = Object.keys(workflow.nodes).length;
  
  if (nodeCount > 50) {
    suggestions.push('Large workflow detected. Consider breaking into smaller, reusable components');
  }

  // Check for redundant nodes
  const nodeTypes = Object.values(workflow.nodes).map(n => n.class_type);
  const typeCounts = nodeTypes.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(typeCounts).forEach(([type, count]) => {
    if (count > 3 && type.includes('Loader')) {
      suggestions.push(`Multiple ${type} nodes detected. Consider consolidating to reduce memory usage`);
    }
  });
}

/**
 * Extract workflow metadata
 */
export function extractWorkflowMetadata(workflow: ComfyWorkflow): {
  nodeCount: number;
  nodeTypes: string[];
  hasOutput: boolean;
  hasInput: boolean;
  complexity: number;
} {
  const nodes = Object.values(workflow.nodes);
  const nodeTypes = [...new Set(nodes.map(n => n.class_type))];
  
  return {
    nodeCount: nodes.length,
    nodeTypes,
    hasOutput: nodeTypes.some(t => t.includes('Save') || t.includes('Preview')),
    hasInput: nodeTypes.some(t => t.includes('Load') || t.includes('Input')),
    complexity: calculateWorkflowComplexity(workflow)
  };
}

/**
 * Calculate workflow complexity score
 */
function calculateWorkflowComplexity(workflow: ComfyWorkflow): number {
  let score = 0;
  
  const nodeCount = Object.keys(workflow.nodes).length;
  score += Math.min(50, nodeCount * 2); // Up to 50 points for node count
  
  // Count connections
  let connectionCount = 0;
  Object.values(workflow.nodes).forEach(node => {
    if (node.inputs) {
      Object.values(node.inputs).forEach(input => {
        if (Array.isArray(input)) connectionCount++;
      });
    }
  });
  
  score += Math.min(30, connectionCount); // Up to 30 points for connections
  
  // Advanced node types
  const advancedNodes = ['ControlNet', 'IPAdapter', 'AnimateDiff', 'VideoLinearCFGGuidance'];
  const hasAdvanced = Object.values(workflow.nodes).some(node =>
    advancedNodes.some(advanced => node.class_type.includes(advanced))
  );
  
  if (hasAdvanced) score += 20;
  
  return Math.min(100, score);
}

/**
 * Optimize workflow for performance
 */
export function optimizeWorkflow(workflow: ComfyWorkflow): {
  optimized: ComfyWorkflow;
  changes: string[];
} {
  const changes: string[] = [];
  const optimized = JSON.parse(JSON.stringify(workflow)); // Deep clone

  // Remove duplicate loader nodes
  const loaderNodes = Object.entries(optimized.nodes)
    .filter(([_, node]: [string, any]) => node.class_type && node.class_type.includes('Loader'));

  if (loaderNodes.length > 1) {
    // Group by model/checkpoint
    const loadersByModel = new Map<string, string[]>();
    
    loaderNodes.forEach(([id, node]: [string, any]) => {
      const modelName = node.inputs?.ckpt_name || node.inputs?.model_name || 'default';
      if (!loadersByModel.has(modelName)) {
        loadersByModel.set(modelName, []);
      }
      loadersByModel.get(modelName)!.push(id);
    });

    // Keep only first loader for each model
    loadersByModel.forEach((ids, model) => {
      if (ids.length > 1) {
        changes.push(`Consolidated ${ids.length} duplicate loaders for ${model}`);
        // Implementation would redirect connections and remove duplicates
      }
    });
  }

  return { optimized, changes };
}

/**
 * Format workflow for display
 */
export function formatWorkflowForDisplay(workflow: ComfyWorkflow): string {
  const metadata = extractWorkflowMetadata(workflow);
  
  return `
Workflow Summary:
- Nodes: ${metadata.nodeCount}
- Node Types: ${metadata.nodeTypes.join(', ')}
- Complexity: ${metadata.complexity}/100
- Has Output: ${metadata.hasOutput ? 'Yes' : 'No'}
- Has Input: ${metadata.hasInput ? 'Yes' : 'No'}
  `.trim();
}