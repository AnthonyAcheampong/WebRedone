window.PromptPlayFirebase = (function () {
    let auth = null;
    let app = null;

    function sendMessageSafe(objectName, methodName, message) {
        if (window.unityInstance) {
            window.unityInstance.SendMessage(objectName, methodName, message);
        } else {
            console.error("window.unityInstance is not available.");
        }
    }

    function initFirebase() {
        try {
            if (!firebase.apps.length) {
                const firebaseConfig = {
                    apiKey: "YOUR_KEY",
                    authDomain: "promptplayapp.firebaseapp.com",
                    projectId: "promptplayapp",
                    databaseURL: "https://promptplayapp-default-rtdb.firebaseio.com/",
                    appId: "YOUR_APP_ID"
                };

                app = firebase.initializeApp(firebaseConfig);
                console.log("Firebase initialized.");
            } else {
                app = firebase.app();
                console.log("Firebase already initialized.");
            }

            auth = firebase.auth();
        } catch (error) {
            console.error("Firebase init error:", error);
        }
    }

    function ensureAuthReady() {
        if (!auth) {
            console.error("Firebase auth is not initialized.");
            return false;
        }
        return true;
    }

    function signIn(email, password) {
        if (!ensureAuthReady()) {
            sendMessageSafe("WebSignInManager", "OnFirebaseSignInFailed", "Firebase is not initialized.");
            return;
        }

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const uid = userCredential.user.uid;

                sendMessageSafe(
                    "WebSignInManager",
                    "OnFirebaseSignInSuccess",
                    uid
                );
            })
            .catch((error) => {
                console.error("Sign-in error:", error);
                sendMessageSafe(
                    "WebSignInManager",
                    "OnFirebaseSignInFailed",
                    error.message
                );
            });
    }

    function signUp(email, password, username) {
        if (!ensureAuthReady()) {
            sendMessageSafe("WebSignUpManager", "OnFirebaseSignUpFailed", "Firebase is not initialized.");
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                return user.updateProfile({
                    displayName: username
                }).then(() => {
                    sendMessageSafe(
                        "WebSignUpManager",
                        "OnFirebaseSignUpSuccess",
                        user.uid + "|" + username
                    );
                });
            })
            .catch((error) => {
                console.error("Sign-up error:", error);
                sendMessageSafe(
                    "WebSignUpManager",
                    "OnFirebaseSignUpFailed",
                    error.message
                );
            });
    }

    function resetPassword(email) {
        if (!ensureAuthReady()) {
            sendMessageSafe("WebSignInManager", "OnFirebasePasswordResetFailed", "Firebase is not initialized.");
            return;
        }

        auth.sendPasswordResetEmail(email)
            .then(() => {
                sendMessageSafe(
                    "WebSignInManager",
                    "OnFirebasePasswordResetSent",
                    "sent"
                );
            })
            .catch((error) => {
                console.error("Password reset error:", error);
                sendMessageSafe(
                    "WebSignInManager",
                    "OnFirebasePasswordResetFailed",
                    error.message
                );
            });
    }

    return {
        initFirebase,
        signIn,
        signUp,
        resetPassword
    };
})();
