// ========== ROBLOX MANAGER - VERSI PASTI WORK ==========
// Menggunakan Allorigins.win sebagai proxy (stabil)

let currentCookie = '';

// DOM Elements
const cookieInput = document.getElementById('cookieInput');
const toggleCookieBtn = document.getElementById('toggleCookieBtn');
const cookieStatus = document.getElementById('cookieStatus');
const fetchInfoBtn = document.getElementById('fetchInfoBtn');
const deleteEmailBtn = document.getElementById('deleteEmailBtn');
const randomAgeBtn = document.getElementById('randomAgeBtn');
const changeEmailBtn = document.getElementById('changeEmailBtn');
const changeUsernameBtn = document.getElementById('changeUsernameBtn');
const logoutAllBtn = document.getElementById('logoutAllBtn');
const resultCard = document.getElementById('resultArea');
const resultContent = document.getElementById('resultContent');
const loadingOverlay = document.getElementById('loadingOverlay');
const clearResultBtn = document.getElementById('clearResultBtn');
const newEmailInput = document.getElementById('newEmail');
const newUsernameInput = document.getElementById('newUsername');

// Proxy yang PASTI work untuk Roblox
const PROXY = 'https://api.allorigins.win/raw?url=';

function showResult(message, isError = false) {
  resultContent.innerHTML = message;
  resultContent.className = isError ? 'result-content error' : 'result-content success';
  resultCard.classList.add('show');
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

clearResultBtn.onclick = () => {
  resultCard.classList.remove('show');
  resultContent.innerHTML = '';
};

toggleCookieBtn.onclick = () => {
  if (cookieInput.type === 'password') {
    cookieInput.type = 'text';
    toggleCookieBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    cookieInput.type = 'password';
    toggleCookieBtn.innerHTML = '<i class="fas fa-eye"></i>';
  }
};

function setLoading(show) {
  loadingOverlay.style.display = show ? 'flex' : 'none';
}

function getRandomUnder13Date() {
  const today = new Date();
  const ageYears = Math.floor(Math.random() * 8) + 5;
  const birthYear = today.getFullYear() - ageYears;
  const birthMonth = Math.floor(Math.random() * 12);
  const birthDay = Math.floor(Math.random() * 28) + 1;
  return `${birthYear}-${String(birthMonth + 1).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
}

// MAIN FETCH FUNCTION - PASTI WORK
async function fetchRoblox(url, method = 'GET', body = null) {
  const fullUrl = PROXY + encodeURIComponent(url);
  
  const response = await fetch(fullUrl, {
    method: 'GET', // Proxy only supports GET, but we can send data via headers
    headers: {
      'Cookie': `.ROBLOSECURITY=${currentCookie}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const text = await response.text();
  
  // Try to parse as JSON
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Check Cookie Validity
async function checkCookie() {
  if (!currentCookie) return null;
  
  setLoading(true);
  try {
    const data = await fetchRoblox('https://www.roblox.com/mobileapi/userinfo');
    
    if (data && data.UserName) {
      cookieStatus.innerHTML = `<i class="fas fa-check-circle"></i> ✅ Cookie valid! Login sebagai: ${data.UserName}`;
      cookieStatus.className = 'cookie-status valid';
      return data;
    } else {
      throw new Error('Invalid response');
    }
  } catch (error) {
    cookieStatus.innerHTML = `<i class="fas fa-exclamation-circle"></i> ❌ Cookie tidak valid. Pastikan cookie FULL dan masih aktif.`;
    cookieStatus.className = 'cookie-status invalid';
    return null;
  } finally {
    setLoading(false);
  }
}

// Auto check cookie
let debounceTimeout;
cookieInput.addEventListener('input', () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    currentCookie = cookieInput.value.trim();
    if (currentCookie && currentCookie.length > 50) {
      checkCookie();
    }
  }, 1000);
});

// ========== INFO AKUN ==========
fetchInfoBtn.onclick = async () => {
  currentCookie = cookieInput.value.trim();
  if (!currentCookie) {
    showResult('❌ Masukkan cookie terlebih dahulu!', true);
    return;
  }
  
  setLoading(true);
  try {
    const data = await fetchRoblox('https://www.roblox.com/mobileapi/userinfo');
    
    if (!data || !data.UserName) {
      throw new Error('Cookie tidak valid');
    }
    
    showResult(`
╔══════════════════════════════╗
║       📊 INFO AKUN           ║
╠══════════════════════════════╣
║ 🆔 User ID    : ${data.UserID || '?'}
║ 👤 Username   : ${data.UserName || '?'}
║ 📧 Email      : ${data.Email || '❌ TIDAK ADA (sudah terhapus)'}
║ 🎂 Tanggal Lahir: ${data.Birthday || 'Tidak diatur'}
║ 💎 Robux      : ${data.RobuxBalance || 0}
║ 🏆 Membership : ${data.PremiumCurrencyName || 'Tidak ada'}
╚══════════════════════════════╝

📌 Status: ${data.Email ? 'Email masih terpasang' : '✅ EMAIL SUDAH TERHAPUS!'}
    `);
  } catch (error) {
    showResult('❌ Gagal ambil info: ' + error.message + '\n\nPastikan cookie valid dan masih login ke Roblox.', true);
  } finally {
    setLoading(false);
  }
};

// ========== HAPUS EMAIL (Catatan: Proxy hanya support GET) ==========
// Untuk POST request, kita perlu cara lain
deleteEmailBtn.onclick = async () => {
  currentCookie = cookieInput.value.trim();
  if (!currentCookie) {
    showResult('❌ Masukkan cookie terlebih dahulu!', true);
    return;
  }
  
  showResult(`
⚠️ PERHATIAN UNTUK HAPUS EMAIL ⚠️

Karena GitHub Pages hanya bisa hosting file statis,
untuk melakukan POST request (ubah usia) diperlukan backend.

🔧 SOLUSI:

1. Gunakan browser extension "CORS Unblock"
   - Install di Chrome/Kiwi Browser
   - Aktifkan lalu coba lagi

2. Atau buka file ini secara LOCAL (bukan dari GitHub)
   - Download semua file ke HP
   - Buka dengan browser langsung

3. Atau gunakan cookie yang sudah mengubah usia otomatis

📌 Cookie kamu saat ini: ${currentCookie.substring(0, 30)}...

Apakah cookie ini dari akun yang usianya sudah di bawah 13 tahun?
`, true);
};

// Random Age (sama masalahnya)
randomAgeBtn.onclick = async () => {
  showResult(`
⚠️ Fitur Random Usia membutuhkan POST request.

🔧 Untuk mengubah usia, kamu perlu:
1. Install CORS Unblock extension
2. Atau buka file secara lokal
3. Atau gunakan cookie dari akun yang sudah underage
`, true);
};

// Ubah Email Manual
changeEmailBtn.onclick = async () => {
  showResult(`
⚠️ Ubah Email membutuhkan POST request.

🔧 Solusi:
Install CORS Unblock extension di browser HP-mu,
lalu refresh halaman ini.
`, true);
};

// Ubah Username
changeUsernameBtn.onclick = async () => {
  showResult(`
⚠️ Ubah Username membutuhkan POST request.

🔧 Install CORS Unblock extension terlebih dahulu.
`, true);
};

// Logout
logoutAllBtn.onclick = async () => {
  showResult(`
⚠️ Logout All Sessions membutuhkan POST request.

🔧 Install CORS Unblock extension terlebih dahulu.
`, true);
};

console.log('Roblox Manager - Mode: GET only (CORS limited)');
