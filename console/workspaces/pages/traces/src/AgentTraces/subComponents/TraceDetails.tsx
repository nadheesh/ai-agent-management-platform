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

import { Box, Skeleton, Paper } from "@wso2/oxygen-ui";
import { useTrace } from "@agent-management-platform/api-client";
import {
  NoDataFound,
  TraceExplorer,
} from "@agent-management-platform/views";
import { useParams } from "react-router-dom";
import { Span } from "@agent-management-platform/types";
import { GitBranch } from "@wso2/oxygen-ui-icons-react";
import { useState, useEffect } from "react";
import { SpanDetailsPanel } from "./SpanDetailsPanel";

function TraceDetailsSkeleton() {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        height: "100%",
      }}
    >
      {/* Left side - Span tree skeleton */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
        {[...Array(8)].map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            width="100%"
            height={40}
            sx={{
              ml: (index % 3) * 2,
            }}
          />
        ))}
      </Box>
      {/* Right side - Details skeleton */}
      <Paper sx={{ width: "40%", minWidth: 400, p: 2 }}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Paper>
    </Box>
  );
}

interface TraceDetailsProps {
  traceId: string;
}

export function TraceDetails({ traceId }: TraceDetailsProps) {
  const {
    orgId = "default",
    projectId = "default",
    agentId = "default",
    envId = "default",
  } = useParams();
  const { data: traceDetails, isLoading } = useTrace(
    orgId,
    projectId,
    agentId,
    envId,
    traceId
  );

  const [selectedSpan, setSelectedSpan] = useState<Span | null>(null);

  const spans = traceDetails?.spans ?? [];

  // Auto-select first span when data loads
  useEffect(() => {
    if (spans.length > 0 && !selectedSpan) {
      setSelectedSpan(spans[0]);
    }
  }, [spans, selectedSpan]);

  if (isLoading) {
    return <TraceDetailsSkeleton />;
  }

  if (spans.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          padding: 10,
          backgroundColor: "#ffffff",
        }}
      >
        <NoDataFound
          message="No spans found"
          icon={<GitBranch size={16} />}
          subtitle="Try changing the time range"
        />
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        gap: 0,
        height: "100%",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#ffffff !important",
      }}
    >
      {/* Left side - Span tree */}
      <Box
        sx={{
          flex: 1,
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          borderRight: 1,
          borderColor: "divider",
          backgroundColor: "#ffffff !important",
        }}
      >
        {traceId && (
          <TraceExplorer
            onSpanClick={setSelectedSpan}
            selectedSpanId={selectedSpan?.spanId}
            spans={spans}
          />
        )}
      </Box>

      {/* Right side - Details panel */}
      <Box
        sx={{
          width: "40%",
          minWidth: 400,
          maxWidth: 600,
          height: "100%",
          overflowY: "auto",
          backgroundColor: "#fafafa !important",
        }}
      >
        {selectedSpan && <SpanDetailsPanel span={selectedSpan} />}
      </Box>
    </Paper>
  );
}
