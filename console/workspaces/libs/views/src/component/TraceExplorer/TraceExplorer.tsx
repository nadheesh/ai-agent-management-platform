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

import { Span } from '@agent-management-platform/types';
import {
  Box,
  ButtonBase,
  Chip,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from '@wso2/oxygen-ui';
import { useCallback, useMemo, useState } from 'react';
import {
  Clock,
  Brain,
  ChevronDown,
  Minus,
  Languages,
  DollarSign,
  HandCoins,
  XCircle,
  Wrench,
  Sparkles,
  Workflow,
  Bot,
  Database,
} from '@wso2/oxygen-ui-icons-react';
import { TraceEntityPreview } from './TraceEntityPreview';

interface TraceExplorerProps {
  spans: Span[];
  onSpanClick: (span: Span) => void;
  selectedSpanId?: string;
}

interface RenderSpan {
  span: Span;
  children: RenderSpan[];
  key: string;
  parentKey: string | null;
  childrenKeys: string[] | null;
}

function formatDuration(durationInNanos: number) {
  if (durationInNanos > 1000 * 1000 * 1000) {
    return `${(durationInNanos / (1000 * 1000 * 1000)).toFixed(2)}s`;
  }
  if (durationInNanos > 1000 * 1000) {
    return `${(durationInNanos / (1000 * 1000)).toFixed(2)}ms`;
  }
  return `${(durationInNanos / 1000).toFixed(2)}μs`;
}
const populateRenderSpans = (
  spans: Span[]
): {
  renderSpanMap: Map<string, RenderSpan>;
  rootSpans: string[];
} => {
  // Sort spans by start time (earliest first)
  const sortedSpans = [...spans].sort((a, b) => {
    const timeA = new Date(a.startTime).getTime();
    const timeB = new Date(b.startTime).getTime();
    return timeA - timeB;
  });

  // First pass: Build a map of spanId -> array of child spanIds
  const childrenMap = new Map<string, string[]>();
  const rootSpans: string[] = [];

  sortedSpans.forEach((span) => {
    if (span.parentSpanId) {
      const children = childrenMap.get(span.parentSpanId) || [];
      children.push(span.spanId);
      childrenMap.set(span.parentSpanId, children);
    } else {
      rootSpans.push(span.spanId);
    }
  });

  // Second pass: Create RenderSpan objects and store them in a Map keyed by spanId
  const renderSpanMap = new Map<string, RenderSpan>();

  sortedSpans.forEach((span) => {
    const childrenKeys = childrenMap.get(span.spanId) || null;
    renderSpanMap.set(span.spanId, {
      span,
      children: [],
      key: span.spanId,
      parentKey: span.parentSpanId || null,
      childrenKeys: childrenKeys,
    });
  });

  return { renderSpanMap, rootSpans };
};

// Helper function to get span type icon
const getSpanTypeIcon = (span: Span) => {
  const ampKind = span.ampAttributes?.kind;
  
  switch (ampKind) {
    case 'llm':
      return <Brain size={20} />;
    case 'tool':
      return <Wrench size={20} />;
    case 'embedding':
      return <Sparkles size={20} />;
    case 'agent':
      return <Bot size={20} />;
    case 'chain':
    case 'task':
      return <Workflow size={20} />;
    case 'retriever':
      return <Database size={20} />;
    default:
      return null; // No icon for unknown types
  }
};

export function TraceExplorer(props: TraceExplorerProps) {
  const { spans, onSpanClick, selectedSpanId } = props;
  const theme = useTheme();

  const renderSpan = useCallback(
    (
      key: string,
      renderSpanMap: Map<string, RenderSpan>,
      expandedSpans: Record<string, boolean>,
      toggleExpanded: (key: string) => void,
      isLastChild?: boolean,
      isRoot?: boolean
    ) => {
      const span = renderSpanMap.get(key);
      if (!span) {
        return null;
      }
      const expanded = expandedSpans[key];
      const hasChildren = span.childrenKeys && span.childrenKeys.length > 0;
      return (
        <Box
          key={key}
          display="flex"
          position="relative"
          flexDirection="column"
          flexGrow={1}
        >
          {/* Connecting lines - only show for non-root nodes */}
          {!isRoot && (
            <>
              {/* Horizontal line */}
              <Box
                position="absolute"
                sx={{
                  width: 32,
                  height: 44,
                  borderLeft: isLastChild
                    ? `2px solid ${theme.palette.primary.main}`
                    : 'none',
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                  left: -32,
                  top: -22,
                  borderBottomLeftRadius: isLastChild ? '4px' : 0,
                }}
              />
              {/* Vertical line continuing down (only if not last child) */}
              {!isLastChild && (
                <Box
                  position="absolute"
                  sx={{
                    width: 2,
                    height: '100%',
                    background: theme.palette.primary.main,
                    left: -32,
                    top: -22,
                  }}
                />
              )}
            </>
          )}

          <ButtonBase
            onClick={() => onSpanClick(span.span)}
            sx={{
              width: '100%',
              mb: 0.5,
              justifyContent: 'space-between',
              textAlign: 'left',
              flexGrow: 1,
              display: 'flex',
              px: 2,
              py: 1.5,
              borderRadius: 1,
              border: selectedSpanId === span.span.spanId
                ? `2px solid ${theme.palette.primary.main}`
                : `1px solid ${theme.palette.divider}`,
              transition: 'all 0.2s ease-in-out',
              backgroundColor: selectedSpanId === span.span.spanId
                ? 'primary.50'
                : '#fafafa',
              '&:hover': {
                backgroundColor: selectedSpanId === span.span.spanId
                  ? 'primary.50'
                  : 'action.hover',
                borderColor: selectedSpanId === span.span.spanId
                  ? theme.palette.primary.main
                  : theme.palette.primary.light,
              },
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              height="100%"
              flexDirection="row"
              gap={1.5}
              flex={1}
            >
              <IconButton
                disabled={!hasChildren}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  toggleExpanded(key);
                }}
                size="small"
                sx={{
                  color: hasChildren ? 'primary.main' : 'action.disabled',
                }}
              >
                {hasChildren ? (
                  <Box
                    component="span"
                    sx={{
                      transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      display: 'inline-flex',
                      transition: 'transform 0.2s ease-in-out',
                    }}
                  >
                    <ChevronDown size={18} />
                  </Box>
                ) : (
                  <Minus size={18} />
                )}
              </IconButton>
              
              {/* Span Type Icon - Larger and more prominent */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  backgroundColor: 'primary.50',
                  color: 'primary.main',
                  flexShrink: 0,
                }}
              >
                {getSpanTypeIcon(span.span)}
              </Box>
              
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                gap={0.5}
                flex={1}
                minWidth={0}
              >
                <Box
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  gap={1}
                  flexWrap="wrap"
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {span.span.name}
                  </Typography>
                  
                  <Chip
                    icon={<Clock size={14} />}
                    label={formatDuration(span.span.durationInNanos)}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20 }}
                  />
                  
                  {span.span.status === '2' && (
                    <Chip
                      icon={<XCircle size={14} />}
                      color="error"
                      label="Error"
                      size="small"
                      variant="filled"
                      sx={{ height: 20 }}
                    />
                  )}
                </Box>
                
                <Box display="flex" flexDirection="row" gap={0.5} alignItems="center" flexWrap="wrap">
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {span.span.spanId}
                  </Typography>
                  <TraceEntityPreview span={span.span} />
                </Box>
              </Box>
            </Box>
            <Box
              p={1}
              display="flex"
              gap={1}
              alignItems="flex-end"
              justifyContent="right"
            >
              <Box display="flex" flexDirection="row" gap={1}>
                {!!span.span?.attributes?.['gen_ai.request.model'] && (
                  <Tooltip title={'GenAI Model'}>
                    <Chip
                      icon={<Brain size={16} />}
                      label={
                        span.span?.attributes?.['gen_ai.request.model'] as string
                      }
                      color="default"
                      size="small"
                      variant="outlined"
                    />
                  </Tooltip>
                )}
                {!!span.span?.attributes?.[
                  'traceloop.association.properties.ls_model_type'
                ] && (
                  <Tooltip title={'Language Service Model Type'}>
                    <Chip
                      icon={<Languages size={16} />}
                      label={
                        span.span?.attributes?.[
                          'traceloop.association.properties.ls_model_type'
                        ] as string
                      }
                      size="small"
                      variant="outlined"
                    />
                  </Tooltip>
                )}
                {!!span.span?.attributes?.['gen_ai.usage.completion_tokens'] && (
                  <Tooltip title={'Completion Tokens'}>
                    <Chip
                      icon={<DollarSign size={16} />}
                      label={
                        span.span?.attributes?.[
                          'gen_ai.usage.completion_tokens'
                        ] as string
                      }
                      color="default"
                      size="small"
                      variant="outlined"
                    />
                  </Tooltip>
                )}
                {!!span.span?.attributes?.['gen_ai.usage.prompt_tokens'] && (
                  <Tooltip title={'Prompt Tokens'}>
                    <Chip
                      icon={<HandCoins size={16} />}
                      label={
                        span.span?.attributes?.[
                          'gen_ai.usage.prompt_tokens'
                        ] as string
                      }
                      color="default"
                      size="small"
                      variant="outlined"
                    />
                  </Tooltip>
                )}
              </Box>
            </Box>
          </ButtonBase>
          {hasChildren && (
            <Collapse in={expanded} unmountOnExit>
              <Box
                display="flex"
                flexDirection="column"
                pl={4}
                position="relative"
              >
                {span.childrenKeys?.map((childKey, index) => (
                  <Box key={childKey} display="flex" position="relative">
                    {renderSpan(
                      childKey,
                      renderSpanMap,
                      expandedSpans,
                      toggleExpanded,
                      index === (span.childrenKeys?.length || 0) - 1,
                      false
                    )}
                  </Box>
                ))}
              </Box>
            </Collapse>
          )}
        </Box>
      );
    },
    [onSpanClick, selectedSpanId, theme]
  );

  const [expandedSpans, setExpandedSpans] = useState<Record<string, boolean>>(
    () => {
      // Expand all spans by default
      return spans.reduce(
        (acc, span) => {
          acc[span.spanId] = true;
          return acc;
        },
        {} as Record<string, boolean>
      );
    }
  );

  const renderSpans = useMemo(() => populateRenderSpans(spans), [spans]);

  const renderedSpans = useMemo(() => {
    const toggleExpanded = (key: string) => {
      setExpandedSpans((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    };
    return renderSpans.rootSpans.map((rootSpan, index) => (
      <Box key={rootSpan} mb={2} display="flex" flexGrow={1}>
        {renderSpan(
          rootSpan,
          renderSpans.renderSpanMap,
          expandedSpans,
          toggleExpanded,
          index === renderSpans.rootSpans.length - 1,
          true // isRoot
        )}
      </Box>
    ));
  }, [renderSpans, expandedSpans, renderSpan]);

  return (
    <Box display="flex" gap={2}>
      <Box position="relative" display="flex" flexGrow={1}>
        {renderedSpans}
      </Box>
    </Box>
  );
}
