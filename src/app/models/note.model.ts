export interface Note {
  id: string | null  // Firestore generates the ID upon saving; can be null before persistence.
  title: string;
  content: string;
}