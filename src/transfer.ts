import chalk from "chalk";
import * as split2 from "split2";
import { Readable, Writable } from "stream";
import { publishAnimation, pullAnimation } from "./animation";
import Queue from "./queue";
import { State } from "./state";

const description = (id: number) =>
  `Transferred from ID ${id} with roblox-animation-transfer`;

export default function transfer(
  inStream: Readable,
  outStream: Writable,
  state: State,
  concurrent: number,
  groupId?: number
) {
  // Write the XML header and open the <Animations> tag
  outStream.write('<?xml version="1.0" encoding="UTF-8"?>\n');
  outStream.write('<Animations>\n');

  const queue = new Queue<{ id: number; title: string }>(
    (d) =>
      pullAnimation(d.id)
        .then((data) => {
          return publishAnimation(
            state,
            state.failedUploads.has(d.id) ? "Keyframe Sequence" : d.title,
            description(d.id),
            data,
            groupId
          );
        })
        .then((newId) => {
          const output = `  <Animation>\n    <OldID>${d.id}</OldID>\n    <Title>${d.title}</Title>\n    <NewID>${newId}</NewID>\n  </Animation>\n`;
          outStream.write(output);
        })
        .catch((e) => {
          state.failedUploads.add(d.id);
          console.error(
            chalk.red(`Failed to publish animation ${d.title}: ${e.message}`)
          );
          return Promise.reject(e); // Ensure queue retries on failure
        }),
    {
      concurrent: concurrent,
      maxRetries: 5,
      retryDelay: 5000,
      maxTimeout: 30000,
    }
  );

  // Listen for the 'drain' event, which fires when the queue is empty
  queue.on('drain', () => {
    outStream.write('</Animations>\n'); // Close the XML document
  });

  inStream.pipe(split2()).on("data", (line) => {
    const words = line.split(" ");
    const id = Number(words.shift());
    const title = words.join(" ");

    if (Number.isNaN(id)) {
      console.error(chalk.red(`Error in input: id for "${title}" is not valid`));
    } else {
      queue.push({ id, title });
    }
  });

  inStream.on("end", () => {
    // If no tasks were added to the queue, close the XML document immediately
    if (queue.size === 0) {
      outStream.write('</Animations>\n');
    }
  });
}
