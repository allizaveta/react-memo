const URL = "https://wedev-api.sky.pro/api/leaderboard";

export async function getLeaders() {
  const response = await fetch(URL);

  if (response.status !== 200) {
    throw new Error("Ошибка");
  }
  const data = await response.json();
  return data.leaders;
}

export async function addLeader({ id, name, time }) {
  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      name,
      time,
    }),
  });

  if (!response.ok) {
    throw new Error("Ошибка!");
  }
  const data = await response.json();
  return data.leaders;
}
