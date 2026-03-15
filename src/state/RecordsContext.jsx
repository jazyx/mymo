/**
 * frontend/src/logic/RecordsContext.jsx
 *
 * description
 */


import {
  createContext,
  useState,
  useEffect
} from 'react'
import { getContextValues } from './'


export const RecordsContext = createContext()


export const RecordsProvider = ({ children }) => {
  const { origin } = getContextValues("APIContext")
  const [ records, setRecords ] = useState([])


  const treatRecords = records => {
    setRecords(records)
  }


  const loadRecordsFromDatabase = () => {    
    const url= origin+"/get_records"

    fetch(url)
      // During development, log any unexpected responses
      .then(response => response.text())
      .then(text => {
        try {
          const json = JSON.parse(text)
          return json
        } catch {
          console.log("text:", text)
        }
      })
      // .then(response => response.json()) // use in production
      .then(treatRecords)
      .catch(error => console.log("error:", error))
  }


  const addRecord = record => {
    console.log("record:", record)

    const url = `${origin}/add_record`
    const headers = { 'Content-Type': 'application/json' }

    const body = JSON.stringify(record)

    fetch(url, {
      method: 'POST',
      headers,
      body,
    })
      .then(incoming => incoming.json())
      .then(json => treatSavedRecord(json))
      .catch(treatError)
  }


  const treatSavedRecord = json => {
    setRecords([ ...records, json.record ])
    console.log("json", JSON.stringify(json, null, '  '));
  }
  

  const treatError = error => {
    console.log("addRecord error:", error)
  }


  useEffect(loadRecordsFromDatabase, [])


  return (
    <RecordsContext.Provider
      value ={{
        records,
        addRecord
      }}
    >
      {children}
    </RecordsContext.Provider>
  )
}


export default {
  label: "Records",
  Context: RecordsContext,
  Provider: RecordsProvider
}