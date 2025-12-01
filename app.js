function handleLogin(isRegister) {
  const email = document.getElementById("auth-email").value.trim();
  const name = document.getElementById("auth-name").value.trim();
  const password = document.getElementById("auth-password").value.trim();

  if (!email) {
    alert("Bitte E-Mail eingeben.");
    return;
  }

  let user = loadUserFromStorage();
  if (!user || isRegister) {
    user = {
      uid: "demo-" + Math.random().toString(36).slice(2),
      email,
      name: name || email.split("@")[0],
      role: "user",
      verificationStatus: "pending",
      consentGiven: false,
      language: currentLanguage
    };
  } else {
    user.language = currentLanguage;
  }

  currentUser = user;
  saveUserToStorage(user);
  updateHeaderUserInfo();
  updateAdminLinkVisibility();

  // 🔥 NEU: In Firestore speichern
  saveUserToFirestore(user).catch((err) => {
    console.error("Fehler beim Speichern des Users in Firestore:", err);
  });

  if (!currentUser.consentGiven) {
    showView("view-consent");
  } else if (currentUser.verificationStatus !== "verified") {
    showView("view-verification");
  } else {
    showDashboard();
  }
}
