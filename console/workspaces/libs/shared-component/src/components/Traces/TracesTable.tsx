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

import { useMemo, useCallback, useState } from "react";
import {
  Typography,
  Chip,
  Box,
  Skeleton,
  ButtonBase,
  MenuItem,
  Select,
  InputAdornment,
  CircularProgress,
  IconButton,
  Tooltip,
  TextField,
} from "@wso2/oxygen-ui";
import {
  DataListingTable,
  FadeIn,
  NoDataFound,
  TableColumn,
  InitialState,
} from "@agent-management-platform/views";
import { generatePath, Link, useNavigate } from "react-router-dom";
import { useTraceList } from "@agent-management-platform/api-client";
import {
  absoluteRouteMap,
  Trace,
  TraceListResponse,
  TraceListTimeRange,
} from "@agent-management-platform/types";
import dayjs from "dayjs";
import {
  Clock as AccessTimeOutlined,
  RefreshCcw,
  Workflow,
  Search,
} from "@wso2/oxygen-ui-icons-react";
import { TracesTopCards } from "./TracesTopCards";

interface TraceRow {
  id: string;
  traceId: string;
  rootSpanName: string;
  rootSpanKind: string;
  startTime: string;
  endTime: string;
  durationInSeconds: number;
  spanCount: number;
  status: {
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

function TracesTableSkeleton() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
      }}
    >
      {[...Array(10)].map((_, index) => (
        <Skeleton key={index} variant="rectangular" width="100%" height={65} />
      ))}
    </Box>
  );
}

const TIME_RANGE_OPTIONS = [
  { value: TraceListTimeRange.TEN_MINUTES, label: "10 Minutes" },
  { value: TraceListTimeRange.THIRTY_MINUTES, label: "30 Minutes" },
  { value: TraceListTimeRange.ONE_HOUR, label: "1 Hour" },
  { value: TraceListTimeRange.THREE_HOURS, label: "3 Hours" },
  { value: TraceListTimeRange.SIX_HOURS, label: "6 Hours" },
  { value: TraceListTimeRange.TWELVE_HOURS, label: "12 Hours" },
  { value: TraceListTimeRange.ONE_DAY, label: "1 Day" },
  { value: TraceListTimeRange.THREE_DAYS, label: "3 Days" },
  { value: TraceListTimeRange.SEVEN_DAYS, label: "7 Days" },
];

interface TracesTableProps {
  orgId: string;
  projectId: string;
  agentId: string;
  envId: string;
  timeRange: TraceListTimeRange;
  setTimeRange?: (timeRange: TraceListTimeRange) => void;
  onTraceClick?: (traceId: string) => void;
}

