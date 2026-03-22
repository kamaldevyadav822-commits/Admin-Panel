import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";

import {
  getFirestore, collection, getDocs,
  doc, updateDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

// 🔥 SAME FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCeM_ki1k6hRW4Y3ooog5yUt9wQp4EGvEs",
  authDomain: "chatgram-aab01.firebaseapp.com",
  projectId: "chatgram-aab01",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 🔒 ADMIN EMAIL
const ADMIN_EMAIL = "addmin@gmail.com";

// AUTO LOGIN
onAuthStateChanged(auth, (user) => {
  if (user && user.email === ADMIN_EMAIL) {
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");

    loadUsers();
  }
});

// LOGIN
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await signInWithEmailAndPassword(auth, email, password);

    if (res.user.email !== ADMIN_EMAIL) {
      alert("Not authorized");
      await signOut(auth);
    }

  } catch (err) {
    alert(err.message);
  }
};

// LOGOUT
window.logout = async function () {
  await signOut(auth);
  location.reload();
};

// LOAD USERS
async function loadUsers() {
  const snap = await getDocs(collection(db, "users"));
  const container = document.getElementById("users");

  container.innerHTML = "";

  snap.forEach(docSnap => {
    const user = docSnap.data();

    const isActive = Date.now() - (user.lastActive || 0) < 60000;

    const div = document.createElement("div");
    div.className = "p-3 bg-white/10 rounded";

    div.innerHTML = `
      <div class="flex justify-between items-center">

        <div>
          <div class="font-semibold">${user.nickname}</div>
          <div class="text-xs text-gray-400">${user.email}</div>
          <div class="text-xs ${isActive ? "text-green-400" : "text-gray-400"}">
            ${isActive ? "Active" : "Offline"}
          </div>
          <div class="text-xs text-yellow-400">
            ${user.status || "active"}
          </div>
        </div>

        <div class="flex gap-2">

          <button onclick="toggleSuspend('${user.email}', '${user.status}')"
            class="text-xs bg-yellow-500 px-2 py-1 rounded">
            ${user.status === "suspended" ? "Activate" : "Suspend"}
          </button>

          <button onclick="deleteUser('${user.email}')"
            class="text-xs bg-red-500 px-2 py-1 rounded">
            Delete
          </button>

        </div>

      </div>
    `;

    container.appendChild(div);
  });
}

// SUSPEND / ACTIVATE
window.toggleSuspend = async function (email, status) {
  await updateDoc(doc(db, "users", email), {
    status: status === "suspended" ? "active" : "suspended"
  });

  loadUsers();
};

// DELETE (SOFT DELETE)
window.deleteUser = async function (email) {
  await updateDoc(doc(db, "users", email), {
    status: "deleted"
  });

  loadUsers();
};
