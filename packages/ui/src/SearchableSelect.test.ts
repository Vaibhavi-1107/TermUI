import { describe, it, expect, vi } from 'vitest';
import { SearchableSelect } from './SearchableSelect.js';
import { type KeyEvent, Screen } from '@termuijs/core';

function makeKey(key: string): KeyEvent {
    return {
        key,
        shift: false,
        ctrl: false,
        alt: false,
        raw: Buffer.alloc(0),
        stopPropagation: () => {},
        preventDefault: () => {},
    };
}

const sampleOptions = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
    { label: 'Date', value: 'date' },
];

describe('SearchableSelect', () => {
    it('accepts options via constructor', () => {
        const widget = new SearchableSelect(sampleOptions);
        expect(widget.filteredOptions).toHaveLength(4);
    });

    it('starts with first option selected when options exist', () => {
        const widget = new SearchableSelect(sampleOptions);
        expect(widget.selectedIndex).toBe(0);
        expect(widget.selectedOption).toBe('apple');
    });

    it('returns empty string for selectedOption when no options', () => {
        const widget = new SearchableSelect();
        expect(widget.selectedOption).toBe('');
    });

    it('backspace removes last character from searchQuery', () => {
        const widget = new SearchableSelect(sampleOptions);
        widget.handleKey(makeKey('a'));
        widget.handleKey(makeKey('p'));
        widget.handleKey(makeKey('backspace'));
        expect(widget.searchQuery).toBe('a');
    });

    it('typing characters appends to searchQuery', () => {
        const widget = new SearchableSelect(sampleOptions);
        widget.handleKey(makeKey('h'));
        widget.handleKey(makeKey('i'));
        expect(widget.searchQuery).toBe('hi');
    });

    it('filters options when typing', () => {
        const widget = new SearchableSelect(sampleOptions);
        widget.handleKey(makeKey('a'));
        expect(widget.filteredOptions).toHaveLength(3);
        expect(widget.filteredOptions[0].label).toBe('Apple');
        expect(widget.filteredOptions[1].label).toBe('Banana');
        expect(widget.filteredOptions[2].label).toBe('Date');
    });

    it('resets filtered options when search is cleared', () => {
        const widget = new SearchableSelect(sampleOptions);
        widget.handleKey(makeKey('c'));
        expect(widget.filteredOptions).toHaveLength(1);
        widget.handleKey(makeKey('backspace'));
        expect(widget.filteredOptions).toHaveLength(4);
    });

    it('down arrow moves selectedIndex forward', () => {
        const widget = new SearchableSelect(sampleOptions);
        widget.handleKey(makeKey('down'));
        expect(widget.selectedIndex).toBe(1);
    });

    it('down arrow at last option does not move past end', () => {
        const widget = new SearchableSelect(sampleOptions);
        widget.handleKey(makeKey('down'));
        widget.handleKey(makeKey('down'));
        widget.handleKey(makeKey('down'));
        expect(widget.selectedIndex).toBe(3);
        widget.handleKey(makeKey('down'));
        expect(widget.selectedIndex).toBe(3);
    });

    it('up arrow moves selectedIndex backward', () => {
        const widget = new SearchableSelect(sampleOptions);
        widget.handleKey(makeKey('down'));
        widget.handleKey(makeKey('down'));
        widget.handleKey(makeKey('up'));
        expect(widget.selectedIndex).toBe(1);
    });

    it('up arrow at first option does not move before start', () => {
        const widget = new SearchableSelect(sampleOptions);
        widget.handleKey(makeKey('up'));
        expect(widget.selectedIndex).toBe(0);
    });

    it('confirm calls onSelect callback', () => {
        const onSelect = vi.fn();
        const widget = new SearchableSelect(sampleOptions, { onSelect });
        widget.handleKey(makeKey('enter'));
        expect(onSelect).toHaveBeenCalledWith(sampleOptions[0], 0);
    });

    it('confirm with return key calls onSelect', () => {
        const onSelect = vi.fn();
        const widget = new SearchableSelect(sampleOptions, { onSelect });
        widget.handleKey(makeKey('return'));
        expect(onSelect).toHaveBeenCalledWith(sampleOptions[0], 0);
    });

    it('confirm selects the currently highlighted option', () => {
        const onSelect = vi.fn();
        const widget = new SearchableSelect(sampleOptions, { onSelect });
        widget.handleKey(makeKey('down'));
        widget.handleKey(makeKey('enter'));
        expect(onSelect).toHaveBeenCalledWith(sampleOptions[1], 1);
    });

    it('confirm is no-op when filtered options list is empty', () => {
        const onSelect = vi.fn();
        const widget = new SearchableSelect(sampleOptions, { onSelect });
        widget.handleKey(makeKey('z'));
        widget.handleKey(makeKey('enter'));
        expect(onSelect).not.toHaveBeenCalled();
    });

    it('setOptions replaces options and resets state', () => {
        const widget = new SearchableSelect(sampleOptions);
        widget.handleKey(makeKey('down'));
        widget.handleKey(makeKey('down'));
        widget.handleKey(makeKey('a'));
        expect(widget.filteredOptions).toHaveLength(3);
        widget.setOptions([{ label: 'X', value: 'x' }]);
        // 'X' does not match search query 'a', so filtered is empty
        expect(widget.filteredOptions).toHaveLength(0);
        expect(widget.selectedIndex).toBe(0);
        expect(widget.searchQuery).toBe('a');
    });

    it('focusable is true', () => {
        const widget = new SearchableSelect();
        expect(widget.focusable).toBe(true);
    });

    it('renders search bar with placeholder when empty', () => {
        const widget = new SearchableSelect([]);
        const screen = new Screen(20, 5);
        widget.updateRect({ x: 0, y: 0, width: 20, height: 5 });
        widget.render(screen);
        const row0 = screen.back[0].map(c => c.char).join('');
        expect(row0).toContain('Search');
    });

    it('renders typed query in search bar', () => {
        const widget = new SearchableSelect(sampleOptions);
        widget.handleKey(makeKey('a'));
        const screen = new Screen(20, 5);
        widget.updateRect({ x: 0, y: 0, width: 20, height: 5 });
        widget.render(screen);
        const row0 = screen.back[0].map(c => c.char).join('');
        expect(row0).toContain('a');
    });

    it('renders filtered options below search bar', () => {
        const widget = new SearchableSelect(sampleOptions);
        const screen = new Screen(20, 5);
        widget.updateRect({ x: 0, y: 0, width: 20, height: 5 });
        widget.render(screen);
        const row1 = screen.back[1].map(c => c.char).join('');
        expect(row1).toContain('Apple');
        const row2 = screen.back[2].map(c => c.char).join('');
        expect(row2).toContain('Banana');
    });

    it('highlights selected option', () => {
        const widget = new SearchableSelect(sampleOptions);
        widget.handleKey(makeKey('down'));
        const screen = new Screen(20, 5);
        widget.updateRect({ x: 0, y: 0, width: 20, height: 5 });
        widget.render(screen);
        const row1 = screen.back[1].map(c => c.char).join('').trim();
        const row2 = screen.back[2].map(c => c.char).join('').trim();
        // Second option (Banana) should have the bullet prefix since it's selected
        expect(row2).toMatch(/^[●\*]/);
        // First option (Apple) should not have the bullet
        expect(row1).not.toMatch(/^[●\*]/);
    });
});
