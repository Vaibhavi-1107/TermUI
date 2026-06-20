// ─────────────────────────────────────────────────────
// @termuijs/widgets — Tests for RadioGroup widget
// ─────────────────────────────────────────────────────

import { describe, it, expect, vi, afterEach } from 'vitest';
import { RadioGroup, type RadioOption } from './RadioGroup.js';
import { Screen, caps } from '@termuijs/core';
import type { KeyEvent } from '@termuijs/core';

afterEach(() => {
    vi.restoreAllMocks();
});

const OPTIONS: RadioOption[] = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
];

/** Helper: build a typed KeyEvent for keyboard tests. */
function makeKeyEvent(key: string): KeyEvent {
    return { key, ctrl: false, alt: false, shift: false } as KeyEvent;
}

/** Helper: create widget, set rect, render to a screen, return both. */
function renderRadioGroup(
    options: RadioOption[] = OPTIONS,
    opts: ConstructorParameters<typeof RadioGroup>[2] = {},
    width = 30,
    height = 5,
) {
    const radioGroup = new RadioGroup(options, {}, opts);
    const screen = new Screen(width, height);
    radioGroup.updateRect({ x: 0, y: 0, width, height });
    radioGroup.render(screen);
    return { radioGroup, screen };
}

function rowText(screen: Screen, row: number): string {
    return screen.back[row].map(c => c.char).join('').trimEnd();
}

function cellAt(screen: Screen, row: number, col: number) {
    return screen.back[row]?.[col];
}

