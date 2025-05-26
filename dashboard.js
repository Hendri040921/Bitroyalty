const auth = firebase.auth();
const db = firebase.firestore();

// Real-time updates
auth.onAuthStateChanged(user => {
    if(user) {
        db.collection('users').doc(user.uid).onSnapshot(doc => {
            const data = doc.data();
            
            // Update UI
            document.getElementById('totalPoin').textContent = data.points;
            
            // Konversi poin ke Rupiah
            const saldo = (data.points / 18000 * 10).toFixed(2);
            document.getElementById('saldoRupiah').textContent = saldo;
            
            // Tampilkan form jika saldo >= 20.000
            document.getElementById('formPenarikan').classList.toggle('d-none', saldo < 20000);
        });
    } else {
        window.location.href = 'index.html';
    }
});

async function requestWithdrawal() {
    const amount = document.getElementById('jumlahPenarikan').value;
    const user = auth.currentUser;
    
    if(amount < 20000) {
        alert('Minimal penarikan Rp20.000');
        return;
    }

    await db.collection('withdrawals').add({
        userId: user.uid,
        amount: amount,
        status: 'pending',
        timestamp: new Date()
    });
    
    alert('Permintaan penarikan telah dikirim ke admin');
}

function logout() {
    auth.signOut();
    window.location.href = 'index.html';
}
