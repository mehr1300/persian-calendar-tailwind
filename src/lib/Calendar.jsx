import React, { useEffect, useMemo, useState } from "react";
import { generateYearCalendar } from "../extensions/generateMonth";
import { toJalali } from "../extensions/utils";

const now = new Date();
const todayJalali = toJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());

function ArrowLeftIcon({ className = "", size = 20 }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M5 12H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 6L19 12L13 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ArrowRightIcon({ className = "", size = 20 }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M19 12H5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 6L5 12L11 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

const weekDays = ["شنبه", "یکشنبه", "دوشنبه", "سه شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

export default function Calendar() {
    const [year, setYear] = useState(todayJalali.jy);
    const [month, setMonth] = useState(todayJalali.jm - 1);
    const [day, setDay] = useState(0);

    const calendar = useMemo(() => generateYearCalendar(year), [year]);
    const monthData = calendar?.[month];

    // تابع کمکی برای تشخیص دقیق امروز بدون وابستگی به پراپ isToday دیتای تقویم
    const checkIsToday = (value) => {
        if (!value?.fullDate?.jalali) return false;
        const [jy, jm, jd] = value.fullDate.jalali.split("-").map(Number);
        return jy === todayJalali.jy && jm === todayJalali.jm && jd === todayJalali.jd;
    };

    useEffect(() => {
        if (!monthData?.days?.length) return;

        // پیدا کردن ایندکس امروز در ماه جاری
        const todayIndex = monthData.days.findIndex(item => checkIsToday(item));

        if (todayIndex !== -1) {
            setDay(todayIndex);
            return;
        }

        // اگر امروز در این ماه نیست، اولین روز ماه را انتخاب کن
        const firstCurrentMonthIndex = monthData.days.findIndex(item => !item.disabled);
        setDay(firstCurrentMonthIndex !== -1 ? firstCurrentMonthIndex : 0);
    }, [year, month, monthData]);

    const selectedDayData = monthData?.days?.[day];

    const isCurrentlyToday = checkIsToday(selectedDayData);

    const handleGoToToday = () => {
        if (year === todayJalali.jy && month === todayJalali.jm - 1) {
            const todayIndex = monthData.days.findIndex(item => checkIsToday(item));
            if (todayIndex !== -1) {
                setDay(todayIndex);
            }
        } else {
            setYear(todayJalali.jy);
            setMonth(todayJalali.jm - 1);
        }
    };

    const goPrevMonth = () => {
        if (month > 0) {
            setMonth(prev => prev - 1);
            return;
        }
        setYear(prev => prev - 1);
        setMonth(11);
    };

    const goNextMonth = () => {
        if (month < 11) {
            setMonth(prev => prev + 1);
            return;
        }
        setYear(prev => prev + 1);
        setMonth(0);
    };

    const goPrevYear = () => setYear(prev => prev - 1);
    const goNextYear = () => setYear(prev => prev + 1);

    const handleDayClick = (value, index) => {
        if (!value.disabled) {
            setDay(index);
            return;
        }

        if (!value.fullDate?.jalali) return;
        const [jy, jm] = value.fullDate.jalali.split("-").map(Number);
        if (!Number.isNaN(jy) && !Number.isNaN(jm)) {
            setYear(jy);
            setMonth(jm - 1);
        }
    };

    const getDayCardClasses = (value, index) => {
        const isToday = checkIsToday(value); // استفاده از تابع دقیق
        const isSelected = day === index;
        const isDisabled = value.disabled;
        const isHoliday = value.events?.isHoliday;
        const isFriday = value.weekDayIndex === 6;

        const baseClass = "relative flex items-center justify-center flex-col w-full px-0.5 md:px-2.5 h-14 gap-1 rounded transition-all duration-200 select-none";

        const interactiveClass = isDisabled
            ? "cursor-pointer opacity-70 hover:opacity-100"
            : "cursor-pointer anime_hover hover:scale-[1.02] active:scale-[0.98]";

        const colorClass = isSelected
            ? "bg-blue-400/80 text-white shadow-sm"
            : isDisabled
                ? "bg-gray-100 text-zinc-500"
                : isHoliday || isFriday
                    ? "bg-red-400/40 text-zinc-700"
                    : "bg-gray-200 text-zinc-700";

        const todayClass = isToday
            ? "ring-2 ring-yellow-500 ring-offset-2 ring-offset-gray-100 z-10"
            : "";

        return `${baseClass} ${interactiveClass} ${colorClass} ${todayClass}`.trim();
    };

    const getSubTextClasses = (value, index) => {
        const isToday = checkIsToday(value);
        const isSelected = day === index;

        if (isToday || isSelected) return "text-zinc-50";
        if (value.disabled) return "text-zinc-400";
        return "text-zinc-500";
    };

    return (
        <div className="bg-gray-100 col-span-3 flex flex-col gap-4 rounded-2xl p-4 relative">


            <div className="flex items-center justify-center gap-4">
                <button type="button" onClick={goPrevYear} className="text-xs flex items-center gap-1 rounded-xl bg-zinc-200 px-3 py-2 text-zinc-700 transition hover:bg-zinc-300">
                    <ArrowLeftIcon size={18} />
                    <span>سال قبل</span>
                </button>

                <div className="rounded-xl bg-zinc-200 px-4 py-2 text-sm text-zinc-700 font-bold">
                    سال {year}
                </div>

                <button type="button" onClick={goNextYear} className="text-xs flex items-center gap-1 rounded-xl bg-zinc-200 px-3 py-2 text-zinc-700 transition hover:bg-zinc-300">
                    <span>سال بعد</span>
                    <ArrowRightIcon size={18} />
                </button>
            </div>

            <div className="flex flex-col gap-1.5 text-center">
                <span dir="ltr" className="text-lg">
                    <span className="text-yellow-500 kalameh font-bold">
                        {monthData?.header?.jalali?.split(" ")?.[0]}
                    </span>{" "}
                    {monthData?.header?.jalali?.split(" ")?.[1]}
                </span>
                <span className="text-sm">{monthData?.header?.gregorian}</span>
                <span className="text-sm text-zinc-400">{monthData?.header?.hijri}</span>
            </div>

            {/* month nav */}
            <div className="flex flex-row text_icon justify-between items-center md:px-10 pt-1">
                <button onClick={goPrevMonth} className="flex flex-row gap-1 cursor-pointer text-sm transition hover:text-yellow-500" type="button">
                    <ArrowLeftIcon className="text-yellow-500" size={20} />
                    <span>ماه قبلی</span>
                </button>
                <div className="min-h-[28px]">
                    {!isCurrentlyToday && (
                        <button onClick={handleGoToToday} className="bg-yellow-500 text-white text-xs px-3 py-1.5 rounded-lg shadow-sm transition hover:bg-yellow-600 active:scale-95">
                            برو به امروز
                        </button>
                    )}
                </div>
                <button onClick={goNextMonth} className="flex flex-row gap-1 cursor-pointer text-sm transition hover:text-yellow-500" type="button">
                    <span>ماه بعدی</span>
                    <ArrowRightIcon className="text-yellow-500" size={20} />
                </button>
            </div>

            {/* weekday names */}
            <div className="bg-zinc-200 text-zinc-500 text-[10px] md:text-xs rounded-2xl grid grid-cols-7 gap-2 md:gap-3 *:text-center p-2 md:p-3">
                {weekDays.map((item, index) => (
                    <span key={item} className={index === 6 ? "text-red-500 font-bold" : ""}>
                        {item}
                    </span>
                ))}
            </div>

            {/* days */}
            <div className="-mt-3 grid grid-cols-7 gap-3 p-3 h-105">
                {monthData?.days?.map((value, index) => {
                    const hasEvents = value.events?.list?.length > 0;
                    const subTextClass = getSubTextClasses(value, index);

                    return (
                        <div onClick={() => handleDayClick(value, index)} key={index} className={getDayCardClasses(value, index)}>
                            {hasEvents ? (
                                <span className="absolute top-1.5 left-1.5 flex h-1.5 w-1.5 rounded-full shadow bg-yellow-400" />
                            ) : null}

                            <span className="kalameh text-xl self-center">
                                {value.day.jalali}
                            </span>
                            <div className={`flex flex-row px-1 text_icon w-full text-xs justify-between ${subTextClass}`}>
                                <span className="font-sans text-[10px] md:text-xs">{value.day.gregorian}</span>
                                <span className="text-[10px] md:text-xs">{value.day.hijri}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* selected day summary */}
            <div className="rounded-2xl bg-zinc-200 px-4 py-3 text-sm text-zinc-700">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <span>
                        <span className="text-yellow-600 font-bold">
                            {selectedDayData?.day?.jalali}
                        </span>{" "}
                        {monthData?.header?.jalali?.split(" ")?.[0]}
                    </span>
                    <div className="flex flex-row justify-center gap-3">
                        <span className="text-gray-600 font-bold"> {selectedDayData?.fullDate?.jalali}</span>
                        <span> / </span>
                        <span className="text-gray-600 font-bold"> {selectedDayData?.fullDate?.hijri}</span>
                        <span> / </span>
                        <span className="text-gray-600 font-bold"> {selectedDayData?.fullDate?.gregorian}</span>
                    </div>
                </div>
            </div>
            {/* events */}
            <div className="bg-zinc-200 pl-2 py-4 rounded-2xl">
                <div className="h-44 overflow-y-auto scrollbar text-sm text-zinc-600 px-4 flex flex-col gap-3">
                    {selectedDayData?.events?.list?.length > 0 ? (
                        selectedDayData.events.list.map((item, index) =>
                            item?.isHoliday ? (
                                <div className="text-red-500/70" key={index}>
                                    <span className="text-red-500 pl-1 font-bold">
                                        {selectedDayData?.day?.jalali}{" "}
                                        {monthData?.header?.jalali?.split(" ")?.[0]}{" "}
                                    </span>
                                    <span>{item.event}</span>
                                </div>
                            ) : (
                                <div key={index}>
                                    <span className="text-zinc-600 pl-1 font-bold">
                                        {selectedDayData?.day?.jalali}{" "}
                                        {monthData?.header?.jalali?.split(" ")?.[0]}{" "}
                                    </span>
                                    <span>{item.event}</span>
                                </div>
                            )
                        )
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            در این روز رویدادی وجود ندارد.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
