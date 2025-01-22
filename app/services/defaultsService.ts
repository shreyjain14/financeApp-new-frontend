const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface DefaultsResponse {
  email: string;
  payedTo: string[];
  payedFrom: string[];
}

// Get all defaults
export async function getAllDefaults(token: string): Promise<DefaultsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/defaults`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch defaults");
  return response.json();
}

// PayedTo defaults
export async function getPayedToDefaults(token: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/defaults/payedTo`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch payed to defaults");
  return response.json();
}

export async function addPayedToDefault(pay: string, token: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/defaults/payedTo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ pay }),
  });

  if (!response.ok) throw new Error("Failed to add payed to default");
  return response.json();
}

export async function deletePayedToDefault(pay: string, token: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/defaults/payedTo`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ pay }),
  });

  if (!response.ok) throw new Error("Failed to delete payed to default");
  return response.json();
}

// PayedFrom defaults
export async function getPayedFromDefaults(token: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/defaults/payedFrom`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch payed from defaults");
  return response.json();
}

export async function addPayedFromDefault(pay: string, token: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/defaults/payedFrom`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ pay }),
  });

  if (!response.ok) throw new Error("Failed to add payed from default");
  return response.json();
}

export async function deletePayedFromDefault(pay: string, token: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/defaults/payedFrom`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ pay }),
  });

  if (!response.ok) throw new Error("Failed to delete payed from default");
  return response.json();
}

// Update to use api/share for settings
export async function getSharedWithUsers(token: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/share/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch shared with users");
  return response.json();
}

// Rename to be more specific about the direction
export async function getSharedToMeUsers(token: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/share/to-me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch users sharing with me");
  return response.json();
}

export async function addSharedUser(email: string, token: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/share/?email=${email}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to add shared user");
  return response.json();
}

export async function removeSharedUser(email: string, token: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/share/?email=${email}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to remove shared user");
  return response.json();
} 