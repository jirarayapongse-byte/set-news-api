const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const BKK_TZ = 'Asia/Bangkok';

function toBangkok(isoOrDate) {
  if (!isoOrDate) return null;
  return dayjs(isoOrDate).tz(BKK_TZ);
}

function formatBangkok(isoOrDate, format = 'YYYY-MM-DD HH:mm') {
  const d = toBangkok(isoOrDate);
  return d ? d.format(format) : null;
}

module.exports = {
  toBangkok,
  formatBangkok,
  BKK_TZ,
};