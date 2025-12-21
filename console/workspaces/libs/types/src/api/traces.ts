/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

export interface Trace {
  traceId: string;
  rootSpanId: string;
  rootSpanName: string;
  rootSpanKind?: string;
  startTime: string;
  endTime: string;
  durationInNanos: number;
  spanCount: number;
  status?: {
    errorCount: number;
  };
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  input?: string;
  output?: string;
}

export interface TraceListResponse {
  traces: Trace[];
  totalCount: number;
}

export interface PromptMessage {
  role: string; // system, user, assistant, tool
  content?: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: string;
}

export interface ToolDefinition {
  name: string;
  description?: string;
  parameters?: string;
}

export interface SpanStatus {
  error: boolean;
  errorType?: string;
}

export interface LLMTokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadInputTokens?: number;
  totalTokens: number;
}

export interface AmpAttributes {
  kind: string; // llm, tool, embedding, retriever, rerank, agent, task, unknown
  input?: PromptMessage[] | string;
  output?: PromptMessage[] | string;
  tools?: ToolDefinition[];
  name?: string;
  status?: SpanStatus;
  model?: string;
  temperature?: number;
  tokenUsage?: LLMTokenUsage;
}

export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  service: string;
  startTime: string;
  endTime: string;
  durationInNanos: number;
  kind?: string;
  status?: string;
  attributes?: Record<string, unknown>;
  resource?: Record<string, unknown>;
  ampAttributes?: AmpAttributes;
}

export interface TraceDetailsResponse {
  spans: Span[];
  totalCount: number;
}

export interface GetTracePathParams {
  orgName: string | undefined;
  projName: string | undefined;
  agentName: string | undefined;
  envId: string | undefined;
  traceId: string | undefined;
}

export type GetTraceListPathParams = { 
  orgName: string | undefined,
  projName: string | undefined,
  agentName: string | undefined,
  envId: string | undefined,
  startTime: string,
  endTime: string,
  limit?: number,
  offset?: number,
  sortOrder?: 'asc' | 'desc',
};

export enum TraceListTimeRange {
  TEN_MINUTES = '10m',
  THIRTY_MINUTES = '30m',
  ONE_HOUR = '1h',
  THREE_HOURS = '3h',
  SIX_HOURS = '6h',
  TWELVE_HOURS = '12h',
  ONE_DAY = '1d',
  THREE_DAYS = '3d',
  SEVEN_DAYS = '7d',
}
