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

import React from 'react';
import { useIntl } from 'react-intl';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import PublicOutlined from '@mui/icons-material/PublicOutlined';
import type { CopilotLocality } from '../../../classes/client';
import { LocalityBadgeRoot } from './styled';

type LocalityBadgeProps = {
  locality: CopilotLocality;
  provider?: string;
  /** Short form ("Local" / "External") for the toolbar button. */
  compact?: boolean;
};

/** Full sentence describing where a prompt goes, used by the badge and as tooltips. */
export const useLocalityText = (): ((locality: CopilotLocality, provider?: string) => string) => {
  const intl = useIntl();
  return (locality, provider) => {
    if (locality === 'local') {
      return intl.formatMessage({
        id: 'copilot.locality.local',
        defaultMessage: 'Local — stays in your network',
      });
    }
    return provider
      ? intl.formatMessage(
          { id: 'copilot.locality.external', defaultMessage: 'External — sent to {provider}' },
          { provider },
        )
      : intl.formatMessage({
          id: 'copilot.locality.external-unnamed',
          defaultMessage: 'External — leaves your network',
        });
  };
};

const LocalityBadge = ({
  locality,
  provider,
  compact = false,
}: LocalityBadgeProps): React.ReactElement => {
  const intl = useIntl();
  const localityText = useLocalityText();
  const full = localityText(locality, provider);
  const text = compact
    ? locality === 'local'
      ? intl.formatMessage({ id: 'copilot.locality.local-short', defaultMessage: 'Local' })
      : intl.formatMessage({ id: 'copilot.locality.external-short', defaultMessage: 'External' })
    : full;

  return (
    <LocalityBadgeRoot
      locality={locality}
      compact={compact}
      data-testid="copilot-locality-badge"
      data-locality={locality}
      // The compact form keeps the full sentence for assistive technologies.
      aria-label={full}
      role="note"
    >
      {locality === 'local' ? (
        <HomeOutlined aria-hidden="true" />
      ) : (
        <PublicOutlined aria-hidden="true" />
      )}
      <span aria-hidden={compact ? 'true' : undefined}>{text}</span>
    </LocalityBadgeRoot>
  );
};

export default LocalityBadge;
