import {
  DoorOpen, Mic, Crown, Piano, MicVocal, Coffee, HeartHandshake, HandHeart,
  Backpack, School, Music, Landmark, UsersRound, Heart, Sparkles,
} from 'lucide-react'

/** Icon names that can be used in src/data.js */
export const icons = {
  door: DoorOpen,
  mic: Mic,
  crown: Crown,
  piano: Piano,
  'mic-vocal': MicVocal,
  coffee: Coffee,
  'heart-handshake': HeartHandshake,
  'hand-heart': HandHeart,
  backpack: Backpack,
  school: School,
  music: Music,
  culture: Landmark,
  community: UsersRound,
  charity: Heart,
}

export const getIcon = (name) => icons[name] || Sparkles
