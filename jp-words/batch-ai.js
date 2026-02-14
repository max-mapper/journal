import { GoogleGenAI, Type } from "@google/genai";
const ai = new GoogleGenAI({
  apiKey: process.argv["GOOGLE_GEMINI_KEY"],
});

// var defaultModel = "gemini-3-pro-preview";
var defaultModel = "gemini-3-flash-preview";

export async function generateContent(
  contents,
  model = defaultModel,
  prompt,
  schema,
) {
  const makeRequest = async () => {
    return await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: prompt,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 1.8,
        topP: 0.95,
        topK: 65,
      },
    });
  };
  return await retryOperation(makeRequest, 5, 2000);
}

export async function runBatchJob(batch, prompt, jsonPath, schema, model) {
  let file;
  if (jsonPath) {
    console.error("uploading");
    file = await ai.files.upload({
      file: jsonPath,
      mimeType: "text/plain",
    });
    console.error("uploaded");
  }

  var promises = [];
  var results = [];
  const makePromise = (b, idx) => {
    return async () => {
      console.time(`[${idx}] runBatchJob`);
      var content = [{ text: JSON.stringify(b) + "\n" + prompt }];
      if (file) {
        content.push({
          fileData: {
            fileUri: file.uri,
            mimeType: file.mimeType,
          },
        });
      }
      console.error(idx, [content]);
      let respObj = await generateContent(content);
      let response = JSON.parse(respObj.text);
      console.error(idx, [respObj.text]);
      console.timeEnd(`[${idx}] runBatchJob`);

      results[idx] = response;
    };
  };
  batch.forEach((b, idx) => {
    promises.push(makePromise(b, idx));
  });

  const statuses = await runWithConcurrency(promises, 10);

  statuses.forEach((s) => {
    if (s.status === "rejected") {
      console.error("runBatchJob failed", s);
    }
  });

  await ai.files.delete({ name: file.name });
  console.error(`Deleted file: ${file.name}`);

  return results;
}

export async function runWithConcurrency(promiseFactories, maxConcurrency = 5) {
  // Handle empty input array gracefully.
  if (!promiseFactories || promiseFactories.length === 0) {
    return Promise.resolve([]);
  }

  const results = new Array(promiseFactories.length);
  let currentIndex = 0;

  // The worker function is the core of our concurrent execution.
  // Each worker will pull tasks from the `promiseFactories` array until none are left.
  const worker = async () => {
    // The loop continues as long as there are tasks to process.
    while (currentIndex < promiseFactories.length) {
      // Atomically get the index for the current task and increment the master index.
      // This ensures each task is picked up by exactly one worker.
      const taskIndex = currentIndex++;
      const promiseFactory = promiseFactories[taskIndex];

      // If the index is out of bounds (because another worker took the last item),
      // this worker's job is done.
      if (!promiseFactory) {
        continue;
      }

      try {
        // Execute the function to start the promise.
        const value = await retryOperation(promiseFactory, 3, 2000);
        // Store the successful result in the `Promise.allSettled` format.
        results[taskIndex] = { status: "fulfilled", value };
      } catch (error) {
        // If the promise rejects, store the reason in the `Promise.allSettled` format.
        results[taskIndex] = { status: "rejected", reason: error };
      }
    }
  };

  // Determine the number of workers to start.
  // It's either the concurrency limit or the number of tasks, whichever is smaller.
  const numWorkers = Math.min(maxConcurrency, promiseFactories.length);

  // Create an array of worker promises. Each promise in this array represents
  // a worker that will continue processing tasks until the queue is empty.
  const workerPromises = Array.from({ length: numWorkers }, () => worker());

  // Wait for all workers to complete their jobs.
  await Promise.all(workerPromises);

  // Return the final results array, which is now fully populated.
  return results;
}

export async function retryOperation(asyncFunction, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await asyncFunction();
      return result; // Success, return the result
    } catch (error) {
      if (i < retries - 1) {
        console.warn(
          `Attempt ${i + 1} failed. Retrying in ${delay / 1000} seconds...`,
          error,
        );
        await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
      } else {
        console.error(`All ${retries} attempts failed.`);
        throw error; // Re-throw the error if all retries are exhausted
      }
    }
  }
}
