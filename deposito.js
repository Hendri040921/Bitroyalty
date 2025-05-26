const auth = firebase.auth();
const db = firebase.firestore();

async function createDeposit(minimal, bunga, tenor) {
    const user = auth.currentUser;
    const inputField = document.getElementById(`deposit${bunga}`);
    const amount = inputField ? parseInt(inputField.value) : 0;

    if(amount < minimal) {
        alert(`Minimal setoran ${minimal} poin`);
        return;
    }

    await db.runTransaction(async transaction => {
        const userRef = db.collection('users').doc(user.uid);
        const userDoc = await transaction.get(userRef);
        
        if(userDoc.data().points < amount) {
            throw new Error('Poin tidak cukup');
        }

        transaction.update(userRef, {
            points: firebase.firestore.FieldValue.increment(-amount)
        });

        const depositRef = db.collection('deposits').doc();
        transaction.set(depositRef, {
            userId: user.uid,
            amount: amount,
            interest: bunga,
            startDate: new Date(),
            maturityDate: new Date(Date.now() + tenor * 86400000),
            status: 'active'
        });
    });

    alert('Deposito berhasil dibuat!');
}
