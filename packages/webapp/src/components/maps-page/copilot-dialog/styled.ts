/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import { alpha, styled } from '@mui/material/styles';
import type { CopilotLocality } from '../../../classes/client';

const notStyleProp = (prop: PropertyKey): boolean => prop !== 'locality' && prop !== 'compact';

type BadgeProps = {
  locality: CopilotLocality;
  compact?: boolean;
};

/**
 * Where the copilot sends a prompt. Never colour alone: the badge always carries an icon and a
 * text, the text stays in `text.primary` for contrast, and colour only tints the border, the
 * background and the icon (success = stays in the network, warning = leaves it).
 */
export const LocalityBadgeRoot = styled('span', { shouldForwardProp: notStyleProp })<BadgeProps>(({
  theme,
  locality,
  compact,
}) => {
  const tone = locality === 'local' ? theme.palette.success : theme.palette.warning;
  const radius = theme.shape.borderRadius;
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: compact ? theme.spacing(0, 0.75) : theme.spacing(0.5, 1.25),
    borderRadius: typeof radius === 'number' ? radius * 4 : radius,
    border: `1px solid ${tone.main}`,
    backgroundColor: alpha(tone.main, 0.12),
    color: theme.palette.text.primary,
    fontSize: compact ? theme.typography.caption.fontSize : theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    lineHeight: 1.6,
    whiteSpace: 'nowrap',
    textTransform: 'none',
    '& svg': {
      color: tone.dark,
      fontSize: compact ? '1rem' : '1.15rem',
    },
    ...theme.applyStyles('dark', {
      backgroundColor: alpha(tone.main, 0.22),
      '& svg': { color: tone.light },
    }),
  };
});

export const CopilotForm = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  paddingTop: theme.spacing(1),
}));
