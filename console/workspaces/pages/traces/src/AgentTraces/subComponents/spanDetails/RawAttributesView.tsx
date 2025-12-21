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

import { Box, Typography, Divider } from "@wso2/oxygen-ui";
import { Span } from "@agent-management-platform/types";
import { BasicInfoSection } from "./BasicInfoSection";
import { TimingSection } from "./TimingSection";
import { AttributesSection } from "./AttributesSection";

interface RawAttributesViewProps {
  span: Span;
}

export function RawAttributesView({ span }: RawAttributesViewProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: 3, backgroundColor: "#fafafa !important" }}>
      <BasicInfoSection span={span} />
      <Divider />
      <TimingSection span={span} />
      
      {span.attributes && Object.keys(span.attributes).length > 0 && (
        <>
          <Divider />
          <AttributesSection attributes={span.attributes} />
        </>
      )}

      {span.resource && Object.keys(span.resource).length > 0 && (
        <>
          <Divider />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Resource Attributes
            </Typography>
            <Box
              sx={{
                backgroundColor: "#ffffff !important",
                p: 2,
                borderRadius: 2,
                border: 1,
                borderColor: "divider",
                overflowX: "auto",
              }}
            >
              <Typography
                component="pre"
                variant="caption"
                sx={{
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {JSON.stringify(span.resource, null, 2)}
              </Typography>
            </Box>
          </Box>
        </>
      )}

      {span.ampAttributes && (
        <>
          <Divider />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              AMP Attributes
            </Typography>
            <Box
              sx={{
                backgroundColor: "#ffffff !important",
                p: 2,
                borderRadius: 2,
                border: 1,
                borderColor: "divider",
                overflowX: "auto",
              }}
            >
              <Typography
                component="pre"
                variant="caption"
                sx={{
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {JSON.stringify(span.ampAttributes, null, 2)}
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
