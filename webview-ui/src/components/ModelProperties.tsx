/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import type { ModelProperties, ProviderConfig } from '../../../src/types';
import { prettyJson, tryParseJson, parseIntOrUndef } from '../utils';
import {
    VscodeTextfield,
    VscodeTextarea,
    VscodeSingleSelect,
    VscodeOption,
    VscodeFormHelper,
} from '@vscode-elements/react-elements';

export interface ModelPropertiesProps {
    value: ModelProperties;
    providers: ProviderConfig[];
    onChange: (field: keyof ModelProperties, value: any) => void;
}

const ModelPropertiesForm: React.FC<ModelPropertiesProps> = ({ value, providers, onChange }) => {
    const update = (field: keyof ModelProperties, v: any) => {
        if (v === '' || (typeof v === 'number' && Number.isNaN(v))) {
            onChange(field, undefined);
        } else {
            onChange(field, v);
        }
    };

    const providerOptions = providers.map((p) => (
        <VscodeOption key={p.key} value={p.key}>
            {p.displayName || p.key}
        </VscodeOption>
    ));

    return (
        <div className="collapsible-content">
            <h4>
                Model properties <small>(internal — not sent to provider)</small>
            </h4>
            {/* Config ID moved to top-level ModelItem; edited in Models.tsx */}

            <div className="form-field">
                <VscodeFormHelper>Context Length</VscodeFormHelper>
                <VscodeTextfield
                    type="number"
                    value={(value?.context_length as unknown as string) ?? ''}
                    onInput={(e: any) => update('context_length', parseIntOrUndef(e.currentTarget.value))}
                >
                </VscodeTextfield>
            </div>

            <div className="form-field">
                <VscodeFormHelper>Family</VscodeFormHelper>
                <VscodeTextfield
                    type="text"
                    placeholder="e.g., gpt-4, claude-3, gemini"
                    value={(value?.family as unknown as string) ?? ''}
                    onInput={(e: any) => update('family', e.currentTarget.value)}
                >
                </VscodeTextfield>
            </div>
        </div>
    );
};

export default ModelPropertiesForm;
