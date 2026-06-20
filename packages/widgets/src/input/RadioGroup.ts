// ─────────────────────────────────────────────────────
// @termuijs/widgets — RadioGroup widget
// A mutually-exclusive single-choice selection input
// ─────────────────────────────────────────────────────

import {
    type Screen,
    type Style,
    type Color,
    type KeyEvent,
    stringWidth,
    truncate,
    caps,
} from '@termuijs/core';
import { Widget } from '../base/Widget.js';

export interface RadioOption {
    /** Display label for this option */
    label: string;
    /** Underlying value for this option */
    value: string;
}

export interface RadioGroupOptions {
    /** Initially selected value. Default: undefined (none selected) */
    selectedValue?: string;
    /** Callback fired when selection changes */
    onChange?: (value: string) => void;
    /** Whether the whole group is disabled. Default: false */
    disabled?: boolean;
    /** Color of the selected indicator. Default: green */
    selectedColor?: Color;
}

/**
 * RadioGroup — a mutually-exclusive single-choice selection input.
 *
 * Renders as:
 *   (•) Light
 *   ( ) Dark
 *   ( ) System
 *
 * Press Up/Down to move focus between options.
 * Press Enter or Space to select the focused option.
 * Unicode fallback: uses '(*)' for selected, '( )' for unselected.
 */
export class RadioGroup extends Widget {
    private _options: RadioOption[];
    private _selectedValue?: string;
    private _disabled: boolean;
    private _onChange?: (value: string) => void;
    private _selectedColor: Color;
    private _focusedIndex: number = 0;

    constructor(
        options: RadioOption[],
        style: Partial<Style> = {},
        opts: RadioGroupOptions = {},
    ) {
        super(style);
        this.focusable = true;
        this._options = options.map(o => ({ ...o }));
        this._selectedValue = opts.selectedValue;
        this._disabled = opts.disabled ?? false;
        this._onChange = opts.onChange;
        this._selectedColor = opts.selectedColor ?? { type: 'named', name: 'green' };
    }

    // ── Public API ──────────────────────────────────────────────────────

    /** Select an option by value. No-op if already selected or value not found. */
    select(value: string): void {
        if (this._disabled) return;
        if (this._selectedValue === value) return;
        const exists = this._options.some(o => o.value === value);
        if (!exists) return;

        this._selectedValue = value;
        this._onChange?.(value);
        this.markDirty();
    }

    /** Returns the currently selected value, or undefined if none selected. */
    getSelected(): string | undefined {
        return this._selectedValue;
    }

    /** Replace all options. Clones input to prevent external mutation. */
    setOptions(options: RadioOption[]): void {
        this._options = options.map(o => ({ ...o }));
        this._focusedIndex = 0;
        this.markDirty();
    }

    /** Get a copy of the current options. */
    getOptions(): RadioOption[] {
        return this._options.map(o => ({ ...o }));
    }

    /** Returns the index of the currently keyboard-focused option. */
    getFocusedIndex(): number {
        return this._focusedIndex;
    }

    /** Enable or disable the whole group. No-op if unchanged. */
    setDisabled(disabled: boolean): void {
        if (this._disabled === disabled) return;
        this._disabled = disabled;
        this.markDirty();
    }

    /** Returns true if the group is disabled. */
    isDisabled(): boolean {
        return this._disabled;
    }

    // ── Keyboard ────────────────────────────────────────────────────────

    /**
     * Handle a key event. Call this from your app's key-routing logic
     * when this widget is focused.
     */
    handleKey(event: KeyEvent): void {
        if (this._disabled) return;

        switch (event.key.toLowerCase()) {
            case 'enter':
            case 'space':
                if (this._options[this._focusedIndex]) {
                    this.select(this._options[this._focusedIndex].value);
                }
                break;
            case 'arrowup':
            case 'up':
                if (this._focusedIndex > 0) {
                    this._focusedIndex--;
                    this.markDirty();
                }
                break;
            case 'arrowdown':
            case 'down':
                if (this._focusedIndex < this._options.length - 1) {
                    this._focusedIndex++;
                    this.markDirty();
                }
                break;
        }
    }

    // ── Render ──────────────────────────────────────────────────────────

    protected _renderSelf(screen: Screen): void {
        const { x, y, width, height } = this._rect;
        if (width <= 0 || height <= 0 || this._options.length === 0) return;

        const selectedChar = caps.unicode ? '•' : '*';
        const unselectedChar = ' ';
        const visibleCount = Math.min(this._options.length, height);

        for (let i = 0; i < visibleCount; i++) {
            const option = this._options[i];
            const isSelected = option.value === this._selectedValue;
            const isFocused = this.isFocused && i === this._focusedIndex;

            const mark = isSelected ? selectedChar : unselectedChar;
            const indicator = `(${mark})`;
            const indicatorWidth = stringWidth(indicator);

            const gap = ' ';
            const fullLine = indicator + gap + option.label;

            const markColor: Color = isSelected
                ? this._selectedColor
                : { type: 'named', name: 'white' };

            const labelColor: Color = this._disabled
                ? { type: 'named', name: 'brightBlack' }
                : { type: 'named', name: 'white' };

            const focusColor: Color = { type: 'named', name: 'cyan' };

            if (stringWidth(fullLine) > width) {
                screen.writeString(x, y + i, truncate(fullLine, width), { fg: labelColor });
                continue;
            }

            // Write '('
            screen.setCell(x, y + i, {
                char: '(',
                fg: isFocused ? focusColor : labelColor,
            });

            // Write mark char
            screen.setCell(x + 1, y + i, {
                char: mark,
                fg: markColor,
                bold: isSelected,
            });

            // Write ')'
            screen.setCell(x + 2, y + i, {
                char: ')',
                fg: isFocused ? focusColor : labelColor,
            });

            // Write ' Label'
            const labelX = x + indicatorWidth + stringWidth(gap);
            screen.writeString(labelX, y + i, option.label, {
                fg: labelColor,
                dim: this._disabled,
            });
        }
    }
}