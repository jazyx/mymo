/**
 * frontend/src/state/dynamic/WordListContext.jsx
 *
 * Provides a cache of WordList records that have already been
 * fetched, and fetches any new WordList records that are required.
 */


import React, { createContext, useState } from 'react'


export const WordListContext = createContext()


export const WordListProvider = ({ children }) => {
  const [ wordLists, setWordLists ] = useState(new Map())


  const getWordList = () => {
    // Checks in wordLists Map cache, and if not already available
    // fetches the WordList
    
  }

  return (
    <WordListContext.Provider
      value ={{
        getWordList
      }}
    >
      {children}
    </WordListContext.Provider>
  )
}


export default {
  label: "WordList",
  Context: WordListContext,
  Provider: WordListProvider
}
