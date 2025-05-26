// auth.js
const auth = firebase.auth();
const db = firebase.firestore();

// Auth UI
function showForm(form) {
    document.getElementById('login-form').classList.toggle('d-none', form !== 'login');
    document.getElementById('register-form').classList.toggle('d-none', form !== 'register');
}

// Registration with email verification
async function register() {
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPass').value;
    const name = document.getElementById('regName').value;
    
    try {
        const userCred = await auth.createUserWithEmailAndPassword(email, password);
        await userCred.user.sendEmailVerification();
        
        await db.collection('users').doc(userCred.user.uid).set({
            name: name,
            points: 0,
            withdrawals: [],
            deposits: [],
            referrals: []
        });
        
        alert('Verifikasi email telah dikirim!');
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

// Login
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPass').value;
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        if(!auth.currentUser.emailVerified) {
            await auth.signOut();
            throw new Error('Verifikasi email terlebih dahulu!');
        }
        window.location.href = 'dashboard.html';
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

// Password reset
async function resetPassword() {
    const email = prompt('Masukkan email untuk reset password:');
    if(email) {
        await auth.sendPasswordResetEmail(email);
        alert('Email reset telah dikirim!');
    }
}
