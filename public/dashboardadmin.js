// dashboardadmin.js
const auth = firebase.auth();
const db = firebase.firestore();

// Check Admin Status
auth.onAuthStateChanged(user => {
    if(!user || user.uid !== 'ADMIN_UID_YANG_DITENTUKAN') {
        window.location.href = 'admin.html';
    } else {
        loadAllData();
    }
});

// Load Data Awal
function loadAllData() {
    loadWithdrawals();
    loadPromoCodes();
    loadMembers();
}

// Fungsi Logout
function adminLogout() {
    auth.signOut();
    window.location.href = 'admin.html';
}

// Penarikan Dana
function loadWithdrawals() {
    db.collection('withdrawals')
        .where('status', '==', 'pending')
        .onSnapshot(snapshot => {
            const list = document.getElementById('withdrawList');
            list.innerHTML = '';
            
            snapshot.forEach(doc => {
                const data = doc.data();
                list.innerHTML += `
                    <tr>
                        <td>${new Date(data.timestamp?.toDate()).toLocaleDateString()}</td>
                        <td>${data.userId}</td>
                        <td>Rp${data.amount}</td>
                        <td>
                            <button class="btn btn-success btn-sm" onclick="approveWithdrawal('${doc.id}')">Setujui</button>
                            <button class="btn btn-danger btn-sm" onclick="rejectWithdrawal('${doc.id}')">Tolak</button>
                        </td>
                    </tr>
                `;
            });
        });
}

async function approveWithdrawal(docId) {
    await db.collection('withdrawals').doc(docId).update({
        status: 'approved',
        approvedAt: new Date()
    });
}

async function rejectWithdrawal(docId) {
    await db.collection('withdrawals').doc(docId).update({
        status: 'rejected'
    });
}

// Manajemen Kode Promo
function loadPromoCodes() {
    db.collection('promoCodes').onSnapshot(snapshot => {
        const list = document.getElementById('promoList');
        list.innerHTML = '';
        
        snapshot.forEach(doc => {
            const data = doc.data();
            list.innerHTML += `
                <tr>
                    <td>${doc.id}</td>
                    <td>${data.value} Poin</td>
                    <td>${data.used ? 'Used' : 'Active'}</td>
                </tr>
            `;
        });
    });
}

async function addPromoCode() {
    const code = document.getElementById('newPromoCode').value;
    const value = parseInt(document.getElementById('promoValue').value);
    
    if(!code || !value) {
        alert('Harap isi semua field!');
        return;
    }
    
    await db.collection('promoCodes').doc(code).set({
        value: value,
        used: false,
        created: new Date()
    });
    
    alert('Kode promo berhasil ditambahkan!');
}

// Manajemen Member
function loadMembers() {
    db.collection('users').onSnapshot(snapshot => {
        const list = document.getElementById('memberList');
        list.innerHTML = '';
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const balance = (data.points / 18000 * 10).toFixed(2);
            
            list.innerHTML += `
                <tr>
                    <td>${data.name}</td>
                    <td>${data.points}</td>
                    <td>Rp${balance}</td>
                    <td>
                        <button class="btn btn-info btn-sm" onclick="viewUserDetail('${doc.id}')">Detail</button>
                    </td>
                </tr>
            `;
        });
    });
}

async function viewUserDetail(userId) {
    const doc = await db.collection('users').doc(userId).get();
    const data = doc.data();
    
    document.getElementById('userDetailContent').innerHTML = `
        <p>Nama: ${data.name}</p>
        <p>Email: ${data.email || '-'}</p>
        <p>Total Poin: ${data.points}</p>
        <p>Total Penarikan: Rp${data.totalWithdrawn || 0}</p>
    `;
    
    new bootstrap.Modal(document.getElementById('detailModal')).show();
}
