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

import React, { useState } from "react";
import { Box, Drawer } from "@wso2/oxygen-ui";
import { TracesTable } from "@agent-management-platform/shared-component";
import { FadeIn, PageLayout, DrawerHeader } from "@agent-management-platform/views";
import { TraceDetails } from "./subComponents/TraceDetails";
import {
  TraceListTimeRange,
} from "@agent-management-platform/types";
import { useParams } from "react-router-dom";
import { GitBranch } from "@wso2/oxygen-ui-icons-react";

export const AgentTraces: React.FC = () => {
  const { agentId, orgId, projectId, envId } = useParams();
  const [timeRange, setTimeRange] = useState<TraceListTimeRange>(
    TraceListTimeRange.ONE_DAY
  );
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);

  const handleTraceClick = (traceId: string) => {
    setSelectedTraceId(traceId);
  };

  const handleCloseDrawer = () => {
    setSelectedTraceId(null);
  };

  return (
    <FadeIn>
      <PageLayout title="Traces" disableIcon>
        <Box
          sx={{
            display: "flex",
            pb: 2,
            flexDirection: "column",
          }}
        >
          <TracesTable
            orgId={orgId ?? "default"}
            projectId={projectId ?? "default"}
            agentId={agentId ?? "default"}
            envId={envId ?? "default"}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            onTraceClick={handleTraceClick}
          />

          {/* Trace Details Drawer */}
          <Drawer
            anchor="right"
            open={!!selectedTraceId}
            onClose={handleCloseDrawer}
            sx={{
              zIndex: (theme) => theme.zIndex.drawer,
            }}
            slotProps={{
              backdrop: {
                sx: {
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  top: '64px', // Position below AppBar
                },
              },
            }}
            PaperProps={{
              sx: {
                width: "90%",
                maxWidth: "1600px",
                height: "calc(100vh - 64px)", // Account for AppBar height
                marginTop: "64px", // Start below AppBar
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#ffffff",
              },
            }}
          >
            {selectedTraceId && (
              <>
                <DrawerHeader
                  icon={<GitBranch size={24} />}
                  title="Trace Details"
                  onClose={handleCloseDrawer}
                />
                <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <TraceDetails traceId={selectedTraceId} />
                </Box>
              </>
            )}
          </Drawer>
        </Box>
      </PageLayout>
    </FadeIn>
  );
};
