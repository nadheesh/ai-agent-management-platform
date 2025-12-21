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

import { Box, Typography, Chip } from "@wso2/oxygen-ui";
import { Span, PromptMessage } from "@agent-management-platform/types";

interface AMPSpanDetailsProps {
  span: Span;
}

function PromptMessageView({ messages, title }: { messages: PromptMessage[]; title: string }) {
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        {title}
      </Typography>
      {/* Chat-like conversation view */}
      <Box sx={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: 1.5,
        backgroundColor: "#f5f5f5",
        borderRadius: 2,
        p: 2,
      }}>
        {messages.map((msg, idx) => (
          <Box 
            key={idx}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
            }}
          >
            {/* Message Header with Role and Number */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Chip 
                label={msg.role.toUpperCase()} 
                size="small" 
                color={msg.role === 'user' ? 'primary' : msg.role === 'assistant' ? 'success' : 'default'}
                variant="outlined" 
                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Message {idx + 1} of {messages.length}
              </Typography>
            </Box>
            
            {/* Message Content */}
            <Box 
              sx={{ 
                p: 2, 
                backgroundColor: "#ffffff !important",
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                transition: 'box-shadow 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
                },
              }}
            >
              {msg.content && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    whiteSpace: "pre-wrap", 
                    wordBreak: "break-word",
                    lineHeight: 1.6,
                  }}
                >
                  {msg.content}
                </Typography>
              )}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <Box sx={{ mt: msg.content ? 2 : 0, p: 1.5, backgroundColor: "#f8f9fa", borderRadius: 1, border: 1, borderColor: "divider" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 1 }}>
                    🔧 Tool Calls ({msg.toolCalls.length})
                  </Typography>
                  {msg.toolCalls.map((tool, toolIdx) => {
                    // Try to parse and format JSON arguments
                    let formattedArgs = tool.arguments;
                    try {
                      const parsed = JSON.parse(tool.arguments);
                      formattedArgs = JSON.stringify(parsed, null, 2);
                    } catch {
                      // If not valid JSON, use as-is
                      formattedArgs = tool.arguments;
                    }
                    
                    return (
                      <Box key={toolIdx} sx={{ mb: 1.5, "&:last-child": { mb: 0 } }}>
                        <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5 }}>
                          {tool.name}
                        </Typography>
                        <Box
                          sx={{
                            p: 1.5,
                            backgroundColor: "#ffffff",
                            borderRadius: 1,
                            border: 1,
                            borderColor: "divider",
                            overflowX: "auto",
                          }}
                        >
                          <Typography 
                            component="pre"
                            variant="caption" 
                            sx={{ 
                              color: "text.secondary",
                              fontFamily: "monospace",
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              margin: 0,
                            }}
                          >
                            {formattedArgs}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function StringView({ content, title }: { content: string; title: string }) {
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        {title}
      </Typography>
      <Box 
        sx={{ 
          p: 2, 
          backgroundColor: "#ffffff !important",
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            whiteSpace: "pre-wrap", 
            wordBreak: "break-word",
            lineHeight: 1.6,
          }}
        >
          {content}
        </Typography>
      </Box>
    </Box>
  );
}

export function AMPSpanDetails({ span }: AMPSpanDetailsProps) {
  const amp = span.ampAttributes;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: 3, backgroundColor: "#fafafa !important" }}>
      {/* Agent/Component Name - Show if available */}
      {amp?.name && (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Name
          </Typography>
          <Box 
            sx={{ 
              p: 2, 
              backgroundColor: "#ffffff !important",
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {amp.name}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Input - Priority 1 */}
      {amp?.input && (
        <>
          {Array.isArray(amp.input) ? (
            <PromptMessageView messages={amp.input} title="Input" />
          ) : (
            <StringView content={amp.input as string} title="Input" />
          )}
        </>
      )}

      {/* Output - Priority 2 */}
      {amp?.output && (
        <>
          {Array.isArray(amp.output) ? (
            <PromptMessageView messages={amp.output} title="Output" />
          ) : (
            <StringView content={amp.output as string} title="Output" />
          )}
        </>
      )}

      {/* Show message if no name, input, or output */}
      {!amp?.name && !amp?.input && !amp?.output && (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No data available
          </Typography>
        </Box>
      )}
    </Box>
  );
}
