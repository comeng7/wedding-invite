import { initializeApp } from 'firebase/app';
import { getFirestore, serverTimestamp } from 'firebase/firestore'; // serverTimestamp 추가

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db, serverTimestamp };

// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /guestbook_messages/{messageId} {
//       allow read: if true; // 누구나 읽을 수 있음
//       allow create: if request.resource.data.name != null &&
//                        request.resource.data.name.size() > 0 &&
//                        request.resource.data.name.size() < 50 && // 이름 길이 제한
//                        request.resource.data.message != null &&
//                        request.resource.data.message.size() > 0 &&
//                        request.resource.data.message.size() < 201 && // 메시지 길이 제한
//                        request.resource.data.createdAt == request.time; // 서버 타임스탬프 사용 강제
//       allow update, delete: if false; // 수정 및 삭제는 허용 안 함
//     }
//   }
// }
