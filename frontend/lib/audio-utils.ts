export const parseTimecode = (timecode: string): number => {
  let seconds = 0;
  if (timecode.includes(".")) {
    const parts = timecode.split(".");
    seconds += Number.parseInt(parts[1], 10) / 1000;
    timecode = parts[0];
  }

  const parts = timecode.split(":");

  if (parts.length === 3) {
    const hours = Number.parseInt(parts[0], 10);
    const minutes = Number.parseInt(parts[1], 10);
    const _seconds = Number.parseInt(parts[2], 10);
    seconds += hours * 3600 + minutes * 60 + _seconds;
  } else if (parts.length === 2) {
    const minutes = Number.parseInt(parts[0], 10);
    const _seconds = Number.parseInt(parts[1], 10);
    seconds += minutes * 60 + _seconds;
  } else if (parts.length === 1) {
    const _seconds = Number.parseInt(parts[0], 10);
    seconds += _seconds;
  }
  return seconds;
};

export const normalizeFrequencyData = (
  data: Uint8Array
): Array<{ frequency: number; amplitude: number }> => {
  return Array.from(data).map((value, index) => ({
    frequency: index,
    amplitude: (value / 255) * 100,
  }));
};
