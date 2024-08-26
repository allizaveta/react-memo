const URL = "https://wedev-api.sky.pro/api/v2/leaderboard";

export async function getLeaders() {
  const response = await fetch(URL);

  if (response.status !== 200) {
    throw new Error("Ошибка");
  }
  const data = await response.json();
  console.log(data.leaders);
  return data.leaders;
}

export async function postLeader(data) {
  try {
    const jsonData = JSON.stringify({
      name: data.name || "Пользователь",
      time: data.time,
      achievements: data.achievements || [],
    });
    const response = await fetch("https://wedev-api.sky.pro/api/v2/leaderboard", {
      method: "POST",
      headers: {},
      body: jsonData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка: ${response.status}. ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка при отправке данных:", error);
    throw error;
  }
}
