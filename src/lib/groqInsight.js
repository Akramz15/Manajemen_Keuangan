import Groq from 'groq-sdk'
import { PROFIL_LABEL } from './utils.js'

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
})

/**
 * Generate AI insight dari data keuangan user
 * @param {Object} data - { profesi, pemasukanBulanan, targetTabungan, budgetHarian, pengeluaran, perKategori, hariKe, totalHari }
 * @returns {Object} { status, emoji, warna, analisis[], saran[] }
 */
export async function getFinancialInsight(data) {
  const {
    profesi,
    pemasukanBulanan,
    targetTabungan,
    budgetHarian,
    pengeluaran,
    perKategori,
    hariKe,
    totalHari,
  } = data

  const sisaHari = totalHari - hariKe
  const budgetTerpakai = pengeluaran
  const budgetSeharusnya = budgetHarian * hariKe
  const selisih = budgetSeharusnya - budgetTerpakai
  const persenHabis = pemasukanBulanan > 0 ? Math.round((pengeluaran / pemasukanBulanan) * 100) : 0

  const kategoriStr = Object.entries(perKategori)
    .sort(([, a], [, b]) => b - a)
    .map(([k, v]) => `${k}: Rp ${v.toLocaleString('id-ID')}`)
    .join(', ')

  const prompt = `Kamu adalah asisten keuangan personal berbahasa Indonesia yang ramah dan to-the-point.

Data keuangan pengguna pada periode siklus ini:
- Profesi: ${PROFIL_LABEL[profesi] || profesi}
- Total Pemasukan Siklus Ini (dinormalisasi): Rp ${pemasukanBulanan.toLocaleString('id-ID')}
- Target Tabungan Periode Ini: Rp ${targetTabungan.toLocaleString('id-ID')}
- Budget Harian: Rp ${budgetHarian.toLocaleString('id-ID')}
- Total Pengeluaran Sejauh Ini: Rp ${budgetTerpakai.toLocaleString('id-ID')}
- Hari ke-${hariKe} dari ${totalHari} hari di periode siklus ini
- Sisa hari: ${sisaHari} hari
- Budget seharusnya terpakai sampai hari ini: Rp ${budgetSeharusnya.toLocaleString('id-ID')}
- Selisih (positif = hemat, negatif = boros): Rp ${selisih.toLocaleString('id-ID')}
- Pengeluaran sudah ${persenHabis}% dari pemasukan
- Breakdown pengeluaran per kategori: ${kategoriStr || 'belum ada pengeluaran'}

Tugas: Berikan analisis keuangan yang singkat, jelas, dan personal dalam Bahasa Indonesia.

Kembalikan HANYA JSON dengan format persis ini (jangan tambah teks lain):
{
  "status": "aman" | "perhatian" | "bahaya",
  "emoji": "🟢" | "🟡" | "🔴",
  "ringkasan": "satu kalimat ringkasan status keuangan",
  "analisis": ["poin 1", "poin 2", "poin 3"],
  "saran": ["saran 1", "saran 2", "saran 3"]
}`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 512,
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah asisten keuangan personal yang memberikan analisis dalam format JSON. Selalu jawab dengan JSON yang valid sesuai format yang diminta.',
        },
        { role: 'user', content: prompt },
      ],
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) throw new Error('No response')

    const parsed = JSON.parse(raw)

    // Validasi fields
    return {
      status:    parsed.status   || 'perhatian',
      emoji:     parsed.emoji    || '🟡',
      ringkasan: parsed.ringkasan || 'Analisis keuangan tersedia.',
      analisis:  Array.isArray(parsed.analisis) ? parsed.analisis : [],
      saran:     Array.isArray(parsed.saran)    ? parsed.saran    : [],
    }
  } catch (err) {
    console.error('Groq API error:', err)
    throw err
  }
}
