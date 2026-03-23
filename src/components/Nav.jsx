/**
 * frontend/src/modules/Nav.jsx
 */


import { useState } from 'react'
import { useTranslation } from 'react-i18next';
import { getContextValues } from '../state'



export default function Nav({ disabled, setTab }) {
  const { t } = useTranslation()
  const {
    language,  // "en"
    languages, // { en: { name: "English", flag: <path> }, ...}
    changeLanguage // function
  } = getContextValues("I18nContext")


  const tabNames = [
    t("teacher.management.classroom"),
    t("teacher.management.activities")
  ]
  const [ selectedTab, selectTab ] = useState(0)


  const flags = Object.entries(languages).map(([code, data ]) => {
    const { name, flag } = data
    const flagClass = (code !== language) ? "hide" : null
    return (
      <li
        key={code}
        data-code={code}
        className={flagClass}
      >
        <img src={flag} alt={name} title={name}/>
      </li>
    )
  })


  const chooseLanguage = ({ target }) => {
    target = target.closest("li")
    const { code } = target.dataset
    changeLanguage(code)
  }


  const switchTab = ({ target }) => {
    if (!setTab) { return }

    const tab = Number(target.dataset.tab)
    selectTab(tab)
    setTab(tab)
  }


  const nav = tabNames.map(( tab, index ) => {
    const tabClass = disabled
      ? "disabled"
      : (index === selectedTab)
        ? "selected"
        : null

    return (
      <li
        key={tab}
        className={tabClass}
        data-tab={index}
      >
        {tab}
      </li>
    )
  })


  return (
    <div
      className="menu-bar"
    >
      <ul
        className="nav"
        onClick={switchTab}
      >
        {nav}
      </ul>
      <ul
        className="language"
        onClick={chooseLanguage}
      >
        {flags}
      </ul>
    </div>
  )
}