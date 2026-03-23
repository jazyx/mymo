/**
 * frontend/src/modules/ActivityManagement.jsx
 */


import { useTranslation, Trans } from 'react-i18next';


export default function ActivityManagement(props) {
  const { t } = useTranslation()


  return (
    <h1>{t("teacher.management.activities")}</h1>
  )
}