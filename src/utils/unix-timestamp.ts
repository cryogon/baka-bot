export function getUnixTimestamp(time?: string) {
    if (!time) return 0;
    const date = new Date(time);
    return Math.floor(date.getTime() / 1000);
  }
  