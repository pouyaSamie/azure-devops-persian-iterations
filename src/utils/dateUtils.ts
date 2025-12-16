import { toGregorian, toJalaali } from "jalaali-js";
import { DayValue } from "react-modern-calendar-datepicker";

export function jalaliDayToIso(day: DayValue): string {
    if (!day) {
        throw new Error("A Jalali date is required.");
    }

    const { gy, gm, gd } = toGregorian(day.year, day.month, day.day);
    return new Date(Date.UTC(gy, gm - 1, gd, 0, 0, 0, 0)).toISOString();
}

export function isoToJalaliDay(value?: string | Date | null): DayValue | null {
    if (!value) {
        return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
        return null;
    }

    const j = toJalaali(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    return { year: j.jy, month: j.jm, day: j.jd };
}

export function formatJalaliDate(value?: string | Date | null): string {
    const dayValue = isoToJalaliDay(value);
    if (!dayValue) {
        return "-";
    }

    const pad = (input: number) => input.toString().padStart(2, "0");
    return `${dayValue.year}/${pad(dayValue.month)}/${pad(dayValue.day)}`;
}
