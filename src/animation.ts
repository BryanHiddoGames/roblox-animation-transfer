import fetch from "node-fetch"
import * as endpoints from "./endpoints"
import { State } from "./state"

export async function pullAnimation(id: number): Promise<Buffer> {
  return (
    await fetch(endpoints.asset(id)).catch(() => {
      throw new Error(`Cannot pull animation ${id}`)
    })
  ).buffer()
}

export async function publishAnimation(
  state: State,
  title: string,
  description: string,
  data: Buffer,
  groupId?: number
): Promise<number> {
  const response = await fetch(endpoints.publish(title, description, groupId), {
    body: data,
    method: "POST",
    headers: {
      ...state.headers,
      "User-Agent": "RobloxStudio/WinInet",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    },
  }).catch((e) => {
    throw new Error(`Publish of animation "${title}" failed: ${e.toString()}`)
  })

  if (!response.ok) {
    return Promise.reject(`${title}: ${response.statusText}`)
  }

  const responseText = await response.text();
  console.log(`Response for animation "${title}": ${responseText}`); // Log the response for debugging

  // Since the response is the targetId as plain text, we can directly return it
  const targetId = parseInt(responseText, 10);
  if (!isNaN(targetId)) {
    return targetId;
  } else {
    throw new Error(`Unexpected response format or missing targetId: ${responseText}`);
  }
}
