export function getKoreanDate(date: Date = new Date()): Date {
    return new Date(date.getTime() + 9 * 60 * 60 * 1000)
}
export function combineDateAndTime(date: Date, time: string) {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, seconds, 0);
    return combined;
}