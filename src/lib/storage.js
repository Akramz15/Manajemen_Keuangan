import { db, auth } from './firebase.js'
import { doc, setDoc, getDoc } from 'firebase/firestore'

// ==========================================
// LOCALSTORAGE KEYS
// ==========================================
export const KEYS = {
  PROFILE: 'finsight_profile',
  TRANSACTIONS: 'finsight_transactions',
  BUKU_KAS: 'finsight_bukukas',
}

// ==========================================
// CLOUD SYNC LOGIC
// ==========================================
export async function syncToCloud(uid) {
  if (!uid) return
  try {
    const data = {
      profile: getProfile() || null,
      transactions: getTransactions() || [],
      bukuKas: getBukuKas() || [],
      updatedAt: new Date().toISOString()
    }
    await setDoc(doc(db, 'users', uid), data)
  } catch (err) {
    console.error("Gagal sinkronisasi ke cloud:", err)
  }
}

export async function syncFromCloud(uid) {
  if (!uid) return false
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) {
      const data = snap.data()
      if (data.profile) localStorage.setItem(KEYS.PROFILE, JSON.stringify(data.profile))
      if (data.transactions) localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(data.transactions))
      if (data.bukuKas) localStorage.setItem(KEYS.BUKU_KAS, JSON.stringify(data.bukuKas))
      return true
    }
    return false
  } catch (err) {
    console.error("Gagal menarik data dari cloud:", err)
    return false
  }
}

function triggerSync() {
  if (auth.currentUser) {
    syncToCloud(auth.currentUser.uid).catch(console.error)
  }
}

// ==========================================
// PROFILE
// ==========================================
export function getProfile() {
  try {
    const raw = localStorage.getItem(KEYS.PROFILE)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveProfile(profile, sync = true) {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile))
  if (sync) triggerSync()
}

// ==========================================
// TRANSACTIONS
// ==========================================
export function getTransactions() {
  try {
    const raw = localStorage.getItem(KEYS.TRANSACTIONS)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveTransactions(transactions, sync = true) {
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions))
  if (sync) triggerSync()
}

export function addTransaction(tx) {
  const all = getTransactions()
  const newTx = { ...tx, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
  saveTransactions([newTx, ...all])
  return newTx
}

export function deleteTransaction(id) {
  const all = getTransactions().filter(t => t.id !== id)
  saveTransactions(all)
}

// ==========================================
// BUKU KAS
// ==========================================
export function getBukuKas() {
  try {
    const raw = localStorage.getItem(KEYS.BUKU_KAS)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveBukuKas(entries, sync = true) {
  localStorage.setItem(KEYS.BUKU_KAS, JSON.stringify(entries))
  if (sync) triggerSync()
}

export function addBukuKasEntry(entry) {
  const all = getBukuKas()
  const sameBulan = all.filter(e => e.bulan === entry.bulan)
  const nomor = sameBulan.length + 1
  const newEntry = { ...entry, id: crypto.randomUUID(), nomor, createdAt: new Date().toISOString() }
  saveBukuKas([...all, newEntry])
  return newEntry
}

export function deleteBukuKasEntry(id) {
  const all = getBukuKas().filter(e => e.id !== id)
  const bulanMap = {}
  all.forEach(e => {
    if (!bulanMap[e.bulan]) bulanMap[e.bulan] = 0
    bulanMap[e.bulan]++
    e.nomor = bulanMap[e.bulan]
  })
  saveBukuKas(all)
}

// ==========================================
// CLEAR ALL DATA
// ==========================================
export function clearAllData() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k))
  // We do NOT clear cloud data here by default unless requested
}
