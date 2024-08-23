const URL = "https://wedev-api.sky.pro/api/leaderboard";

export async function getLeaders() {
  const response = await fetch(URL);

  if (response.status !== 200) {
    throw new Error("Ошибка");
  }
  const data = await response.json();
  return data.leaders;
}

export async function postLeader(data) {
  try {
    const response = await fetch("https://wedev-api.sky.pro/api/leaderboard", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Ошибка при отправке данных:", error);
    throw error;
  }
}
