export function isNumeric(value: string) {
    return value !== undefined && value !== null && `${value}`.trim() !== "" && !isNaN(+value) && +value > 0
}

export function isDateInRange(date: string, validationDurationInWeek: number) {
    if (!isNumeric(date)) {
        return false;
    }

    let maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + validationDurationInWeek * 7);
    console.log(date, maxDate)
    return +date < maxDate.getTime();
}