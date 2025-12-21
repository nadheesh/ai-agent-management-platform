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

import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from "@wso2/oxygen-ui";
import { ChevronDown } from "@wso2/oxygen-ui-icons-react";
import { ToolDefinition } from "@agent-management-platform/types";

interface ToolsViewProps {
  tools: ToolDefinition[];
}

export function ToolsView({ tools }: ToolsViewProps) {
  if (tools.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center", backgroundColor: "#fafafa !important" }}>
        <Typography variant="body2" color="text.secondary">
          No tools available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 3, backgroundColor: "#fafafa !important" }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Available Tools ({tools.length})
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {tools.map((tool, idx) => (
          <Accordion 
            key={idx}
            sx={{
              backgroundColor: "#ffffff !important",
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              '&:before': { display: 'none' },
              '&.Mui-expanded': { margin: 0 },
            }}
          >
            <AccordionSummary expandIcon={<ChevronDown />}>
              <Typography variant="body2" fontWeight="medium">
                {tool.name}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {tool.description && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                  {tool.description}
                </Typography>
              )}
              {tool.parameters && (
                <Box>
                  <Typography variant="caption" fontWeight="600" sx={{ display: "block", mb: 0.5 }}>
                    Parameters:
                  </Typography>
                  <Box sx={{ p: 1.5, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                    <Typography 
                      variant="caption" 
                      component="pre" 
                      sx={{ 
                        whiteSpace: "pre-wrap", 
                        wordBreak: "break-word",
                        fontFamily: "monospace",
                      }}
                    >
                      {JSON.stringify(JSON.parse(tool.parameters), null, 2)}
                    </Typography>
                  </Box>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}
