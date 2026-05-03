/** @format */

console.log("E-=> p+");

const btn = document.getElementById("generate");
const topic = document.getElementById("topic");
const output = document.getElementById("output");
const historyDiv = document.getElementById("history");
const newScriptBtn = document.getElementById("new-script");
const apiKeyInput = document.getElementById("api-key");

const savedKey = localStorage.getItem("geminiKey");
if (savedKey) {
  apiKeyInput.value = savedKey;
}

apiKeyInput.addEventListener("input", () => {
  localStorage.setItem("geminiKey", apiKeyInput.value);
});

btn.addEventListener("click", async () => {
  const current = localStorage.getItem("generations");
  let list;
  if (current === null) {
    list = [];
  } else {
    list = JSON.parse(current);
  }

  const value = topic.value;

  if (!value) {
    output.textContent = "Please enter valid topic first...";

    return;
  }

  if (!apiKeyInput.value) {
    output.textContent = "Please paste your Gemini API key above first.";
    return;
  }

  btn.textContent = "Generating...";
  btn.disabled = true;
  output.textContent = "";

  // fetching api to get prpmot ans:
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKeyInput.value,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate a Hinglish script, so it should be in given format: so make it Short for upto 45 sec to 55 sec max, It should have been in 3 sections:Goes like Hook, Build, and PayOff, set the time for each as you find it ok as per the topic given by, and remember it must be Short to intermediate sentences, conversational, no jargon, should be easy to understand by people who is light years away from science: ${value} `,
                },
              ],
            },
          ],
        }),
      },
    );

    const data = await response.json();
    console.log(data);
    if (data.error) {
      output.textContent = "Error: " + data.error.message;
    } else {
      output.textContent = data.candidates[0].content.parts[0].text;

      // saving into localstorage,
      const generation = {
        topic: value,
        script: data.candidates[0].content.parts[0].text,
      };
      list.push(generation);
      localStorage.setItem("generations", JSON.stringify(list));
      renderHistory();
    }
  } catch (err) {
    console.log(err);
    output.textContent = "Network error. Check your internet connection!";
  } finally {
    btn.textContent = "Generate script";
    btn.disabled = false;
  }
});

//new funtion for showing history:

function renderHistory() {
  // READ THE"GEN" FROM LOCALSTORAGE
  const chat = localStorage.getItem("generations");
  let list;
  if (chat === null) {
    list = [];
  } else {
    list = JSON.parse(chat);
  }

  historyDiv.textContent = "";

  list.forEach((item, index) => {
    const hisDiv = document.createElement("div");
    hisDiv.textContent = item.topic;
    hisDiv.className =
      "flex justify-between items-center bg-slate-900/40 border border-slate-800 hover:border-indigo-500 hover:bg-slate-900/70 rounded-lg px-4 py-3 transition cursor-pointer";

    hisDiv.addEventListener("click", () => {
      output.textContent = item.script;
      topic.value = item.topic;
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑";
    delBtn.className = "text-slate-500 hover:text-red-400 transition ml-3";

    delBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      // read the list from ls:
      const chatt = localStorage.getItem("generations");
      let remList;
      if (chatt === null) {
        remList = [];
      } else {
        remList = JSON.parse(chatt);
      }

      remList.splice(index, 1);
      localStorage.setItem("generations", JSON.stringify(remList));
      renderHistory();
    });

    hisDiv.append(delBtn);
    historyDiv.appendChild(hisDiv);
  });
}

renderHistory();

newScriptBtn.addEventListener("click", () => {
  output.textContent = "";
  topic.value = "";
  topic.focus();
});
