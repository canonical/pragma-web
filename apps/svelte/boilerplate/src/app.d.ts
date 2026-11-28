declare global {
  namespace App {
    interface Locals {
      theme: "light" | "dark" | "";
      locale: string;
    }
  }
}

export {};
