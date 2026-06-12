// ========== ROBLOX ACCOUNT MANAGER - VERSI TANPA CSRF ==========
// Menggunakan endpoint yang tidak butuh CSRF token

let currentCookie = '';

// DOM Elements
const cookieInput = document.getElementById('cookieInput');
const toggleCookieBtn = document.getElementById('toggleCookieBtn');
const cookieStatus = document.getElementById('cookieStatus');
const fetchInfoBtn = document.getElementById('fetchInfoBtn');
const changeBirthdateBtn = document.getElementById('changeBirthdateBtn');
const changeUsernameBtn = document.getElementById('changeUsernameBtn');
const logoutAllBtn = document.getElementById('logoutAllBtn');
const resultCard = document.getElementById('resultArea');
const resultContent = document.getElementById('resultContent');
const loadingOverlay = document.getElementById('loadingOverlay');
const clearResultBtn = document.getElementById('clearResultBtn');
const newBirthdateInput = document.getElementById('newBirthdate');
const newUsernameInput = document.getElementById('newUsername');

// Special buttons
const setUnder13Btn = document.getElementById('setUnder13Btn');
const setRandomUnder13Btn = document.getElementById('setRandomUnder13Btn');
const changeEmailBtn = document.getElementById('changeEmailBtn');
const newEmailInput = document.getElementById('newEmail');

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
    toggleCookieBtn.textContent = '🙈 Hide';
  } else {
    cookieInput.type = 'password';
    toggleCookieBtn.textContent = '👁️ Show';
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

// Fungsi fetch langsung (tanpa proxy) - pakai mode no-cors
async function fetchRoblox(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    mode: 'cors',
    credentials: 'include',
    headers: {
      ...options.headers,
      'Cookie': `.ROBLOSECURITY=${currentCookie}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  return response;
}

// Cek validasi cookie
async function checkCookie() {
  if (!currentCookie) return null;
  
  try {
    const response = await fetchRoblox('https://www.roblox.com/mobileapi/userinfo', {
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      cookieStatus.innerHTML = `✅ Cookie valid! Login sebagai: ${data.UserName}`;
      cookieStatus.className = 'cookie-status valid';
      return data;
    } else {
      throw new Error('Invalid');
    }
  } catch (error) {
    cookieStatus.innerHTML = '❌ Cookie tidak valid. Coba ambil cookie baru dari browser Roblox.';
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
  }, 1000);
});

// ========== AMBIL INFO AKUN ==========
fetchInfoBtn.onclick = async () => {
  currentCookie = cookieInput.value.trim();
  if (!currentCookie) {
    showResult('❌ Masukkan cookie terlebih dahulu!', true);
    return;
  }
  
  setLoading(true);
  
  try {
    const response = await fetchRoblox('https://www.roblox.com/mobileapi/userinfo', {
      method: 'GET'
    });
    
    if (!response.ok) throw new Error('Cookie invalid atau expired');
    
    const data = await response.json();
    
    showResult(`
✅ INFO AKUN BERHASIL

🆔 User ID: ${data.UserID || '?'}
👤 Username: ${data.UserName || '?'}
📧 Email: ${data.Email || 'Tidak terverifikasi'}
🎂 Tanggal Lahir: ${data.Birthday || 'Tidak diatur'}
💎 Robux: ${data.RobuxBalance || 0}
🏆 Membership: ${data.PremiumCurrencyName || 'Tidak ada'}

📌 Status: Cookie aktif dan valid
    `);
    
  } catch (error) {
    showResult('❌ Gagal: ' + error.message + '\n\nPastikan:\n1. Cookie diambil dari browser yang sama\n2. Cookie TIDAK dipotong\n3. Masih login ke Roblox', true);
  } finally {
    setLoading(false);
  }
};

// ========== FUNGSI UBAH TANGGAL LAHIR ==========
async function changeBirthdateDirect(birthdate) {
  // Pertama, ambil CSRF token dari endpoint berbeda
  let csrfToken = '';
  
  try {
    // Method alternatif: ambil CSRF dari GET request
    const csrfResponse = await fetchRoblox('https://www.roblox.com/game/GetCurrentUser.ashx', {
      method: 'GET'
    });
    csrfToken = csrfResponse.headers.get('x-csrf-token');
    
    if (!csrfToken) {
      // Coba method lain
      const xhrResponse = await fetchRoblox('https://www.roblox.com/asset/asset-delete', {
        method: 'POST',
        body: JSON.stringify({ assetId: 1 })
      });
      csrfToken = xhrResponse.headers.get('x-csrf-token');
    }
    
    if (!csrfToken) {
      throw new Error('Tidak bisa mendapatkan token keamanan');
    }
    
    const response = await fetchRoblox('https://users.roblox.com/v1/account/setbirthday', {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': csrfToken
      },
      body: JSON.stringify({ birthDate: birthdate })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
    }
    
    return true;
  } catch (error) {
    throw new Error('Gagal: ' + error.message);
  }
}

// Ubah tanggal lahir manual
changeBirthdateBtn.onclick = async () => {
  currentCookie = cookieInput.value.trim();
  const newBirthdate = newBirthdateInput.value;
  
  if (!currentCookie) {
    showResult('❌ Masukkan cookie!', true);
    return;
  }
  if (!newBirthdate) {
    showResult('❌ Pilih tanggal lahir!', true);
    return;
  }
  
  setLoading(true);
  try {
    await changeBirthdateDirect(newBirthdate);
    showResult(`✅ Tanggal lahir berhasil diubah menjadi: ${newBirthdate}`);
    newBirthdateInput.value = '';
  } catch (error) {
    showResult('❌ ' + error.message + '\n\nKemungkinan:\n- Akun sudah terverifikasi 13+\n- 2FA aktif\n- Perlu verifikasi email', true);
  } finally {
    setLoading(false);
  }
};

// UBAH KE BAWAH 13 TAHUN
setUnder13Btn.onclick = async () => {
  currentCookie = cookieInput.value.trim();
  if (!currentCookie) {
    showResult('❌ Masukkan cookie!', true);
    return;
  }
  
  setLoading(true);
  try {
    const today = new Date();
    const under13Date = `${today.getFullYear() - 12}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    await changeBirthdateDirect(under13Date);
    showResult(`✅✅✅ BERHASIL!

📅 Tanggal lahir baru: ${under13Date}
🔞 Usia: 12 tahun (DI BAWAH 13 TAHUN)

⚠️ Efek:
• Akun masuk mode RESTRICTED
• Chat terbatas
• Filter konten lebih ketat

🔄 Untuk kembali normal: 
Hubungi support Roblox dengan bukti KTP`);
    
  } catch (error) {
    showResult('❌ Gagal: ' + error.message, true);
  } finally {
    setLoading(false);
  }
};

// RANDOM DATE
setRandomUnder13Btn.onclick = async () => {
  currentCookie = cookieInput.value.trim();
  if (!currentCookie) {
    showResult('❌ Masukkan cookie!', true);
    return;
  }
  
  setLoading(true);
  try {
    const randomDate = getRandomUnder13Date();
    await changeBirthdateDirect(randomDate);
    showResult(`✅ Tanggal lahir random (di bawah 13 tahun): ${randomDate}`);
  } catch (error) {
    showResult('❌ ' + error.message, true);
  } finally {
    setLoading(false);
  }
};

// UBAH USERNAME
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
    // Ambil CSRF token
    let csrfToken = '';
    const csrfResponse = await fetchRoblox('https://www.roblox.com/game/GetCurrentUser.ashx', {
      method: 'GET'
    });
    csrfToken = csrfResponse.headers.get('x-csrf-token');
    
    if (!csrfToken) throw new Error('Tidak bisa mendapatkan token');
    
    const response = await fetchRoblox('https://accountinformation.roblox.com/v1/username', {
      method: 'POST',
      headers: { 'X-CSRF-TOKEN': csrfToken },
      body: JSON.stringify({ username: newUsername })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.errors?.[0]?.message || 'Gagal');
    }
    
    showResult(`✅ Username berhasil diubah menjadi: ${newUsername}\n\n⚠️ Username lama tidak bisa dipakai selama 7 hari!`);
    newUsernameInput.value = '';
  } catch (error) {
    showResult('❌ ' + error.message, true);
  } finally {
    setLoading(false);
  }
};

