const API_URL = '/api'; // בגלל שהם באותו דומיין ב-Railway

export const api = {
  // משיכת כל הנתונים (קמפיין ותרומות)
  async getData() {
    const res = await fetch(`${API_URL}/data`);
    return res.json();
  },

  // שליחת תרומה חדשה לשמירה ב-DB
  async addDonation(donation: any) {
    const res = await fetch(`${API_URL}/donations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donation),
    });
    return res.json();
  }
};