export function TracesTable({
  orgId,
  projectId,
  agentId,
  envId,
  timeRange,
  setTimeRange,
  onTraceClick,
}: TracesTableProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  const {
    data: traceData,
    isLoading,
    refetch,
    isRefetching,
  } = useTraceList(orgId, projectId, agentId, envId, timeRange);

  const generateTraceDetailPath = useCallback(
    (traceId: string) =>
      generatePath(
        absoluteRouteMap.children.org.children.projects.children.agents
          .children.environment.children.observability.children.traces
          .children.traceDetails.path,
        {
          orgId: orgId ?? "",
          projectId: projectId ?? "",
          agentId: agentId ?? "",
          envId: envId ?? "",
          traceId,
        }
      ),
    [orgId, projectId, agentId, envId]
  );

  const traceListResponse = traceData as unknown as TraceListResponse;

  const rows = useMemo(
    () =>
      traceListResponse?.traces?.map((trace: Trace) => {
        // Convert nanoseconds to seconds
        const durationInSeconds = trace.durationInNanos / 1_000_000_000;

        return {
          id: trace.traceId,
          traceId: trace.traceId,
          rootSpanName: trace.rootSpanName,
          rootSpanKind: trace.rootSpanKind || "unknown",
          startTime: trace.startTime,
          endTime: trace.endTime,
          durationInSeconds: durationInSeconds,
          spanCount: trace.spanCount || 0,
          status: trace.status || { errorCount: 0 },
          tokenUsage: trace.tokenUsage,
          input: trace.input,
          output: trace.output,
        } as TraceRow;
      }) ?? [],
    [traceListResponse?.traces]
  );

  // Filter rows based on search query
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) {
      return rows;
    }
    
    const query = searchQuery.toLowerCase();
    return rows.filter((row) => {
      return (
        row.traceId.toLowerCase().includes(query) ||
        row.rootSpanName.toLowerCase().includes(query) ||
        row.rootSpanKind.toLowerCase().includes(query) ||
        row.input?.toLowerCase().includes(query) ||
        row.output?.toLowerCase().includes(query)
      );
    });
  }, [rows, searchQuery]);

  const getDurationColor = useCallback((durationInSeconds: number) => {
    if (durationInSeconds < 2) return "success";
    if (durationInSeconds < 5) return "warning";
    return "error";
  }, []);

  const columns: TableColumn<TraceRow>[] = useMemo(
    () => [
      {
        id: "rootSpanName",
        label: "Name",
        width: "15%",
        render: (value, row) => (
          <Box>
            <ButtonBase
              component={Link}
              to={generateTraceDetailPath(row.traceId as string)}
            >
              <Typography noWrap variant="body2">
                {value as string}
              </Typography>
            </ButtonBase>
            <Typography noWrap variant="caption" color="text.secondary">
              {row.rootSpanKind}
            </Typography>
          </Box>
        ),
      },
      {
        id: "status",
        label: "Status",
        width: "8%",
        render: (value) => {
          const status = value as TraceRow["status"];
          return (
            <Chip
              label={status.errorCount > 0 ? "Error" : "Success"}
              size="small"
              color={status.errorCount > 0 ? "error" : "success"}
              variant="outlined"
            />
          );
        },
      },
      {
        id: "input",
        label: "Input",
        width: "12%",
        render: (value) => {
          if (!value) {
            return (
              <Typography variant="body2" color="text.secondary">
                -
              </Typography>
            );
          }
          const inputStr = value as string;
          const truncated =
            inputStr.length > 30
              ? `${inputStr.substring(0, 30)}...`
              : inputStr;
          return (
            <Tooltip title={inputStr}>
              <Typography noWrap variant="body2">
                {truncated}
              </Typography>
            </Tooltip>
          );
        },
      },
      {
        id: "output",
        label: "Output",
        width: "12%",
        render: (value) => {
          if (!value) {
            return (
              <Typography variant="body2" color="text.secondary">
                -
              </Typography>
            );
          }
          const outputStr = value as string;
          const truncated =
            outputStr.length > 30
              ? `${outputStr.substring(0, 30)}...`
              : outputStr;
          return (
            <Tooltip title={outputStr}>
              <Typography noWrap variant="body2">
                {truncated}
              </Typography>
            </Tooltip>
          );
        },
      },
      {
        id: "startTime",
        label: "Start Time",
        width: "12%",
        render: (value) => (
          <Typography noWrap variant="body2">
            {dayjs(value as string).format("DD/MM/YYYY HH:mm:ss")}
          </Typography>
        ),
      },
      {
        id: "durationInSeconds",
        label: "Duration",
        width: "10%",
        render: (value) => (
          <Chip
            label={`${(value as number).toFixed(2)}s`}
            size="small"
            color={getDurationColor(value as number)}
            variant="outlined"
          />
        ),
      },
      {
        id: "tokenUsage",
        label: "Tokens",
        width: "8%",
        render: (value) => {
          if (!value) {
            return (
              <Typography variant="body2" color="text.secondary">
                -
              </Typography>
            );
          }
          const tokens = value as TraceRow["tokenUsage"];
          return (
            <Tooltip
              title={
                <Box>
                  <Typography variant="caption">
                    Input: {tokens?.inputTokens || 0}
                  </Typography>
                  <br />
                  <Typography variant="caption">
                    Output: {tokens?.outputTokens || 0}
                  </Typography>
                </Box>
              }
            >
              <Typography variant="body2">{tokens?.totalTokens || 0}</Typography>
            </Tooltip>
          );
        },
      },
      {
        id: "spanCount",
        label: "Spans",
        width: "13%",
        render: (value) => (
          <Typography variant="body2">{value as number}</Typography>
        ),
      },
    ],
    [getDurationColor, generateTraceDetailPath]
  );

  // Define initial state for sorting - most recent traces first
  const tableInitialState: InitialState<TraceRow> = useMemo(
    () => ({
      sorting: {
        sortModel: [
          {
            field: "startTime",
            sort: "desc",
          },
        ],
      },
    }),
    []
  );

  return (
    <FadeIn>
      <Box display="flex" flexDirection="column" gap={3}>
        {/* Overview Cards */}
        <TracesTopCards timeRange={timeRange} />
        
        {/* Filters Row: Time Range + Search + Refresh */}
        <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
          <Box display="flex" gap={2} alignItems="center" flex={1}>
            {/* Search Field */}
            <TextField
              size="small"
              placeholder="Search traces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              }}
            />
            {searchQuery && (
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                {filteredRows.length} of {rows.length} traces
              </Typography>
            )}
          </Box>
          
          {/* Time Range and Refresh */}
          <Box display="flex" gap={1}>
            {setTimeRange && (
              <Select
                size="small"
                variant="outlined"
                value={timeRange}
                startAdornment={
                  <InputAdornment position="start">
                    <AccessTimeOutlined size={16} />
                  </InputAdornment>
                }
                onChange={(e) =>
                  setTimeRange(e.target.value as TraceListTimeRange)
                }
              >
                {TIME_RANGE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            )}
            <IconButton
              disabled={isRefetching}
              color="primary"
              onClick={() => {
                refetch();
              }}
            >
              {isRefetching ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <RefreshCcw size={18} />
              )}
            </IconButton>
          </Box>
        </Box>

        {/* Traces Table */}
        {isLoading && <TracesTableSkeleton />}
        {filteredRows.length > 0 && (
          <Box sx={{ backgroundColor: "background.paper", borderRadius: 1 }}>
            <DataListingTable
              data={filteredRows}
              columns={columns}
              onRowClick={(row) => {
                if (onTraceClick) {
                  onTraceClick(row.traceId as string);
                } else {
                  navigate(generateTraceDetailPath(row.traceId as string));
                }
              }}
              pagination
              pageSize={10}
              maxRows={filteredRows.length}
              initialState={tableInitialState}
              emptyStateTitle="No traces found"
              emptyStateDescription="No traces found for the selected time range"
            />
          </Box>
        )}
        {filteredRows.length === 0 && !isLoading && (
          <NoDataFound
            message={searchQuery ? "No matching traces found!" : "No traces found!"}
            icon={<Workflow size={32} />}
            subtitle={searchQuery ? "Try a different search term" : "Try changing the time range"}
          />
        )}
      </Box>
    </FadeIn>
  );
}