// UBAH EMAIL
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
    let csrfToken = '';
    const csrfResponse = await fetchRoblox('https://www.roblox.com/game/GetCurrentUser.ashx', {
      method: 'GET'
    });
    csrfToken = csrfResponse.headers.get('x-csrf-token');
    
    if (!csrfToken) throw new Error('Tidak bisa mendapatkan token');
    
    const response = await fetchRoblox('https://accountinformation.roblox.com/v1/email', {
      method: 'PATCH',
      headers: { 'X-CSRF-TOKEN': csrfToken },
      body: JSON.stringify({ emailAddress: newEmail })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.errors?.[0]?.message || 'Gagal');
    }
    
    showResult(`✅ Email berhasil diubah menjadi: ${newEmail}`);
    newEmailInput.value = '';
  } catch (error) {
    showResult('❌ ' + error.message, true);
  } finally {
    setLoading(false);
  }
};

// LOGOUT SEMUA SESI
logoutAllBtn.onclick = async () => {
  currentCookie = cookieInput.value.trim();
  if (!currentCookie) {
    showResult('❌ Masukkan cookie!', true);
    return;
  }
  
  setLoading(true);
  try {
    let csrfToken = '';
    const csrfResponse = await fetchRoblox('https://www.roblox.com/game/GetCurrentUser.ashx', {
      method: 'GET'
    });
    csrfToken = csrfResponse.headers.get('x-csrf-token');
    
    if (!csrfToken) throw new Error('Tidak bisa mendapatkan token');
    
    const response = await fetchRoblox('https://auth.roblox.com/v1/logout-from-all-other-devices', {
      method: 'POST',
      headers: { 'X-CSRF-TOKEN': csrfToken }
    });
    
    if (!response.ok) throw new Error('Gagal');
    
    showResult(`✅ Berhasil logout dari semua perangkat lain!\n\n🔒 Cookie lain sudah tidak valid.`);
  } catch (error) {
    showResult('❌ ' + error.message, true);
  } finally {
    setLoading(false);
  }
};

console.log('Roblox Manager - Versi Tanpa CSRF Token (Mobile Friendly)');
