export function isNumeric(value: string | undefined) {
    return value !== undefined && value !== null && `${value}`.trim() !== "" && !isNaN(+value) && +value >= 0
}

export function isDateInRange(date: string, validationDurationInWeek: number) {
    if (!isNumeric(date)) {
        return false;
    }

    const currentDate = new Date();
    const currentTimestampInSeconds = currentDate.getTime() / 1000
    if (currentTimestampInSeconds >= +date) {
        return false;
    }
    currentDate.setDate(currentDate.getDate() + validationDurationInWeek * 7);
    const maxExpiryDateInSeconds = currentDate.getTime() / 1000;
    return +date < maxExpiryDateInSeconds;
}
