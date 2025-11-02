(function () {
    const vscode = acquireVsCodeApi();
    console.log('[ConfigWebview] Script loaded');

    const providersList = document.getElementById('providers-list');
    const modelsList = document.getElementById('models-list');
    const addProviderBtn = document.getElementById('add-provider-btn');
    const addModelBtn = document.getElementById('add-model-btn');
    const saveBtn = document.getElementById('save-config-btn');

    let providers = [];
    let models = [];

    // Global diagnostic for button clicks
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (!target) return;
        const btn = target.closest && target.closest('button');
        if (btn) {
            console.log('[ConfigWebview] Button click', {
                text: btn.innerText,
                classes: btn.className,
                id: btn.id || undefined,
            });
        }
    });

    // Request initial configuration
    console.log('[ConfigWebview] Posting load request to extension');
    vscode.postMessage({ command: 'load' });

    // Listen for messages from the extension
    window.addEventListener('message', (event) => {
        const message = event.data;
        console.log('[ConfigWebview] Received message from extension', message && message.command, message);
        switch (message.command) {
            case 'loadConfiguration':
                providers = message.providers || [];
                models = message.models || [];
                console.log('[ConfigWebview] Loaded configuration', { providersCount: providers.length, modelsCount: models.length });
                renderProviders();
                renderModels();
                break;
        }
    });

    // Event listeners
    addProviderBtn.addEventListener('click', () => {
        console.log('[ConfigWebview] addProvider called');
        providers.push({ key: '', baseUrl: '', displayName: '', defaults: {} });
        console.log('[ConfigWebview] providers length after add:', providers.length);
        renderProviders();
    });

    addModelBtn.addEventListener('click', () => {
        console.log('[ConfigWebview] addModel called');
        models.push({ id: '', provider: '', owned_by: '' });
        console.log('[ConfigWebview] models length after add:', models.length);
        renderModels();
    });

    saveBtn.addEventListener('click', () => {
        console.log('[ConfigWebview] saveConfiguration called', { providersCount: providers.length, modelsCount: models.length });

        const invalidProviders = providers.filter((p) => !p.key || !p.baseUrl);
        if (invalidProviders.length > 0) {
            alert('Please fill in required fields (key and baseUrl) for all providers.');
            return;
        }

        const invalidModels = models.filter((m) => !m.id);
        if (invalidModels.length > 0) {
            alert('Please fill in required field (id) for all models.');
            return;
        }

        const cleanProviders = providers.map((p) => {
            const cleaned = Object.assign({}, p);
            if (cleaned.defaults && Object.keys(cleaned.defaults).length === 0) {
                delete cleaned.defaults;
            }
            return cleaned;
        });

        console.log('[ConfigWebview] Posting save to extension', { cleanProviders, models });
        vscode.postMessage({ command: 'save', providers: cleanProviders, models });
    });

    // Delegated events for providers list
    providersList.addEventListener('click', (e) => {
        const target = e.target;
        if (!target) return;

        const removeBtn = target.closest && target.closest('button[data-action="remove-provider"]');
        if (removeBtn) {
            const index = parseInt(removeBtn.getAttribute('data-index'));
            console.log('[ConfigWebview] removeProvider called', { index });
            providers.splice(index, 1);
            renderProviders();
            return;
        }
    });

    providersList.addEventListener('change', (e) => {
        const t = e.target;
        if (!t) return;

        // Toggle defaults checkbox
        if (t.matches('input[type="checkbox"][data-action="toggle-defaults"]')) {
            const index = parseInt(t.getAttribute('data-index'));
            const enabled = !!t.checked;
            console.log('[ConfigWebview] toggleProviderDefaults', { index, enabled });
            if (enabled) {
                providers[index].defaults = providers[index].defaults || {};
            } else {
                delete providers[index].defaults;
            }
            renderProviders();
            return;
        }

        // Headers textarea
        if (t.matches('textarea[data-entity="provider"][data-field="headers"]')) {
            const index = parseInt(t.getAttribute('data-index'));
            try {
                const value = t.value;
                if (value.trim() === '') {
                    delete providers[index].headers;
                } else {
                    providers[index].headers = JSON.parse(value);
                }
            } catch (err) {
                console.error('[ConfigWebview] Invalid JSON for headers:', err);
            }
            return;
        }

        // Provider default fields
        if (t.matches('[data-entity="provider-default"][data-field]')) {
            const index = parseInt(t.getAttribute('data-index'));
            const field = t.getAttribute('data-field');
            let value = t.value;
            if (t.type === 'number') {
                value = value === '' ? '' : (t.step && t.step.indexOf('.') >= 0 ? parseFloat(value) : parseInt(value, 10));
            }
            console.log('[ConfigWebview] updateProviderDefault', { index, field, value });
            if (!providers[index].defaults) providers[index].defaults = {};
            if (value === '' || (typeof value === 'number' && isNaN(value))) {
                delete providers[index].defaults[field];
            } else {
                providers[index].defaults[field] = value;
            }
            return;
        }

        // Provider fields
        if (t.matches('[data-entity="provider"][data-field]')) {
            const index = parseInt(t.getAttribute('data-index'));
            const field = t.getAttribute('data-field');
            let value = t.value;
            if (t.type === 'number') {
                value = value === '' ? '' : parseInt(value, 10);
            }
            console.log('[ConfigWebview] updateProvider', { index, field, value });
            providers[index][field] = value === '' ? undefined : value;
            return;
        }
    });

    // Delegated events for models list
    modelsList.addEventListener('click', (e) => {
        const target = e.target;
        if (!target) return;

        const removeBtn = target.closest && target.closest('button[data-action="remove-model"]');
        if (removeBtn) {
            const index = parseInt(removeBtn.getAttribute('data-index'));
            console.log('[ConfigWebview] removeModel called', { index });
            models.splice(index, 1);
            renderModels();
            return;
        }
    });

    modelsList.addEventListener('change', (e) => {
        const t = e.target;
        if (!t) return;

        if (t.matches('[data-entity="model"][data-field]')) {
            const index = parseInt(t.getAttribute('data-index'));
            const field = t.getAttribute('data-field');
            let value = t.value;
            if (t.type === 'number') {
                value = value === '' ? '' : parseInt(value, 10);
            }
            if (t.type === 'checkbox') {
                value = !!t.checked;
            }
            if (field === 'temperature' || field === 'top_p') {
                value = value === '' ? null : parseFloat(value);
            }
            console.log('[ConfigWebview] updateModel', { index, field, value });
            if (value === '' || (typeof value === 'number' && isNaN(value))) {
                delete models[index][field];
            } else {
                models[index][field] = value;
            }
            return;
        }
    });

    function renderProviders() {
        console.log('[ConfigWebview] renderProviders', { count: providers.length });
        const container = providersList;
        if (providers.length === 0) {
            container.innerHTML = '<div class="empty-state">No providers configured. Click "Add Provider" to get started.</div>';
            return;
        }
        container.innerHTML = providers.map((provider, index) => {
            const defaults = provider.defaults || {};
            const defaultsHtml = (provider.defaults ? `
        <div class="collapsible-content">
          <div class="form-group">
            <label>Context Length</label>
            <input data-entity="provider-default" data-index="${index}" data-field="context_length" type="number" value="${defaults.context_length ?? ''}">
          </div>
          <div class="form-group">
            <label>Max Tokens</label>
            <input data-entity="provider-default" data-index="${index}" data-field="max_tokens" type="number" value="${defaults.max_tokens ?? ''}">
          </div>
          <div class="form-group">
            <label>Temperature (0-2)</label>
            <input data-entity="provider-default" data-index="${index}" data-field="temperature" type="number" step="0.1" value="${defaults.temperature ?? ''}">
          </div>
          <div class="form-group">
            <label>Top P (0-1)</label>
            <input data-entity="provider-default" data-index="${index}" data-field="top_p" type="number" step="0.1" value="${defaults.top_p ?? ''}">
          </div>
          <div class="form-group">
            <label>Family</label>
            <input data-entity="provider-default" data-index="${index}" data-field="family" type="text" placeholder="e.g., gpt-4, claude-3, gemini" value="${defaults.family ?? ''}">
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" data-entity="provider-default" data-field="vision" data-index="${index}" ${defaults.vision ? 'checked' : ''}>
              Vision Support
            </label>
          </div>
        </div>` : '');

            return `
        <div class="item">
          <div class="item-header">
            <h3>Provider ${index + 1}</h3>
            <div class="item-actions">
              <button class="secondary" data-action="remove-provider" data-index="${index}">Remove</button>
            </div>
          </div>
          <div class="form-group">
            <label>Key (required) *</label>
            <input data-entity="provider" data-index="${index}" data-field="key" type="text" placeholder="e.g., openai, anthropic" value="${provider.key || ''}">
            <div class="error" style="display: ${!provider.key ? 'block' : 'none'}">Key is required</div>
          </div>
          <div class="form-group">
            <label>Display Name</label>
            <input data-entity="provider" data-index="${index}" data-field="displayName" type="text" value="${provider.displayName || ''}">
          </div>
          <div class="form-group">
            <label>Base URL (required) *</label>
            <input data-entity="provider" data-index="${index}" data-field="baseUrl" type="text" placeholder="e.g., https://api.openai.com/v1" value="${provider.baseUrl || ''}">
            <div class="error" style="display: ${!provider.baseUrl ? 'block' : 'none'}">Base URL is required</div>
          </div>
          <div class="form-group">
            <label>Headers (JSON)</label>
            <textarea rows="3" data-entity="provider" data-index="${index}" data-field="headers" placeholder='{"X-Custom-Header": "value"}'>${provider.headers ? JSON.stringify(provider.headers, null, 2) : ''}</textarea>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" class="toggle-defaults" data-action="toggle-defaults" data-index="${index}" ${provider.defaults ? 'checked' : ''}>
              Configure Default Parameters
            </label>
          </div>
          ${defaultsHtml}
        </div>`;
        }).join('');
    }

    function renderModels() {
        console.log('[ConfigWebview] renderModels', { count: models.length });
        const container = modelsList;
        if (models.length === 0) {
            container.innerHTML = '<div class="empty-state">No models configured. Click "Add Model" to get started.</div>';
            return;
        }
        const providerOptions = providers.map((p) => {
            const name = (p.displayName || p.key || '').replace(/"/g, '&quot;');
            return `<option value="${p.key}">${name}</option>`;
        }).join('');

        container.innerHTML = models.map((model, index) => {
            const selProvider = model.provider || '';
            return `
        <div class="item">
          <div class="item-header">
            <h3>Model ${index + 1}</h3>
            <div class="item-actions">
              <button class="secondary" data-action="remove-model" data-index="${index}">Remove</button>
            </div>
          </div>
          <div class="form-group">
            <label>Model ID (required) *</label>
            <input data-entity="model" data-index="${index}" data-field="id" type="text" placeholder="e.g., gpt-4, claude-3-opus" value="${model.id || ''}">
            <div class="error" style="display: ${!model.id ? 'block' : 'none'}">Model ID is required</div>
          </div>
          <div class="form-group">
            <label>Display Name</label>
            <input data-entity="model" data-index="${index}" data-field="displayName" type="text" placeholder="Optional human-readable name" value="${model.displayName || ''}">
          </div>
          <div class="form-group">
            <label>Provider</label>
            <select data-entity="model" data-index="${index}" data-field="provider" value="${selProvider}">
              <option value="">Select a provider</option>
              ${providerOptions}
            </select>
          </div>
          <div class="form-group">
            <label>Owned By</label>
            <input data-entity="model" data-index="${index}" data-field="owned_by" type="text" placeholder="e.g., openai, anthropic" value="${model.owned_by || ''}">
          </div>
          <div class="form-group">
            <label>Config ID</label>
            <input data-entity="model" data-index="${index}" data-field="configId" type="text" placeholder="Optional: e.g., thinking, fast" value="${model.configId || ''}">
          </div>
          <div class="form-group">
            <label>Base URL (override)</label>
            <input data-entity="model" data-index="${index}" data-field="baseUrl" type="text" placeholder="Leave empty to use provider base URL" value="${model.baseUrl || ''}">
          </div>
          <div class="form-group">
            <label>Family</label>
            <input data-entity="model" data-index="${index}" data-field="family" type="text" placeholder="e.g., gpt-4, claude-3, gemini" value="${model.family || ''}">
          </div>
          <div class="form-group">
            <label>Context Length</label>
            <input data-entity="model" data-index="${index}" data-field="context_length" type="number" value="${model.context_length || ''}">
          </div>
          <div class="form-group">
            <label>Max Tokens</label>
            <input data-entity="model" data-index="${index}" data-field="max_tokens" type="number" value="${model.max_tokens || ''}">
          </div>
          <div class="form-group">
            <label>Temperature (0-2)</label>
            <input data-entity="model" data-index="${index}" data-field="temperature" type="number" step="0.1" value="${(model.temperature != null ? model.temperature : '')}">
          </div>
          <div class="form-group">
            <label>Top P (0-1)</label>
            <input data-entity="model" data-index="${index}" data-field="top_p" type="number" step="0.1" value="${(model.top_p != null ? model.top_p : '')}">
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input data-entity="model" data-index="${index}" data-field="vision" type="checkbox" ${model.vision ? 'checked' : ''}>
              Vision Support
            </label>
          </div>
        </div>`;
        }).join('');

        // Set selected provider value for each select
        const selects = container.querySelectorAll('select[data-field="provider"]');
        selects.forEach((sel, i) => {
            sel.value = models[i].provider || '';
        });
    }
})();
