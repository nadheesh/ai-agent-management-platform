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

import { Box, Tabs, Tab, Chip, Typography, Tooltip } from "@wso2/oxygen-ui";
import { GitBranch as Timeline, CheckCircle, AlertCircle, Clock, Thermometer, Coins } from "@wso2/oxygen-ui-icons-react";
import { Span } from "@agent-management-platform/types";
import { DrawerHeader } from "@agent-management-platform/views";
import { useState, useMemo } from "react";
import { AMPSpanDetails } from "./spanDetails/AMPSpanDetails";
import { RawAttributesView } from "./spanDetails/RawAttributesView";
import { ToolsView } from "./spanDetails/ToolsView";

interface SpanDetailsPanelProps {
  span: Span | null;
  onClose?: () => void;
}

export function SpanDetailsPanel({ span, onClose }: SpanDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState(0);

  const hasTools = useMemo(() => {
    return span?.ampAttributes?.tools && span.ampAttributes.tools.length > 0;
  }, [span]);

  if (!span) {
    return null;
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const amp = span.ampAttributes;
  const durationMs = (span.durationInNanos / 1_000_000).toFixed(2);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fafafa !important",
      }}
    >
      {onClose && (
        <DrawerHeader
          icon={<Timeline size={24} />}
          title="Span Details"
          onClose={() => onClose()}
        />
      )}
      
      {/* Compact Header with Span Name and Inline Metrics */}
      <Box
        sx={{
          p: 2,
          backgroundColor: "#ffffff !important",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        {/* Span Name */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {span.name}
          </Typography>
        </Box>

        {/* Compact Metrics Row */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
          {/* Status */}
          {amp?.status && (
            <Tooltip title={amp.status.error ? `Error: ${amp.status.errorType || 'Unknown'}` : 'Success'}>
              <Chip
                icon={amp.status.error ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                label={amp.status.error ? "Error" : "Success"}
                size="small"
                color={amp.status.error ? "error" : "success"}
                variant="filled"
              />
            </Tooltip>
          )}

          {/* Kind Badge */}
          {amp?.kind && (
            <Chip
              label={amp.kind.toUpperCase()}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}

          {/* Duration with icon */}
          <Chip
            icon={<Clock size={16} />}
            label={`${durationMs}ms`}
            size="small"
            variant="outlined"
          />

          {/* Model */}
          {amp?.model && (
            <Chip
              label={amp.model}
              size="small"
              variant="outlined"
            />
          )}

          {/* Temperature with icon */}
          {amp?.temperature !== undefined && (
            <Chip
              icon={<Thermometer size={16} />}
              label={amp.temperature}
              size="small"
              variant="outlined"
            />
          )}

          {/* Token Usage with icon */}
          {amp?.tokenUsage && (
            <Tooltip 
              title={
                <Box>
                  <Typography variant="caption" sx={{ display: "block" }}>
                    Input: {amp.tokenUsage.inputTokens.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ display: "block" }}>
                    Output: {amp.tokenUsage.outputTokens.toLocaleString()}
                  </Typography>
                  {amp.tokenUsage.cacheReadInputTokens && (
                    <Typography variant="caption" sx={{ display: "block" }}>
                      Cache: {amp.tokenUsage.cacheReadInputTokens.toLocaleString()}
                    </Typography>
                  )}
                </Box>
              }
            >
              <Chip
                icon={<Coins size={16} />}
                label={amp.tokenUsage.totalTokens.toLocaleString()}
                size="small"
                variant="outlined"
              />
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", backgroundColor: "#ffffff !important" }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          {hasTools && <Tab label="Tools" />}
          <Tab label="Attributes" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {activeTab === 0 && <AMPSpanDetails span={span} />}
        {hasTools && activeTab === 1 && <ToolsView tools={amp?.tools || []} />}
        {activeTab === (hasTools ? 2 : 1) && <RawAttributesView span={span} />}
      </Box>
    </Box>
  );
}
