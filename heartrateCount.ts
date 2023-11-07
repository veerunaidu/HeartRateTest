import fs from 'fs';
import moment from 'moment';

// Read the input JSON data
const rawData: string = fs.readFileSync('input.json', 'utf8');
const data: any[] = JSON.parse(rawData);

// Initialize an object to store the statistics
const stats: { [key: string]: any } = {};

// Process the data
data.forEach((entry: any) => {
  const date: string = moment(entry.timestamps.startTime).format('YYYY-MM-DD');
  if (!stats[date]) {
    stats[date] = {
      min: entry.beatsPerMinute,
      max: entry.beatsPerMinute,
      sum: entry.beatsPerMinute,
      count: 1,
      latestDataTimestamp: moment(entry.timestamps.endTime).format(),
      values: [entry.beatsPerMinute], // Initialize the values array
    };
  } else {
    const statsDate: any = stats[date];
    statsDate.min = Math.min(statsDate.min, entry.beatsPerMinute);
    statsDate.max = Math.max(statsDate.max, entry.beatsPerMinute);
    statsDate.sum += entry.beatsPerMinute;
    statsDate.count += 1;
    if (moment(entry.timestamps.endTime).isAfter(statsDate.latestDataTimestamp)) {
      statsDate.latestDataTimestamp = moment(entry.timestamps.endTime).format();
    }
    statsDate.values.push(entry.beatsPerMinute);
  }
});

// Calculate the median for each date
for (const date in stats) {
  const { count, sum, values }: { count: number; sum: number; values: number[] } = stats[date];
  values.sort((a, b) => a - b);
  const middle = Math.floor(count / 2);
  if (count % 2 === 0) {
    stats[date].median = (values[middle - 1] + values[middle]) / 2;
  } else {
    stats[date].median = values[middle];
  }
}

// Transform the result into an array of objects
const result = Object.keys(stats).map((date) => ({
  date,
  min: stats[date].min,
  max: stats[date].max,
  median: stats[date].median,
  latestDataTimestamp: stats[date].latestDataTimestamp,
}));

// Write the output to the output JSON file
fs.writeFileSync('output.json', JSON.stringify(result, null, 2));
