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

import { fireEvent, screen, waitFor, within } from '@testing-library/react';

import CopilotDialog, {
  COPILOT_PROMPT_MAX_LENGTH,
} from '../../../src/components/maps-page/copilot-dialog';
import Client, { CopilotMapResult, CopilotModel } from '../../../src/classes/client';
import { renderWithProviders } from '../helpers/render';

const local: CopilotModel = {
  id: 'local-alias',
  label: 'On-prem model',
  locality: 'local',
  provider: '',
};
const external: CopilotModel = {
  id: 'cloud-alias',
  label: 'Cloud model',
  locality: 'external',
  provider: 'Cloud Inc',
};

const mockCreate = jest.fn<Promise<CopilotMapResult>, [unknown]>();
const client = { createMapWithCopilot: mockCreate } as unknown as Client;

const renderDialog = (models: CopilotModel[] = [local]) =>
  renderWithProviders(<CopilotDialog models={models} onClose={jest.fn()} />, { client });

const badge = (): HTMLElement => screen.getByTestId('copilot-locality-badge');

const typePrompt = (text: string): void => {
  fireEvent.change(screen.getByRole('textbox', { name: /What should the map be about/ }), {
    target: { value: text },
  });
};

const resultFor = (overrides: Partial<CopilotMapResult>): CopilotMapResult => ({
  id: 42,
  title: 'Tea',
  model: local,
  servedModel: 'qwen3.5:9b',
  actualLocality: 'local',
  routingWarning: false,
  ...overrides,
});

describe('CopilotDialog', () => {
  beforeEach(() => jest.clearAllMocks());

  test('shows a local model with a "stays in your network" badge and a plain Generate button', () => {
    renderDialog();

    expect(badge().getAttribute('data-locality')).toBe('local');
    expect(within(badge()).getByText('Local — stays in your network')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Generate' })).toBeDefined();
    // One model: no selector.
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  test('the badge and the Generate button follow the selected external model', async () => {
    renderDialog([local, external]);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(await screen.findByRole('option', { name: 'Cloud model' }));

    expect(badge().getAttribute('data-locality')).toBe('external');
    expect(within(badge()).getByText('External — sent to Cloud Inc')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Send to Cloud Inc and generate' })).toBeDefined();
  });

  test('an external model without provider still says the request leaves the network', () => {
    renderDialog([{ ...external, provider: '' }]);

    expect(within(badge()).getByText('External — leaves your network')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Send outside and generate' })).toBeDefined();
  });

  test('the prompt takes as many characters as the server accepts', () => {
    renderDialog();
    const prompt = screen.getByRole('textbox', {
      name: /What should the map be about/,
    }) as HTMLTextAreaElement;
    expect(prompt.maxLength).toBe(COPILOT_PROMPT_MAX_LENGTH);
  });

  test('sends the prompt, the UI language and the chosen model, then reports a local generation', async () => {
    mockCreate.mockResolvedValue(resultFor({}));
    renderDialog([local, external]);

    typePrompt('A map about tea');
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    await waitFor(() =>
      expect(mockCreate).toHaveBeenCalledWith({
        prompt: 'A map about tea',
        language: 'en',
        model: 'local-alias',
      }),
    );
    const notice = await screen.findByTestId('copilot-result');
    expect(notice.getAttribute('data-actual-locality')).toBe('local');
    expect(notice.textContent).toContain('Generated locally by qwen3.5:9b');
    expect(screen.getByRole('button', { name: 'Open the map' })).toBeDefined();
  });

  test('reports an external generation with its provider', async () => {
    mockCreate.mockResolvedValue(
      resultFor({ model: external, servedModel: 'cloud-large-2', actualLocality: 'external' }),
    );
    renderDialog([external]);

    typePrompt('tea');
    fireEvent.click(screen.getByRole('button', { name: 'Send to Cloud Inc and generate' }));

    const notice = await screen.findByTestId('copilot-result');
    expect(notice.getAttribute('data-actual-locality')).toBe('external');
    expect(notice.textContent).toContain('Generated externally by cloud-large-2, at Cloud Inc.');
  });

  test('warns when the answer came from another model than the one requested', async () => {
    mockCreate.mockResolvedValue(
      resultFor({
        model: external,
        servedModel: 'ollama_chat/qwen3.5:9b',
        actualLocality: 'unverified',
        routingWarning: true,
      }),
    );
    renderDialog([external]);

    typePrompt('tea');
    fireEvent.click(screen.getByRole('button', { name: 'Send to Cloud Inc and generate' }));

    const notice = await screen.findByTestId('copilot-result');
    expect(notice.textContent).toContain(
      'Cloud model was answered by ollama_chat/qwen3.5:9b instead of the expected model.',
    );
  });

  test('shows the server message when the generation is refused', async () => {
    mockCreate.mockRejectedValue({
      msg: 'The local AI model did not answer from the local network, so no map was created.',
      status: 502,
    });
    renderDialog();

    typePrompt('tea');
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    expect(
      await screen.findByText(
        'The local AI model did not answer from the local network, so no map was created.',
      ),
    ).toBeDefined();
    expect(screen.queryByTestId('copilot-result')).toBeNull();
  });
});
