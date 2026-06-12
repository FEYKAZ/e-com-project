// ========== ROBLOX ACCOUNT MANAGER ==========
// Hanya untuk akun sendiri - Dengan validasi cookie

let currentCookie = '';
let csrfToken = '';

// DOM Elements
const cookieInput = document.getElementById('cookieInput');
const toggleCookieBtn = document.getElementById('toggleCookieBtn');
const cookieStatus = document.getElementById('cookieStatus');
const fetchInfoBtn = document.getElementById('fetchInfoBtn');
const changeEmailBtn = document.getElementById('changeEmailBtn');
const changeBirthdateBtn = document.getElementById('changeBirthdateBtn');
const changeUsernameBtn = document.getElementById('changeUsernameBtn');
const logoutAllBtn = document.getElementById('logoutAllBtn');
const resultCard = document.getElementById('resultArea');
const resultContent = document.getElementById('resultContent');
const loadingOverlay = document.getElementById('loadingOverlay');
const clearResultBtn = document.getElementById('clearResultBtn');
const newEmailInput = document.getElementById('newEmail');
const newBirthdateInput = document.getElementById('newBirthdate');
const newUsernameInput = document.getElementById('newUsername');

// Special buttons
const setUnder13Btn = document.getElementById('setUnder13Btn');
const setRandomUnder13Btn = document.getElementById('setRandomUnder13Btn');

// Helper: Tampilkan hasil
function showResult(message, isError = false) {
  resultContent.innerHTML = message;
  resultContent.className = isError ? 'result-content error' : 'result-content success';
  resultCard.classList.add('show');
  setTimeout(() => {
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

// Helper: Clear result
clearResultBtn.onclick = () => {
  resultCard.classList.remove('show');
  resultContent.innerHTML = '';
};

// Helper: Toggle cookie visibility
toggleCookieBtn.onclick = () => {
  if (cookieInput.type === 'password') {
    cookieInput.type = 'text';
    toggleCookieBtn.textContent = '🙈 Hide';
  } else {
    cookieInput.type = 'password';
    toggleCookieBtn.textContent = '👁️ Show';
  }
};

// Helper: Update cookie status
async function updateCookieStatus() {
  const cookie = cookieInput.value.trim();
  if (!cookie) {
    cookieStatus.className = 'cookie-status';
    cookieStatus.innerHTML = '';
    return;
  }
  
  cookieStatus.innerHTML = '<span>🔍 Memeriksa cookie...</span>';
  cookieStatus.className = 'cookie-status';
  
  try {
    const response = await fetch('https://www.roblox.com/mobileapi/userinfo', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Cookie': `.ROBLOSECURITY=${cookie}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://www.roblox.com',
        'Referer': 'https://www.roblox.com/'
      },
      mode: 'cors'
    });
    
    if (response.ok) {
      const data = await response.json();
      cookieStatus.innerHTML = `✅ Cookie valid! Login sebagai: ${data.UserName || 'Tidak diketahui'}`;
      cookieStatus.className = 'cookie-status valid';
    } else {
      throw new Error('Invalid');
    }
  } catch (error) {
    cookieStatus.innerHTML = '❌ Cookie tidak valid atau expired. Silakan ambil cookie baru dari browser.';
    cookieStatus.className = 'cookie-status invalid';
  }
}

// Auto check cookie when typing
let debounceTimeout;
cookieInput.addEventListener('input', () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(updateCookieStatus, 1000);
});

// Helper: Show/hide loading
function setLoading(show) {
  loadingOverlay.style.display = show ? 'flex' : 'none';
}

// Helper: Generate random date under 13 years old
function getRandomUnder13Date() {
  const today = new Date();
  const ageYears = Math.floor(Math.random() * 8) + 5; // 5-12 tahun
  const birthYear = today.getFullYear() - ageYears;
  const birthMonth = Math.floor(Math.random() * 12);
  const birthDay = Math.floor(Math.random() * 28) + 1;
  return `${birthYear}-${String(birthMonth + 1).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
}

// Helper: Get CSRF Token
async function getCsrfToken() {
  try {
    const response = await fetch('https://auth.roblox.com/v2/logout', {
      method: 'POST',
      headers: {
        'Cookie': `.ROBLOSECURITY=${currentCookie}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://www.roblox.com',
        'Referer': 'https://www.roblox.com/'
      }
    });
    
    csrfToken = response.headers.get('x-csrf-token');
    if (!csrfToken) {
      throw new Error('Failed to get CSRF token');
    }
    return csrfToken;
  } catch (error) {
    throw new Error('CSRF token error: ' + error.message);
  }
}

