export function isNumeric(value: string) {
    return value !== undefined && value !== null && `${value}`.trim() !== "" && !isNaN(+value) && +value > 0
}

export function isDateInRange(date: string, validationDurationInWeek: number) {
    if (!isNumeric(date)) {
        return false;
    }

    const currentDate = new Date();
    if (currentDate.getTime() >= +date) {
        return false;
    }

    currentDate.setDate(currentDate.getDate() + validationDurationInWeek * 7);
    return +date < currentDate.getTime();
}