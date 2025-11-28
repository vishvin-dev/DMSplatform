// utils/dateUtils.js
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import utc from "dayjs/plugin/utc";
dayjs.extend(isoWeek);
dayjs.extend(utc);

/**
 * getDateRange(method, payload)
 * method: 'day' | 'week' | 'month' | 'custom'
 * payload:
 * - for 'day': { date: 'YYYY-MM-DD' }  (optional, default today)
 * - for 'week': { date: 'YYYY-MM-DD' } (week containing this date; default today)
 * - for 'month': { year: 2025, month: 11 } or { date: 'YYYY-MM-DD' }
 * - for 'custom': { startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD' }
 *
 * returns: { startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD' }
 */
export const getDateRange = (method, payload = {}) => {
  const today = dayjs().utc().format("YYYY-MM-DD");

  switch ((method || "").toLowerCase()) {
    case "day": {
      const date = payload.date || today;
      return { startDate: date, endDate: date };
    }

    case "week": {
      const date = payload.date ? dayjs(payload.date) : dayjs();
      // isoWeek: Monday => Sunday week
      const start = date.startOf("isoWeek").format("YYYY-MM-DD");
      const end = date.endOf("isoWeek").format("YYYY-MM-DD");
      return { startDate: start, endDate: end };
    }

    case "month": {
      if (payload.date) {
        const d = dayjs(payload.date);
        return {
          startDate: d.startOf("month").format("YYYY-MM-DD"),
          endDate: d.endOf("month").format("YYYY-MM-DD")
        };
      } else if (payload.year && payload.month) {
        // payload.month: 1-12
        const d = dayjs(`${payload.year}-${String(payload.month).padStart(2, "0")}-01`);
        return {
          startDate: d.startOf("month").format("YYYY-MM-DD"),
          endDate: d.endOf("month").format("YYYY-MM-DD")
        };
      } else {
        // default current month
        const d = dayjs();
        return {
          startDate: d.startOf("month").format("YYYY-MM-DD"),
          endDate: d.endOf("month").format("YYYY-MM-DD")
        };
      }
    }

    case "custom": {
      const { startDate, endDate } = payload;
      if (!startDate || !endDate) throw new Error("custom requires startDate and endDate");
      return { startDate, endDate };
    }

    default:
      // default to today's day
      return { startDate: today, endDate: today };
  }
};
