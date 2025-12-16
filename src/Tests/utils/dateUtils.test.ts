import { isoToJalaliDay, jalaliDayToIso, formatJalaliDate } from '../../utils/dateUtils';

describe('dateUtils', () => {
    test('isoToJalaliDay returns null for invalid input', () => {
        expect(isoToJalaliDay(undefined)).toBeNull();
        expect(isoToJalaliDay('invalid-date')).toBeNull();
    });

    test('formatJalaliDate returns dash for missing value', () => {
        expect(formatJalaliDate(undefined)).toBe('-');
    });

    test('jalaliDayToIso roundtrip for a known Jalali day', () => {
        // Use a Jalali day structure and convert to ISO then back to a day
        const jalali = { year: 1400, month: 1, day: 1 } as any;
        const iso = jalaliDayToIso(jalali);
        expect(typeof iso).toBe('string');
        const round = isoToJalaliDay(iso);
        expect(round).not.toBeNull();
        expect(round?.year).toBeGreaterThan(0);
    });
});
