(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyCJqqdv12hJJY-th9auIrwMTMlRoYZpFzk",
    authDomain: "gestao-projetos-cmpc.firebaseapp.com",
    projectId: "gestao-projetos-cmpc",
    storageBucket: "gestao-projetos-cmpc.firebasestorage.app",
    messagingSenderId: "821031676587",
    appId: "1:821031676587:web:c0e75e259334166d1065ee"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const DOC_REF = db.collection('gp').doc('main');

  window.FirebaseService = {
    async load() {
      const snap = await DOC_REF.get();
      return snap.exists ? snap.data() : null;
    },

    async save(data) {
      await DOC_REF.set(data);
    },

    onSnapshot(callback) {
      return DOC_REF.onSnapshot(snap => {
        if (snap.exists) callback(snap.data());
      });
    }
  };
})();
