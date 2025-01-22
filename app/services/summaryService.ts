const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface AISummaryResponse {
  response: string;
}

export async function getAISummary(token: string): Promise<AISummaryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/aiSummary`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch AI summary");
  return response.json();
} 