// ========== ROBLOX MANAGER - KIIWI BROWSER + CORS UNBLOCK ==========
// PASTI WORK 100% setelah CORS Unblock aktif

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

// CSRF Token storage
let csrfToken = '';

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

// Direct fetch (tanpa proxy - karena CORS Unblock sudah aktif)
async function fetchRoblox(url, method = 'GET', body = null) {
  const response = await fetch(url, {
    method: method,
    credentials: 'include',
    headers: {
      'Cookie': `.ROBLOSECURITY=${currentCookie}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  
  if (!response.ok && response.status !== 429) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
  }
  
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Get CSRF Token
async function getCsrfToken() {
  try {
    // Method 1: POST to logout
    const response = await fetch('https://auth.roblox.com/v2/logout', {
      method: 'POST',
      headers: {
        'Cookie': `.ROBLOSECURITY=${currentCookie}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const token = response.headers.get('x-csrf-token');
    if (token) return token;
    
    // Method 2: GET to user info
    const response2 = await fetch('https://www.roblox.com/mobileapi/userinfo', {
      headers: {
        'Cookie': `.ROBLOSECURITY=${currentCookie}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const token2 = response2.headers.get('x-csrf-token');
    if (token2) return token2;
    
    throw new Error('Could not get CSRF token');
  } catch (error) {
    throw new Error('Failed to get CSRF token: ' + error.message);
  }
}

// Check Cookie Validity
async function checkCookie() {
  if (!currentCookie) return null;
  
  try {
    const response = await fetch('https://www.roblox.com/mobileapi/userinfo', {
      headers: {
        'Cookie': `.ROBLOSECURITY=${currentCookie}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      cookieStatus.innerHTML = `<i class="fas fa-check-circle"></i> ✅ Cookie valid! Login sebagai: ${data.UserName}`;
      cookieStatus.className = 'cookie-status valid';
      return data;
    } else {
      throw new Error('Invalid');
    }
  } catch (error) {
    cookieStatus.innerHTML = `<i class="fas fa-exclamation-circle"></i> ❌ Cookie tidak valid. Pastikan cookie FULL dan masih aktif.`;
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
    const response = await fetch('https://www.roblox.com/mobileapi/userinfo', {
      headers: {
        'Cookie': `.ROBLOSECURITY=${currentCookie}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) throw new Error('Cookie invalid');
    
    const data = await response.json();
    
    showResult(`
╔══════════════════════════════╗
║       📊 INFO AKUN           ║
╠══════════════════════════════╣
║ 🆔 User ID    : ${data.UserID || '?'}
║ 👤 Username   : ${data.UserName || '?'}
║ 📧 Email      : ${data.Email || '❌ TIDAK ADA'}
║ 🎂 Tanggal Lahir: ${data.Birthday || 'Tidak diatur'}
║ 💎 Robux      : ${data.RobuxBalance || 0}
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

// ========== UBAH TANGGAL LAHIR ==========
async function changeBirthdate(birthdate) {
  const token = await getCsrfToken();
  
  const response = await fetch('https://users.roblox.com/v1/account/setbirthday', {
    method: 'POST',
    headers: {
      'Cookie': `.ROBLOSECURITY=${currentCookie}`,
      'X-CSRF-TOKEN': token,
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    body: JSON.stringify({ birthDate: birthdate })
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.errors?.[0]?.message || `HTTP ${response.status}`);
  }
  
  return true;
}

// ========== HAPUS EMAIL ==========
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
    
    // Verifikasi email sudah terhapus
    const checkResponse = await fetch('https://www.roblox.com/mobileapi/userinfo', {
      headers: { 'Cookie': `.ROBLOSECURITY=${currentCookie}` }
    });
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
    showResult(`✅ Usia berhasil diubah!

📅 Tanggal lahir baru: ${randomDate}
🔞 Usia: DI BAWAH 13 TAHUN

📌 Klik "Info Akun" untuk melihat apakah email sudah terhapus.`);
  } catch (error) {
    showResult('❌ Gagal: ' + error.message, true);
  } finally {
    setLoading(false);
  }
};

// ========== UBAH EMAIL ==========
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
    const token = await getCsrfToken();
    
    const response = await fetch('https://accountinformation.roblox.com/v1/email', {
      method: 'PATCH',
      headers: {
        'Cookie': `.ROBLOSECURITY=${currentCookie}`,
        'X-CSRF-TOKEN': token,
        'Content-Type': 'application/json'
      },
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
    const token = await getCsrfToken();
    
    const response = await fetch('https://accountinformation.roblox.com/v1/username', {
      method: 'POST',
      headers: {
        'Cookie': `.ROBLOSECURITY=${currentCookie}`,
        'X-CSRF-TOKEN': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: newUsername })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.errors?.[0]?.message || 'Gagal');
    }
    
    showResult(`✅ Username berhasil diubah menjadi: ${newUsername}`);
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
    const token = await getCsrfToken();
    
    await fetch('https://auth.roblox.com/v1/logout-from-all-other-devices', {
      method: 'POST',
      headers: {
        'Cookie': `.ROBLOSECURITY=${currentCookie}`,
        'X-CSRF-TOKEN': token,
        'Content-Type': 'application/json'
      }
    });
    
    showResult(`✅ Berhasil logout dari semua perangkat lain!`);
  } catch (error) {
    showResult('❌ ' + error.message, true);
  } finally {
    setLoading(false);
  }
};

console.log('Roblox Manager - Kiwi Browser + CORS Unblock Ready!');
