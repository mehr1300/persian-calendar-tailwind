// extensions/generateMonth.js
import { events } from "./events";
import {
    formatKey,
    formatFullDate,
    getMonthLength,
    toGregorian,
    toJalali,
    toHijri,
    getWeekDayIndexFromGregorian,
    isSameDate,
    jalaliMonthNames,
    gregorianMonthNames,
    hijriMonthNames
} from "./utils";

function getEventsByDate(type, month, day) {
    const key = formatKey(month, day);
    return events[type]?.[key] || [];
}

function mergeEvents(jalaliMonth, jalaliDay, gregorianMonth, gregorianDay, hijriMonth, hijriDay) {
    const jalaliEvents = getEventsByDate("jalali", jalaliMonth, jalaliDay).map(item => ({
        ...item,
        calendarType: "jalali"
    }));

    const gregorianEvents = getEventsByDate("gregorian", gregorianMonth, gregorianDay).map(item => ({
        ...item,
        calendarType: "gregorian"
    }));

    const hijriEvents = getEventsByDate("hijri", hijriMonth, hijriDay).map(item => ({
        ...item,
        calendarType: "hijri"
    }));

    const merged = [...jalaliEvents, ...gregorianEvents, ...hijriEvents];

    return {
        isHoliday: merged.some(item => item.isHoliday),
        holidayType: merged.find(item => item.isHoliday)?.calendarType || "",
        list: merged
    };
}

function createDayObject(jy, jm, jd, { inCurrentMonth = true, isToday = false } = {}) {
    const g = toGregorian(jy, jm, jd);
    const h = toHijri(g.gy, g.gm, g.gd);

    return {
        disabled: !inCurrentMonth,
        inCurrentMonth,
        weekDayIndex: getWeekDayIndexFromGregorian(g.gy, g.gm, g.gd),
        isToday,
        day: {
            jalali: jd,
            gregorian: g.gd,
            hijri: h.hd
        },
        fullDate: {
            jalali: formatFullDate(jy, jm, jd),
            gregorian: formatFullDate(g.gy, g.gm, g.gd),
            hijri: formatFullDate(h.hy, h.hm, h.hd)
        },
        events: mergeEvents(jm, jd, g.gm, g.gd, h.hm, h.hd)
    };
}

function getTodayJalali() {
    const now = new Date();
    const gy = now.getFullYear();
    const gm = now.getMonth() + 1;
    const gd = now.getDate();
    return toJalali(gy, gm, gd);
}

export function generateMonth(jy, jm) {
    const days = [];
    const monthLength = getMonthLength(jy, jm);

    const firstGregorian = toGregorian(jy, jm, 1);
    const startIndex = getWeekDayIndexFromGregorian(
        firstGregorian.gy,
        firstGregorian.gm,
        firstGregorian.gd
    );

    const todayJalali = getTodayJalali();

    let prevMonth = jm - 1;
    let prevYear = jy;
    if (prevMonth < 1) {
        prevMonth = 12;
        prevYear -= 1;
    }

    const prevMonthLength = getMonthLength(prevYear, prevMonth);

    for (let i = startIndex - 1; i >= 0; i--) {
        const dayNumber = prevMonthLength - i;
        const isToday = isSameDate(todayJalali, { year: prevYear, month: prevMonth, day: dayNumber });
        days.push(createDayObject(prevYear, prevMonth, dayNumber, { inCurrentMonth: false, isToday }));
    }

    for (let jd = 1; jd <= monthLength; jd++) {
        const isToday = isSameDate(todayJalali, { year: jy, month: jm, day: jd });
        days.push(createDayObject(jy, jm, jd, { inCurrentMonth: true, isToday }));
    }

    let nextMonth = jm + 1;
    let nextYear = jy;
    if (nextMonth > 12) {
        nextMonth = 1;
        nextYear += 1;
    }

    const remainder = days.length % 7;
    const trailingDays = remainder === 0 ? 0 : 7 - remainder;

    for (let jd = 1; jd <= trailingDays; jd++) {
        const isToday = isSameDate(todayJalali, { year: nextYear, month: nextMonth, day: jd });
        days.push(createDayObject(nextYear, nextMonth, jd, { inCurrentMonth: false, isToday }));
    }

    const firstDayGregorian = toGregorian(jy, jm, 1);
    const lastDayGregorian = toGregorian(jy, jm, monthLength);

    const firstDayHijri = toHijri(firstDayGregorian.gy, firstDayGregorian.gm, firstDayGregorian.gd);
    const lastDayHijri = toHijri(lastDayGregorian.gy, lastDayGregorian.gm, lastDayGregorian.gd);

    const gregorianHeader =
        firstDayGregorian.gm === lastDayGregorian.gm
            ? `${gregorianMonthNames[firstDayGregorian.gm - 1]} ${firstDayGregorian.gy}`
            : `${gregorianMonthNames[firstDayGregorian.gm - 1]} - ${gregorianMonthNames[lastDayGregorian.gm - 1]} ${lastDayGregorian.gy}`;

    const hijriHeader =
        firstDayHijri.hm === lastDayHijri.hm
            ? `${hijriMonthNames[firstDayHijri.hm - 1]} ${firstDayHijri.hy}`
            : `${hijriMonthNames[firstDayHijri.hm - 1]} - ${hijriMonthNames[lastDayHijri.hm - 1]} ${lastDayHijri.hy}`;

    return {
        header: {
            jalali: `${jalaliMonthNames[jm - 1]} ${jy}`,
            gregorian: gregorianHeader,
            hijri: hijriHeader
        },
        month: {
            jalali: jm,
            year: jy
        },
        startIndex,
        days
    };
}

export function generateYearCalendar(jy) {
    const months = [];
    for (let jm = 1; jm <= 12; jm++) {
        months.push(generateMonth(jy, jm));
    }
    return months;
}
