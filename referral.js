const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged(user => {
    if(user) {
        document.getElementById('referralLink').value = 
            `https://your-domain.com/index.html?ref=${user.uid}`;
    }
});

function copyLink() {
    const link = document.getElementById('referralLink');
    link.select();
    document.execCommand('copy');
    alert('Link berhasil disalin!');
}

// Fungsi untuk handle referral
function checkReferral() {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    
    if(referralCode && !localStorage.getItem('referralUsed')) {
        db.collection('users').doc(referralCode).update({
            points: firebase.firestore.FieldValue.increment(100)
        });
        localStorage.setItem('referralUsed', 'true');
    }
}
// Panggil saat halaman index.html load
// Tambahkan di auth.js: checkReferral();
