import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  onSnapshot,
  setDoc,
} from "@firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { getMessaging, onMessage } from "firebase/messaging";

export const getEvents = () => {
  const db = getFirestore();
  return getDocs(collection(db, "events")).then((querySnapshot) => {
    let events = [];
    querySnapshot.forEach((doc) => {
      const { category, start, end, desc, img, gform, type, rules, completed, yt } = doc.data();
      events.push({
        name: doc.id,
        category,
        start,
        end,
        desc,
        img,
        gform,
        type,
        rules,
        completed,
        yt,
      });
    });
    return [...events].sort((a, b) => a?.start?.seconds - b?.start?.seconds);
  });
};

export const getProfileDetails = async () => {
  let regEvents = [];
  const auth = getAuth();
  const user = auth.currentUser;
  const { displayName: userName, email } = user;
  const db = getFirestore();
  try {
    const userDoc = await getDoc(doc(db, "users", email));
    const { registered = [], group, house } = userDoc.data();
    for (let i of registered) {
      const eventDoc = await getDoc(doc(db, "events", i));
      if (eventDoc.data()) {
        const { category, start, end, desc, img } = eventDoc.data();
        regEvents.push({
          name: i,
          category,
          start,
          end,
          desc,
          img,
        });
      }
    }
    return {
      userName,
      email,
      group,
      house,
      eventPasses: regEvents,
    };
  } catch (err) {
    signOut(auth);
    alert("Sign in using your student login email");
    return {};
  }
};

export const signInFirebase = () => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider)
    .then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      return {
        status: "success",
        token,
        user,
      };
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
      return {
        status: "error",
        errorCode,
        errorMessage,
        email,
        credential,
      };
    });
};

export const listenEventChange = (callback) => {
  const db = getFirestore();
  const unsub = onSnapshot(doc(db, "events", "current"), (doc) => {
    callback(doc.data());
  });
};

export const updateFCMTokenToDB = ({ fcm }) => {
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  const { email } = user;
  return setDoc(doc(db, "subscription", email), { fcm }).catch((err) => {
    alert(err);
  });
};

export const onMessageListener = () => {
  const messaging = getMessaging();
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

export const getTeamDetails = () => {
  const db = getFirestore();
  return getDocs(collection(db, "team")).then((querySnapshot) => {
    let members = [];
    querySnapshot.forEach((doc) => {
      const { contact, desc, img, name, role } = doc.data();
      members.push({
        name,
        desc,
        img,
        contact,
        role
      });
    });
    return members;
  });
};

export const registerProfile = async (email, name, phn, clg, dept, year) => {  
  console.log(email, name)
  const db = getFirestore()
  let reqDoc = doc(db, "users", "email")
  let a = await setDoc(reqDoc, {'test': 'test'})
  console.log(reqDoc)
  let data = {
    email: email,
    name: name, 
    phn: phn, 
    clg: clg, 
    dept: dept, 
    year: year
  }
  console.log(data)
  return setDoc(doc(db, "users", email), { data }).catch((err) => {
    alert(err);
  });
}