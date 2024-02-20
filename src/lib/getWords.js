import { data } from "autoprefixer";
import { db, customInitApp } from "./firebase";
customInitApp();
export default async function getWords() {
  const querySnapshot = await db
    .collection("words")
    .where("used", "==", true)
    .limit(7)
    .get();

  if (querySnapshot.empty) {
    return [];
  }

  const words = querySnapshot.docs.map((doc) => {
    const {
      translation,
      word,
      why_this_word,
      example_sentences,
      word_origin,
      definitions,
      phonetic_pronunciation,
      used,
    } = doc.data();

    const id = doc.id;
    return {
      translation,
      word,
      why_this_word,
      example_sentences,
      word_origin,
      definitions,
      phonetic_pronunciation,
      used,
      id,
    };
  });

  return words;
}
