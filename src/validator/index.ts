export function isNumeric(value: string | undefined) {
    return value !== undefined && value !== null && `${value}`.trim() !== "" && !isNaN(+value) && +value >= 0;
}

export function isDateInRange(date: string) {
    if (!isNumeric(date)) {
        return false;
    }

    const currentDate = new Date();
    const currentTimestampInSeconds = currentDate.getTime() / 1000;
    return +date > currentTimestampInSeconds;
}
