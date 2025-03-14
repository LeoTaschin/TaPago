import { storage, db } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

async function uploadFileAndStoreMetadata(file, metadata) {
  try {
    // Create a storage reference
    const storageRef = ref(storage, `uploads/${file.name}`);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Add metadata to Firestore
    const docRef = await addDoc(collection(db, 'uploads'), {
      ...metadata,
      downloadURL,
      createdAt: new Date(),
    });

    console.log('File uploaded and metadata stored with ID:', docRef.id);
  } catch (error) {
    console.error('Error uploading file and storing metadata:', error);
  }
}

export { uploadFileAndStoreMetadata }; 