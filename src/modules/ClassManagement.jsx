/**
 * frontend/src/modules/ClassManagement.jsx
 */


import { useTranslation, Trans } from 'react-i18next';


export default function ClassManagement(props) {
  const { t } = useTranslation()


  return (
    <h1>{t("teacher.management.classroom")}</h1>
  )
}