// ========== FUNGSI UTAMA UBAH TANGGAL LAHIR ==========
async function changeBirthdate(birthdate) {
  if (!currentCookie) throw new Error('Cookie required');
  
  await getCsrfToken();
  
  const response = await fetch('https://users.roblox.com/v1/account/setbirthday', {
    method: 'POST',
    headers: {
      'Cookie': `.ROBLOSECURITY=${currentCookie}`,
      'X-CSRF-TOKEN': csrfToken,
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Origin': 'https://www.roblox.com',
      'Referer': 'https://www.roblox.com/'
    },
    body: JSON.stringify({ birthDate: birthdate })
  });
  
  if (response.status === 429) {
    throw new Error('Too many requests. Try again later.');
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.errors?.[0]?.message || 'Failed to change birthdate');
  }
  
  return true;
}

// ========== 1. AMBIL INFO AKUN ==========
fetchInfoBtn.onclick = async () => {
  currentCookie = cookieInput.value.trim();
  if (!currentCookie) {
    showResult('❌ Masukkan .ROBLOSECURITY cookie terlebih dahulu!', true);
    return;
  }
  
  setLoading(true);
  
  try {
    const response = await fetch('https://www.roblox.com/mobileapi/userinfo', {
      method: 'GET',
      headers: {
        'Cookie': `.ROBLOSECURITY=${currentCookie}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://www.roblox.com',
        'Referer': 'https://www.roblox.com/'
      }
    });
    
    if (!response.ok) {
      throw new Error('Cookie invalid or expired');
    }
    
    const data = await response.json();
    
    let infoHtml = `
✅ INFO AKUN BERHASIL DIAMBIL

🆔 User ID: ${data.UserID || 'Tidak diketahui'}
👤 Username: ${data.UserName || 'Tidak diketahui'}
📧 Email: ${data.Email || 'Tidak ada'}
🎂 Tanggal Lahir: ${data.Birthday || 'Tidak diatur'}
💎 Robux: ${data.RobuxBalance || 0}
🏆 Membership: ${data.PremiumCurrencyName || 'Tidak ada'}
    `;
    
    showResult(infoHtml);
    
  } catch (error) {
    showResult('❌ ' + error.message + '\n\nPastikan cookie valid dan kamu login ke Roblox di browser.', true);
  } finally {
    setLoading(false);
  }
};

// ========== 2. UBAH EMAIL ==========
changeEmailBtn.onclick = async () => {
  currentCookie = cookieInput.value.trim();
  const newEmail = newEmailInput.value.trim();
  
  if (!currentCookie) {
    showResult('❌ Masukkan .ROBLOSECURITY cookie terlebih dahulu!', true);
    return;
  }
  
  if (!newEmail || !newEmail.includes('@')) {
    showResult('❌ Masukkan email yang valid!', true);
    return;
  }
  
  setLoading(true);
  
  try {
    await getCsrfToken();
    
    const response = await fetch('https://accountinformation.roblox.com/v1/email', {
      method: 'PATCH',
      headers: {
        'Cookie': `.ROBLOSECURITY=${currentCookie}`,
        'X-CSRF-TOKEN': csrfToken,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://www.roblox.com',
        'Referer': 'https://www.roblox.com/'
      },
      body: JSON.stringify({ emailAddress: newEmail })
    });
    
    if (response.status === 403) {
      throw new Error('Akses ditolak. Mungkin 2FA aktif.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.errors?.[0]?.message || 'Gagal mengubah email');
    }
    
    showResult(`✅ Email berhasil diubah menjadi: ${newEmail}`);
    newEmailInput.value = '';
    
  } catch (error) {
    showResult('❌ ' + error.message, true);
  } finally {
    setLoading(false);
  }
};

// ========== 3. UBAH TANGGAL LAHIR (MANUAL) ==========
changeBirthdateBtn.onclick = async () => {
  currentCookie = cookieInput.value.trim();
  const newBirthdate = newBirthdateInput.value.trim();
  
  if (!currentCookie) {
    showResult('❌ Masukkan .ROBLOSECURITY cookie terlebih dahulu!', true);
    return;
  }
  
  if (!newBirthdate) {
    showResult('❌ Pilih tanggal lahir baru!', true);
    return;
  }
  
  setLoading(true);
  
  try {
    await changeBirthdate(newBirthdate);
    showResult(`✅ Tanggal lahir berhasil diubah menjadi: ${newBirthdate}`);
    newBirthdateInput.value = '';
  } catch (error) {
    showResult('❌ ' + error.message, true);
  } finally {
    setLoading(false);
  }
};

// ========== 4. UBAH KE BAWAH 13 TAHUN ==========
setUnder13Btn.onclick = async () => {
  currentCookie = cookieInput.value.trim();
  
  if (!currentCookie) {
    showResult('❌ Masukkan .ROBLOSECURITY cookie terlebih dahulu!', true);
    return;
  }
  
  setLoading(true);
  
  try {
    const today = new Date();
    const birthYear = today.getFullYear() - 12;
    const birthMonth = today.getMonth();
    const birthDay = today.getDate();
    const under13Date = `${birthYear}-${String(birthMonth + 1).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
    
    await changeBirthdate(under13Date);
    
    showResult(`✅✅✅ TANGGAL LAHIR BERHASIL DIUBAH KE BAWAH 13 TAHUN!

📅 Tanggal baru: ${under13Date}
🔞 Usia sekarang: 12 tahun

⚠️ Akun sekarang dalam mode RESTRICTED/TERBATAS!`);
    
  } catch (error) {
    showResult('❌ Gagal: ' + error.message, true);
  } finally {
    setLoading(false);
  }
};

// ========== 5. RANDOM TANGGAL ==========
setRandomUnder13Btn.onclick = async () => {
  currentCookie = cookieInput.value.trim();
  
  if (!currentCookie) {
    showResult('❌ Masukkan .ROBLOSECURITY cookie terlebih dahulu!', true);
    return;
  }
  
  setLoading(true);
  
  try {
    const randomDate = getRandomUnder13Date();
    await changeBirthdate(randomDate);
    showResult(`✅ Tanggal lahir random berhasil: ${randomDate}`);
  } catch (error) {
    showResult('❌ Gagal: ' + error.message, true);
  } finally {
    setLoading(false);
  }
};

// ========== 6. UBAH USERNAME ==========
changeUsernameBtn.onclick = async () => {
  currentCookie = cookieInput.value.trim();
  const newUsername = newUsernameInput.value.trim();
  
  if (!currentCookie) {
    showResult('❌ Masukkan cookie', true);
    return;
  }
  
  if (!newUsername || newUsername.length < 3 || newUsername.length > 20) {
    showResult('❌ Username harus 3-20 karakter!', true);
    return;
  }
  
  setLoading(true);
  
  try {
    await getCsrfToken();
    
    const response = await fetch('https://accountinformation.roblox.com/v1/username', {
      method: 'POST',
      headers: {
        'Cookie': `.ROBLOSECURITY=${currentCookie}`,
        'X-CSRF-TOKEN': csrfToken,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://www.roblox.com',
        'Referer': 'https://www.roblox.com/'
      },
      body: JSON.stringify({ username: newUsername })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.errors?.[0]?.message || 'Gagal mengubah username');
    }
    
    showResult(`✅ Username berhasil diubah menjadi: ${newUsername}`);
    newUsernameInput.value = '';
    
  } catch (error) {
    showResult('❌ ' + error.message, true);
  } finally {
    setLoading(false);
  }
};

// ========== 7. LOGOUT SEMUA SESI ==========
logoutAllBtn.onclick = async () => {
  currentCookie = cookieInput.value.trim();
  
  if (!currentCookie) {
    showResult('❌ Masukkan cookie', true);
    return;
  }
  
  setLoading(true);
  
  try {
    await getCsrfToken();
    
    const response = await fetch('https://auth.roblox.com/v1/logout-from-all-other-devices', {
      method: 'POST',
      headers: {
        'Cookie': `.ROBLOSECURITY=${currentCookie}`,
        'X-CSRF-TOKEN': csrfToken,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://www.roblox.com',
        'Referer': 'https://www.roblox.com/'
      }
    });
    
    if (!response.ok) throw new Error('Gagal logout');
    
    showResult(`✅ Berhasil logout dari semua perangkat lain!`);
    
  } catch (error) {
    showResult('❌ ' + error.message, true);
  } finally {
    setLoading(false);
  }
};

console.log('Roblox Account Manager siap!');
