import { create } from "zustand";

interface searchType {
  searchText: string;
  setSearchText: (text:string) => void;
}

export const useSearchStore = create<searchType>(set=>({
    searchText:"",

    setSearchText: (text:string) =>{
        set({searchText:text})
    }
}))