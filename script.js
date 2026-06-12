// ========== ROBLOX MANAGER - HAPUS EMAIL VIA UBAH USIA ==========
// Cookie format CAE... atau _|WARNING...

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
const newBirthdateInput = document.getElementById('newBirthdate');

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
    toggleCookieBtn.textContent = '🙈';
  } else {
    cookieInput.type = 'password';
    toggleCookieBtn.textContent = '👁️';
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

// Fungsi fetch dengan cookie
async function fetchRoblox(url, options = {}) {
  const response = await fetch(url, {
    ...options,
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

// Ambil CSRF Token
async function getCsrfToken() {
  try {
    const response = await fetchRoblox('https://auth.roblox.com/v2/logout', {
      method: 'POST'
    });
    const token = response.headers.get('x-csrf-token');
    if (!token) throw new Error('No CSRF');
    return token;
  } catch (error) {
    const response = await fetchRoblox('https://www.roblox.com/game/GetCurrentUser.ashx', {
      method: 'GET'
    });
    const token = response.headers.get('x-csrf-token');
    if (!token) throw new Error('Failed to get CSRF');
    return token;
  }
}

// Cek Cookie
async function checkCookie() {
  if (!currentCookie) return null;
  
  try {
    const response = await fetchRoblox('https://www.roblox.com/mobileapi/userinfo');
    if (response.ok) {
      const data = await response.json();
      cookieStatus.innerHTML = `✅ Cookie valid! Login sebagai: ${data.UserName}`;
      cookieStatus.className = 'cookie-status valid';
      return data;
    }
    throw new Error('Invalid');
  } catch (error) {
    cookieStatus.innerHTML = '❌ Cookie tidak valid. Pastikan cookie FULL dan belum expired.';
    cookieStatus.className = 'cookie-status invalid';
    return null;
  }
}

let debounceTimeout;
cookieInput.addEventListener('input', () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    currentCookie = cookieInput.value.trim();
    if (currentCookie) checkCookie();
  }, 1000);
});

// ========== UBAH TANGGAL LAHIR ==========
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

// ========== CEK INFO AKUN ==========
fetchInfoBtn.onclick = async () => {
  currentCookie = cookieInput.value.trim();
  if (!currentCookie) {
    showResult('❌ Masukkan cookie!', true);
    return;
  }
  
  setLoading(true);
  try {
    const response = await fetchRoblox('https://www.roblox.com/mobileapi/userinfo');
    if (!response.ok) throw new Error('Cookie invalid');
    
    const data = await response.json();
    
    showResult(`
✅ INFO AKUN

🆔 User ID: ${data.UserID}
👤 Username: ${data.UserName}
📧 Email: ${data.Email || 'TIDAK ADA (sudah terhapus)'}
🎂 Tanggal Lahir: ${data.Birthday || 'Tidak diatur'}
💎 Robux: ${data.RobuxBalance}
🏆 Membership: ${data.PremiumCurrencyName || 'Tidak ada'}

📌 Status: ${data.Email ? 'Email masih terpasang' : 'EMAIL SUDAH TERHAPUS!'}
    `);
  } catch (error) {
    showResult('❌ ' + error.message, true);
  } finally {
    setLoading(false);
  }
};

// ========== FITUR UTAMA: HAPUS EMAIL ==========
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
✅✅✅ BERHASIL HAPUS EMAIL! ✅✅✅

📅 Tanggal lahir diubah: ${under13Date}
🔞 Usia: 12 tahun (DI BAWAH 13 TAHUN)

📧 Status Email: ${emailDeleted ? 'TERHAPUS ✅' : 'Masih ada, coba lagi'}

⚠️ Efek ubah usia:
• Akun masuk mode RESTRICTED
• Chat terbatas
• Filter konten lebih ketat
• Email sudah tidak terhubung ke akun

🔄 Untuk mengembalikan email: 
Ubah usia ke 13+ (butuh verifikasi)
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

📧 Cek info akun untuk melihat apakah email sudah terhapus.`);
    
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
    showResult('❌ Username 3-20 karakter!', true);
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
    
    showResult(`✅ Username berubah menjadi: ${newUsername}`);
    newUsernameInput.value = '';
  } catch (error) {
    showResult('❌ ' + error.message, true);
  } finally {
    setLoading(false);
  }
};

// ========== LOGOUT ==========
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
    
    showResult(`✅ Logout dari semua perangkat lain!`);
  } catch (error) {
    showResult('❌ ' + error.message, true);
  } finally {
    setLoading(false);
  }
};

console.log('Roblox Manager - Hapus Email via Ubah Usia');
