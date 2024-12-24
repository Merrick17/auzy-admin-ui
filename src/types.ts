interface Tag {
  name: string;
}

export interface User {
  // ... other fields ...
  tags: Tag[];
  isVerified: boolean;
  // ... other fields ...
} 