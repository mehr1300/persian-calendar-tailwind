// extensions/utils.js
import jalaali from "jalaali-js";

export function pad(num) {
    return String(num).padStart(2, "0");
}

export function formatKey(month, day) {
    return `${pad(month)}-${pad(day)}`;
}

export function formatFullDate(year, month, day) {
    return `${year}-${pad(month)}-${pad(day)}`;
}

export function getMonthLength(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return jalaali.isLeapJalaaliYear(jy) ? 30 : 29;
}

export function toGregorian(jy, jm, jd) {
    return jalaali.toGregorian(jy, jm, jd);
}

export function toJalali(gy, gm, gd) {
    return jalaali.toJalaali(gy, gm, gd);
}

// تبدیل میلادی به هجری قمری با استفاده از API بومی
export function toHijri(gy, gm, gd) {
    const date = new Date(Date.UTC(gy, gm - 1, gd));
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        timeZone: 'UTC'
    });
    const parts = formatter.formatToParts(date);
    const hy = parseInt(parts.find(p => p.type === 'year').value, 10);
    const hm = parseInt(parts.find(p => p.type === 'month').value, 10);
    const hd = parseInt(parts.find(p => p.type === 'day').value, 10);
    return { hy, hm, hd };
}

export function getWeekDayIndexFromGregorian(gy, gm, gd) {
    const date = new Date(gy, gm - 1, gd);
    const jsDay = date.getDay(); // 0 Sunday, 6 Saturday
    return jsDay === 6 ? 0 : jsDay + 1;
}

export function isSameDate(a, b) {
    return a.year === b.year && a.month === b.month && a.day === b.day;
}

export const jalaliMonthNames = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
];

export const gregorianMonthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export const hijriMonthNames = [
    "محرم", "صفر", "ربیع‌الاول", "ربیع‌الثانی", "جمادی‌الاول", "جمادی‌الثانی",
    "رجب", "شعبان", "رمضان", "شوال", "ذی‌القعده", "ذی‌الحجه"
];