describe('RadioGroup', () => {

    // ── 1. Default render ────────────────────────────────────────────────
    describe('1. Default render', () => {
        it('renders all option labels', () => {
            vi.spyOn(caps, 'unicode', 'get').mockReturnValue(true);
            const { screen } = renderRadioGroup();
            expect(rowText(screen, 0)).toContain('Light');
            expect(rowText(screen, 1)).toContain('Dark');
            expect(rowText(screen, 2)).toContain('System');
        });

        it('renders no option selected by default', () => {
            vi.spyOn(caps, 'unicode', 'get').mockReturnValue(true);
            const { screen } = renderRadioGroup();
            expect(rowText(screen, 0)).toContain('( )');
            expect(rowText(screen, 1)).toContain('( )');
        });

        it('renders selected option with selectedValue option', () => {
            vi.spyOn(caps, 'unicode', 'get').mockReturnValue(true);
            const { screen } = renderRadioGroup(OPTIONS, { selectedValue: 'dark' });
            expect(rowText(screen, 1)).toContain('(•)');
        });

        it('selected mark has green color', () => {
            vi.spyOn(caps, 'unicode', 'get').mockReturnValue(true);
            const { screen } = renderRadioGroup(OPTIONS, { selectedValue: 'light' });
            const cell = cellAt(screen, 0, 1);
            expect(cell?.fg).toEqual({ type: 'named', name: 'green' });
        });

        it('selected mark is bold', () => {
            vi.spyOn(caps, 'unicode', 'get').mockReturnValue(true);
            const { screen } = renderRadioGroup(OPTIONS, { selectedValue: 'light' });
            const cell = cellAt(screen, 0, 1);
            expect(cell?.bold).toBe(true);
        });
    });

    // ── 2. select() ──────────────────────────────────────────────────────
    describe('2. select()', () => {
        it('select() sets the selected value', () => {
            const { radioGroup } = renderRadioGroup();
            radioGroup.select('dark');
            expect(radioGroup.getSelected()).toBe('dark');
        });

        it('select() calls markDirty', () => {
            const { radioGroup } = renderRadioGroup();
            const spy = vi.spyOn(radioGroup, 'markDirty');
            radioGroup.select('dark');
            expect(spy).toHaveBeenCalled();
        });

        it('select() fires onChange callback', () => {
            const onChange = vi.fn();
            const { radioGroup } = renderRadioGroup(OPTIONS, { onChange });
            radioGroup.select('system');
            expect(onChange).toHaveBeenCalledWith('system');
        });

        it('select() ignores unknown value', () => {
            const { radioGroup } = renderRadioGroup();
            radioGroup.select('nonexistent');
            expect(radioGroup.getSelected()).toBeUndefined();
        });

        it('select() does not mark dirty when value unchanged', () => {
            const { radioGroup } = renderRadioGroup(OPTIONS, { selectedValue: 'dark' });
            radioGroup.clearDirty();
            radioGroup.select('dark');
            expect(radioGroup.isDirty).toBe(false);
        });

        it('select() is no-op when disabled', () => {
            const onChange = vi.fn();
            const { radioGroup } = renderRadioGroup(OPTIONS, { disabled: true, onChange });
            radioGroup.select('dark');
            expect(radioGroup.getSelected()).toBeUndefined();
            expect(onChange).not.toHaveBeenCalled();
        });
    });

    // ── 3. Keyboard navigation ───────────────────────────────────────────
    describe('3. Keyboard navigation', () => {
        it('down key moves focus to next option', () => {
            const { radioGroup } = renderRadioGroup();
            expect(radioGroup.getFocusedIndex()).toBe(0);
            radioGroup.handleKey(makeKeyEvent('down'));
            expect(radioGroup.getFocusedIndex()).toBe(1);
        });

        it('up key moves focus to previous option', () => {
            const { radioGroup } = renderRadioGroup();
            radioGroup.handleKey(makeKeyEvent('down'));
            radioGroup.handleKey(makeKeyEvent('up'));
            expect(radioGroup.getFocusedIndex()).toBe(0);
        });

        it('up key does not go below 0', () => {
            const { radioGroup } = renderRadioGroup();
            radioGroup.handleKey(makeKeyEvent('up'));
            expect(radioGroup.getFocusedIndex()).toBe(0);
        });

        it('down key does not exceed last index', () => {
            const { radioGroup } = renderRadioGroup();
            radioGroup.handleKey(makeKeyEvent('down'));
            radioGroup.handleKey(makeKeyEvent('down'));
            radioGroup.handleKey(makeKeyEvent('down'));
            expect(radioGroup.getFocusedIndex()).toBe(2);
        });

        it('enter key selects the focused option', () => {
            const { radioGroup } = renderRadioGroup();
            radioGroup.handleKey(makeKeyEvent('down'));
            radioGroup.handleKey(makeKeyEvent('enter'));
            expect(radioGroup.getSelected()).toBe('dark');
        });

        it('space key selects the focused option', () => {
            const { radioGroup } = renderRadioGroup();
            radioGroup.handleKey(makeKeyEvent('space'));
            expect(radioGroup.getSelected()).toBe('light');
        });

        it('keyboard selection does nothing when disabled', () => {
            const { radioGroup } = renderRadioGroup(OPTIONS, { disabled: true });
            radioGroup.handleKey(makeKeyEvent('enter'));
            expect(radioGroup.getSelected()).toBeUndefined();
        });

        it('other keys are ignored', () => {
            const { radioGroup } = renderRadioGroup();
            const before = radioGroup.getFocusedIndex();
            radioGroup.handleKey(makeKeyEvent('a'));
            expect(radioGroup.getFocusedIndex()).toBe(before);
        });
    });

    // ── 4. setOptions ─────────────────────────────────────────────────────
    describe('4. setOptions()', () => {
        it('replaces options and resets focus', () => {
            const { radioGroup } = renderRadioGroup();
            radioGroup.handleKey(makeKeyEvent('down'));
            radioGroup.setOptions([{ label: 'New', value: 'new' }]);
            expect(radioGroup.getOptions()).toHaveLength(1);
            expect(radioGroup.getFocusedIndex()).toBe(0);
        });

        it('calls markDirty', () => {
            const { radioGroup } = renderRadioGroup();
            const spy = vi.spyOn(radioGroup, 'markDirty');
            radioGroup.setOptions([{ label: 'X', value: 'x' }]);
            expect(spy).toHaveBeenCalled();
        });
    });

    // ── 5. setDisabled ────────────────────────────────────────────────────
    describe('5. setDisabled()', () => {
        it('setDisabled(true) disables the group', () => {
            const { radioGroup } = renderRadioGroup();
            radioGroup.setDisabled(true);
            expect(radioGroup.isDisabled()).toBe(true);
        });

        it('setDisabled calls markDirty', () => {
            const { radioGroup } = renderRadioGroup();
            const spy = vi.spyOn(radioGroup, 'markDirty');
            radioGroup.setDisabled(true);
            expect(spy).toHaveBeenCalled();
        });

        it('setDisabled does not mark dirty when unchanged', () => {
            const { radioGroup } = renderRadioGroup();
            radioGroup.clearDirty();
            radioGroup.setDisabled(false);
            expect(radioGroup.isDirty).toBe(false);
        });
    });

    // ── 6. Unicode fallback ───────────────────────────────────────────────
    describe('6. Unicode fallback', () => {
        it('uses • for selected when unicode is available', () => {
            vi.spyOn(caps, 'unicode', 'get').mockReturnValue(true);
            const { screen } = renderRadioGroup(OPTIONS, { selectedValue: 'light' });
            expect(cellAt(screen, 0, 1)?.char).toBe('•');
        });

        it('uses * for selected when caps.unicode is false', () => {
            vi.spyOn(caps, 'unicode', 'get').mockReturnValue(false);
            const { screen } = renderRadioGroup(OPTIONS, { selectedValue: 'light' });
            expect(cellAt(screen, 0, 1)?.char).toBe('*');
        });

        it('uses space for unselected in both modes', () => {
            vi.spyOn(caps, 'unicode', 'get').mockReturnValue(true);
            const { screen } = renderRadioGroup(OPTIONS, { selectedValue: 'light' });
            expect(cellAt(screen, 1, 1)?.char).toBe(' ');
        });
    });

    // ── 7. Edge cases ─────────────────────────────────────────────────────
    describe('7. Edge cases', () => {
        it('handles empty options array without error', () => {
            expect(() => renderRadioGroup([])).not.toThrow();
        });

        it('handles zero-size rect without error', () => {
            expect(() => renderRadioGroup(OPTIONS, {}, 0, 0)).not.toThrow();
        });

        it('is focusable by default', () => {
            const radioGroup = new RadioGroup(OPTIONS);
            expect(radioGroup.focusable).toBe(true);
        });
    });
});