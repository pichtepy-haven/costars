import React from 'react'
import Hero from '../components/home/Hero.jsx'
import Marquee from '../components/home/Marquee.jsx'
import Schedule from '../components/home/Schedule.jsx'
import ActsShowcase from '../components/home/ActsShowcase.jsx'
import CharityHighlight from '../components/home/CharityHighlight.jsx'
import MoreForEvening from '../components/home/MoreForEvening.jsx'
import Sponsors from '../components/home/Sponsors.jsx'

/** The guide: welcome, running order, the three acts, charity, and help. */
export default function HomeView({ live, agendaOpenId, setAgendaOpenId, supportOpenId, setSupportOpenId }) {
  return (
    <>
      <Hero live={live} />
      <Marquee />
      <Schedule live={live} openId={agendaOpenId} setOpenId={setAgendaOpenId} />
      <ActsShowcase live={live} />
      <CharityHighlight />
      <Sponsors />
      <MoreForEvening openId={supportOpenId} setOpenId={setSupportOpenId} />
    </>
  )
}
