/**
 * Comfy Cloud API Proxy
 * 
 * Handles communication with Comfy Cloud API for workflow execution,
 * status checking, and result retrieval.
 */

import { NextRequest, NextResponse } from 'next/server';

const COMFY_CLOUD_BASE_URL = process.env.COMFY_CLOUD_API_URL || 'https://api.comfy.org';

interface ComfyRequest {
  action: 'execute' | 'status' | 'cancel' | 'history';
  workflowJson?: any;
  promptId?: string;
  clientId?: string;
}

interface ComfyResponse {
  success: boolean;
  data?: any;
  error?: string;
  promptId?: string;
  status?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ComfyRequest = await request.json();
    const { action, workflowJson, promptId, clientId } = body;

    // Get auth token from environment or request
    const authToken = process.env.COMFY_CLOUD_KEY || request.headers.get('x-comfy-token');

    if (!authToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Comfy Cloud authentication token not configured. Please set COMFY_CLOUD_KEY environment variable.' 
        },
        { status: 401 }
      );
    }

    // Route to appropriate Comfy Cloud endpoint
    switch (action) {
      case 'execute':
        return await executeWorkflow(workflowJson, authToken, clientId);
      
      case 'status':
        return await checkStatus(promptId!, authToken);
      
      case 'cancel':
        return await cancelExecution(promptId!, authToken);
      
      case 'history':
        return await getHistory(authToken);
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('Comfy Cloud API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to communicate with Comfy Cloud' 
      },
      { status: 500 }
    );
  }
}

/**
 * Execute a workflow on Comfy Cloud
 */
async function executeWorkflow(
  workflowJson: any,
  authToken: string,
  clientId?: string
): Promise<NextResponse> {
  try {
    // Validate workflow JSON
    if (!workflowJson || !workflowJson.nodes) {
      return NextResponse.json({
        success: false,
        error: 'Invalid workflow JSON: missing nodes'
      }, { status: 400 });
    }

    // Prepare request payload
    const payload = {
      prompt: workflowJson,
      client_id: clientId || generateClientId()
    };

    // Call Comfy Cloud API
    const response = await fetch(`${COMFY_CLOUD_BASE_URL}/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({
        success: false,
        error: errorData.error || `Comfy Cloud API error: ${response.status}`
      }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data,
      promptId: data.prompt_id,
      status: 'queued'
    });

  } catch (error: any) {
    console.error('Execute workflow error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to execute workflow',
      fallbackMode: true,
      message: 'Comfy Cloud API not available. Workflow JSON generated for manual use.'
    }, { status: 503 });
  }
}

/**
 * Check workflow execution status
 */
async function checkStatus(
  promptId: string,
  authToken: string
): Promise<NextResponse> {
  try {
    const response = await fetch(`${COMFY_CLOUD_BASE_URL}/history/${promptId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data,
      status: data.status || 'unknown'
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check status'
    }, { status: 500 });
  }
}

/**
 * Cancel workflow execution
 */
async function cancelExecution(
  promptId: string,
  authToken: string
): Promise<NextResponse> {
  try {
    const response = await fetch(`${COMFY_CLOUD_BASE_URL}/interrupt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Cancel failed: ${response.status}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Workflow execution cancelled'
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to cancel execution'
    }, { status: 500 });
  }
}

/**
 * Get execution history
 */
async function getHistory(authToken: string): Promise<NextResponse> {
  try {
    const response = await fetch(`${COMFY_CLOUD_BASE_URL}/history`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`History fetch failed: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch history'
    }, { status: 500 });
  }
}

/**
 * Generate a unique client ID
 */
function generateClientId(): string {
  return `comfy-agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Comfy Cloud Proxy',
    endpoints: {
      execute: 'POST /api/comfy with action: execute',
      status: 'POST /api/comfy with action: status',
      cancel: 'POST /api/comfy with action: cancel',
      history: 'POST /api/comfy with action: history'
    }
  });
}