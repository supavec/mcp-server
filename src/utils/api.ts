export const SUPAVEC_BASE_URL = "https://api.supavec.com";

export async function makeSupavecRequest<T>(
  url: string,
  body: object,
  apiKey: string
): Promise<T | { error: string }> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      return {
        error: `Failed to fetch data: status ${response.status}`,
      };
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    return {
      error: `Failed to fetch data: ${error}`,
    };
  }
}
