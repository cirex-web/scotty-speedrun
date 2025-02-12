export function getTimeString(durationMs: number) {
  if (durationMs < 0) {
    return (
      <span style={{ color: "black" }}>
        releases in {getTimeString(-durationMs)}
      </span>
    );
  }
  const ms = durationMs % 1000;
  durationMs = Math.floor(durationMs / 1000);
  const seconds = durationMs % 60;
  durationMs = Math.floor(durationMs / 60);
  const minutes = durationMs % 60;
  durationMs = Math.floor(durationMs / 60);
  const hours = durationMs % 24;
  durationMs = Math.floor(durationMs / 24);
  const days = durationMs;

  const timeWithoutDays = (
    <>
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
      {String(seconds).padStart(2, "0")}
      <span style={{ color: "gray" }}>:{String(ms).padStart(3, "0")}</span>
    </>
  );
  if (days === 0) {
    return timeWithoutDays;
  }
  return (
    <>
      {String(days)}:{timeWithoutDays}
    </>
  );
}

export function timestampToDatetimeInputString(timestampMs: number) {
  const date = new Date(timestampMs);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toJSON().slice(0, -8);
}
