import moment from 'moment-timezone';

export function prettyDate(value, timezone) {
  let timestamp = moment(value);

  if (timezone) {
    timestamp = timestamp.tz(timezone);
  }
  return timestamp.format('lll');
}

export function prettyTime(value, timezone) {
  let now = moment();
  let timestamp = moment(value);
  let timeString;

  if (timezone) {
    now = now.tz(timezone);
    timestamp = timestamp.tz(timezone);
  }

  const timeElapsed = moment.duration(now.diff(timestamp));
  if (timeElapsed.asHours() < 24) {
    timeString = timestamp.fromNow();
  } else {
    timeString = timestamp.format('ll');
  }
  return timeString;
}
