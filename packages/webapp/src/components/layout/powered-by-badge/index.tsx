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

/*
 * Modified for wm.savethemall.eu (2026-11-01): the WPL Exhibit B requires the
 * "powered by WiseMapping" text on each user interface screen, in the same
 * position, linking to http://www.wisemapping.com. The login/forgot-password
 * footer and the editor's view-mode creator pane already carry it, but the
 * maps list, the editor in edit/try mode and the error pages did not.
 * This badge is rendered once by the root route, so every screen gets it at the
 * same place (bottom-left). It hides itself when the editor's own creator pane
 * (same logo, same corner) is on screen, to avoid stacking two marks.
 */
import React from 'react';
import { styled } from '@mui/material/styles';
import poweredByIcon from '../footer/pwrdby-white.svg';

const Badge = styled('a')({
  position: 'fixed',
  left: '12px',
  bottom: '12px',
  zIndex: 1200,
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 8px',
  borderRadius: '6px',
  backgroundColor: 'rgba(0, 0, 0, 0.55)',
  lineHeight: 0,
  '& img': { height: '20px', width: 'auto' },
  // Only the creator pane carries the logo link; the floating toolbars share the inset attribute.
  'body:has([data-canvas-inset="bottom"] > a[href*="wisemapping.com"]) &': { display: 'none' },
  '@media print': { position: 'absolute' },
});

const PoweredByBadge = (): React.ReactElement => (
  <Badge
    className="wm-powered-by-badge"
    href="http://www.wisemapping.com"
    target="_blank"
    rel="noopener noreferrer"
    title="Powered by WiseMapping"
  >
    <img src={poweredByIcon} alt="Powered by WiseMapping" />
  </Badge>
);

export default PoweredByBadge;
