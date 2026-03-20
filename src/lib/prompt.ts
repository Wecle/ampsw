import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

function createPrompt() {
  return createInterface({
    input,
    output,
  });
}

export async function confirm(question: string): Promise<boolean> {
  const rl = createPrompt();
  try {
    const answer = (await rl.question(`${question} [y/N] `)).trim().toLowerCase();
    return answer === "y" || answer === "yes";
  } finally {
    rl.close();
  }
}

export async function promptText(question: string): Promise<string> {
  const rl = createPrompt();
  try {
    return (await rl.question(`${question} `)).trim();
  } finally {
    rl.close();
  }
}
