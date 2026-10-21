import React from 'react'
import Hero from '../components/Hero.jsx'
import Shortcuts from '../components/Shortcuts.jsx'
import Schedule from '../components/Schedule.jsx'
import AgendaHighlights from '../components/AgendaHighlights.jsx'
import CharityImpact from '../components/CharityImpact.jsx'
import MoreInfo from '../components/MoreInfo.jsx'
import SectionDivider from '../components/SectionDivider.jsx'

export default function HomeView({ live, agendaOpenId, setAgendaOpenId, supportOpenId, setSupportOpenId }) {
  return (
    <>
      <Hero />
      <Shortcuts />
      <Schedule openId={agendaOpenId} setOpenId={setAgendaOpenId} live={live} />
      <SectionDivider />
      <AgendaHighlights live={live} />
      <SectionDivider />
      <CharityImpact />
      <MoreInfo openId={supportOpenId} setOpenId={setSupportOpenId} />
    </>
  )
}
