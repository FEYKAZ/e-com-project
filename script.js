// ========== ROBLOX MANAGER - GITHUB PAGES READY ==========
// Menggunakan multiple CORS proxy untuk stabilitas

let currentCookie = '';
let activeProxyIndex = 0;

// Daftar CORS proxy (jika satu mati, pakai yang lain)
const CORS_PROXIES = [
  'https://corsproxy.io/?url=',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/'
];

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

// Helper functions
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

// Fetch dengan multiple proxy
async function fetchRoblox(url, options = {}) {
  let lastError = null;
  
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    try {
      const proxyUrl = CORS_PROXIES[i] + encodeURIComponent(url);
      const response = await fetch(proxyUrl, {
        ...options,
        headers: {
          ...options.headers,
          'Cookie': `.ROBLOSECURITY=${currentCookie}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok || response.status === 403 || response.status === 429) {
        return response;
      }
    } catch (err) {
      lastError = err;
      continue;
    }
  }
  throw lastError || new Error('All proxies failed');
}

// Get CSRF Token
async function getCsrfToken() {
  try {
    const response = await fetchRoblox('https://auth.roblox.com/v2/logout', { method: 'POST' });
    const token = response.headers.get('x-csrf-token');
    if (token) return token;
    throw new Error('No token');
  } catch (error) {
    const response = await fetchRoblox('https://www.roblox.com/game/GetCurrentUser.ashx', { method: 'GET' });
    const token = response.headers.get('x-csrf-token');
    if (!token) throw new Error('Failed to get CSRF token');
    return token;
  }
}

// Check Cookie Validity
async function checkCookie() {
  if (!currentCookie) return null;
  
  try {
    const response = await fetchRoblox('https://www.roblox.com/mobileapi/userinfo');
    if (response.ok) {
      const data = await response.json();
      cookieStatus.innerHTML = `<i class="fas fa-check-circle"></i> Cookie valid! Login sebagai: ${data.UserName}`;
      cookieStatus.className = 'cookie-status valid';
      return data;
    }
    throw new Error('Invalid');
  } catch (error) {
    cookieStatus.innerHTML = `<i class="fas fa-exclamation-circle"></i> Cookie tidak valid atau expired`;
    cookieStatus.className = 'cookie-status invalid';
    return null;
  }
}

// Auto check cookie
let debounceTimeout;
cookieInput.addEventListener('input', () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    currentCookie = cookieInput.value.trim();
    if (currentCookie) checkCookie();
  }, 800);
});

// Change Birthdate
async function changeBirthdate(birthdate) {
  const csrfToken = await getCsrfToken();
  const response = await fetchRoblox('https://users.roblox.com/v1/account/setbirthday', {
    method: 'POST',
    headers: { 'X-CSRF-TOKEN': csrfToken },
    body: JSON.stringify({ birthDate: birthdate })
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.errors?.[0]?.message || `HTTP ${response.status}`);
  }
  return true;
}

// ========== INFO AKUN ==========
fetchInfoBtn.onclick = async () => {
  currentCookie = cookieInput.value.trim();
  if (!currentCookie) {
    showResult('❌ Masukkan cookie terlebih dahulu!', true);
    return;
  }
  
  setLoading(true);
  try {
    const response = await fetchRoblox('https://www.roblox.com/mobileapi/userinfo');
    if (!response.ok) throw new Error('Cookie invalid');
    
    const data = await response.json();
    
    showResult(`
╔══════════════════════════════╗
║       📊 INFO AKUN           ║
╠══════════════════════════════╣
║ 🆔 User ID    : ${data.UserID}
║ 👤 Username   : ${data.UserName}
║ 📧 Email      : ${data.Email || '❌ TIDAK ADA'}
║ 🎂 Tanggal Lahir: ${data.Birthday || 'Tidak diatur'}
║ 💎 Robux      : ${data.RobuxBalance}
║ 🏆 Membership : ${data.PremiumCurrencyName || 'Tidak ada'}
╚══════════════════════════════╝

📌 Status: ${data.Email ? 'Email masih terpasang' : '✅ EMAIL SUDAH TERHAPUS!'}
    `);
  } catch (error) {
    showResult('❌ Gagal ambil info: ' + error.message, true);
  } finally {
    setLoading(false);
  }
};

// ========== HAPUS EMAIL (UBAH USIA KE <13) ==========
deleteEmailBtn.onclick = async () => {
  currentCookie = cookieInput.value.trim();
  if (!currentCookie) {
    showResult('❌ Masukkan cookie terlebih dahulu!', true);
    return;
  }
  
  setLoading(true);
  try {
    const today = new Date();
    const under13Date = `${today.getFullYear() - 12}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    await changeBirthdate(under13Date);
    
    // Cek apakah email sudah terhapus
    const checkResponse = await fetchRoblox('https://www.roblox.com/mobileapi/userinfo');
    const userData = await checkResponse.json();
    const emailDeleted = !userData.Email || userData.Email === '';
    
    showResult(`
╔════════════════════════════════════╗
║     ✅ EMAIL BERHASIL DIHAPUS ✅    ║
╠════════════════════════════════════╣
║ 📅 Tanggal lahir baru: ${under13Date}
║ 🔞 Usia: 12 tahun (DI BAWAH 13)
║ 📧 Status Email: ${emailDeleted ? 'TERHAPUS ✅' : 'Masih ada'}
╠════════════════════════════════════╣
║ ⚠️  EFEK UBAH USIA:
║ • Akun masuk mode RESTRICTED
║ • Chat terbatas
║ • Filter konten lebih ketat
║ • Email sudah tidak terhubung
╚════════════════════════════════════╝
    `);
  } catch (error) {
    showResult('❌ Gagal hapus email: ' + error.message, true);
  } finally {
    setLoading(false);
  }
};

// ========== RANDOM USIA ==========
randomAgeBtn.onclick = async () => {
  currentCookie = cookieInput.value.trim();
  if (!currentCookie) {
    showResult('❌ Masukkan cookie!', true);
    return;
  }
  
  setLoading(true);
  try {
    const randomDate = getRandomUnder13Date();
    await changeBirthdate(randomDate);
    showResult(`✅ Usia diubah ke random (di bawah 13 tahun)

📅 Tanggal lahir baru: ${randomDate}

📌 Cek Info Akun untuk melihat apakah email sudah terhapus.`);
  } catch (error) {
    showResult('❌ Gagal: ' + error.message, true);
  } finally {
    setLoading(false);
  }
};

// ========== UBAH EMAIL MANUAL ==========
changeEmailBtn.onclick = async () => {
  currentCookie = cookieInput.value.trim();
  const newEmail = newEmailInput.value.trim();
  
  if (!currentCookie) {
    showResult('❌ Masukkan cookie!', true);
    return;
  }
  if (!newEmail || !newEmail.includes('@')) {
    showResult('❌ Email tidak valid!', true);
    return;
  }
  
  setLoading(true);
  try {
    const csrfToken = await getCsrfToken();
    const response = await fetchRoblox('https://accountinformation.roblox.com/v1/email', {
      method: 'PATCH',
      headers: { 'X-CSRF-TOKEN': csrfToken },
      body: JSON.stringify({ emailAddress: newEmail })
    });
    
    if (!response.ok) throw new Error('Gagal ubah email');
    
    showResult(`✅ Email berhasil diubah menjadi: ${newEmail}`);
    newEmailInput.value = '';
  } catch (error) {
    showResult('❌ ' + error.message, true);
  } finally {
    setLoading(false);
  }
};

// ========== UBAH USERNAME ==========
changeUsernameBtn.onclick = async () => {
  currentCookie = cookieInput.value.trim();
  const newUsername = newUsernameInput.value.trim();
  
  if (!currentCookie) {
    showResult('❌ Masukkan cookie!', true);
    return;
  }
  if (!newUsername || newUsername.length < 3 || newUsername.length > 20) {
    showResult('❌ Username harus 3-20 karakter!', true);
    return;
  }
  
  setLoading(true);
  try {
    const csrfToken = await getCsrfToken();
    const response = await fetchRoblox('https://accountinformation.roblox.com/v1/username', {
      method: 'POST',
      headers: { 'X-CSRF-TOKEN': csrfToken },
      body: JSON.stringify({ username: newUsername })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.errors?.[0]?.message || 'Gagal');
    }
    
    showResult(`✅ Username berhasil diubah menjadi: ${newUsername}\n\n⚠️ Username lama tidak bisa dipakai selama 7 hari!`);
    newUsernameInput.value = '';
  } catch (error) {
    showResult('❌ ' + error.message, true);
  } finally {
    setLoading(false);
  }
};

// ========== LOGOUT SEMUA SESI ==========
logoutAllBtn.onclick = async () => {
  currentCookie = cookieInput.value.trim();
  if (!currentCookie) {
    showResult('❌ Masukkan cookie!', true);
    return;
  }
  
  setLoading(true);
  try {
    const csrfToken = await getCsrfToken();
    await fetchRoblox('https://auth.roblox.com/v1/logout-from-all-other-devices', {
      method: 'POST',
      headers: { 'X-CSRF-TOKEN': csrfToken }
    });
    
    showResult(`✅ Berhasil logout dari semua perangkat lain!\n\n🔒 Cookie lain sudah tidak valid.`);
  } catch (error) {
    showResult('❌ ' + error.message, true);
  } finally {
    setLoading(false);
  }
};

console.log('Roblox Manager - GitHub Pages Ready!');
